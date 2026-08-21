import { Request, Response } from 'express';
import {
  getAIResponse,
  generateAssistantResponse,
  runAdaptiveTherapyEngine,
  generateProgressSummary,
  checkPlanQuality,
  PatientContext,
  SessionData,
} from '../services/ai.service';
import AIActivity from '../models/AIActivity';
import Patient from '../models/Patient';
import Session from '../models/Session';
import Case from '../models/Case';
import TherapyPlan from '../models/TherapyPlan';
import User from '../models/User';
import ProgressReport from '../models/ProgressReport';
import { calculateCasePriority } from '../services/priorityEngine.service';
import { calculateAllocationRecommendations } from '../services/allocationEngine.service';

// ─── Default AI Activities (seeded on first use) ──────────────────────────────

const DEFAULT_AI_ACTIVITIES = [
  {
    activityId: 'act-1',
    title: 'Structured /r/ Minimal Pair Contrast (/t/ vs /tr/)',
    level: 'Sentence',
    description: 'Visual biofeedback contrasting minimal pairs such as "tie" vs "try", "pay" vs "pray" to isolate cluster timing.',
    clinicalRationale: 'Contrastive pairs isolate the voicing timing difference in consonant cluster contexts, reducing substitution patterns.',
    targetPhoneme: '/r/ cluster',
    recommendedDuration: '12 mins',
    status: 'approved',
  },
  {
    activityId: 'act-2',
    title: 'Carrier Sentence Pacing Drill in Telugu',
    level: 'Sentence',
    description: 'Carrier sentences: "రాము ___ చూశాడు" (Ramu saw ___) with target rhotic noun cards.',
    clinicalRationale: 'Carrier phrases stabilize coarticulatory control without exceeding cognitive processing capacity.',
    targetPhoneme: '/r/ initial & medial',
    recommendedDuration: '15 mins',
    status: 'approved',
  },
  {
    activityId: 'act-3',
    title: 'Picture Narrative with Guided Rhotic Obstacles',
    level: 'Conversation',
    description: 'Interactive scene description of a river valley park featuring rhotic landmarks (river, bridge, rocks).',
    clinicalRationale: 'Bridges structured carrier gains to spontaneous connected discourse. Functional generalization context.',
    targetPhoneme: '/r/ connected speech',
    recommendedDuration: '10 mins',
    status: 'suggested',
  },
];

// ─── Helper: Map Mongoose patient doc → PatientContext ────────────────────────

function mapToPatientContext(dbPatient: any): PatientContext {
  return {
    name: dbPatient.name || 'Patient',
    caseId: dbPatient.caseId || 'N/A',
    targetSound: dbPatient.targetSound || '/r/',
    currentLevel: dbPatient.currentLevel || 'Sentence',
    progressPct: dbPatient.progressPct || 0,
    sessionCount: dbPatient.sessionCount || 0,
    totalTargetSessions: dbPatient.totalTargetSessions || 16,
    attendancePct: dbPatient.attendancePct ?? 100,
    therapyLanguage: dbPatient.therapyLanguage || 'English',
    diagnosis: dbPatient.diagnosis || 'Articulation disorder',
    currentScores: {
      sound: dbPatient.currentScores?.sound ?? 0,
      syllable: dbPatient.currentScores?.syllable ?? 0,
      word: dbPatient.currentScores?.word ?? 0,
      sentence: dbPatient.currentScores?.sentence ?? 0,
      conversation: dbPatient.currentScores?.conversation ?? 0,
    },
    baselineScores: {
      sound: dbPatient.baselineScores?.sound ?? 0,
      syllable: dbPatient.baselineScores?.syllable ?? 0,
      word: dbPatient.baselineScores?.word ?? 0,
      sentence: dbPatient.baselineScores?.sentence ?? 0,
      conversation: dbPatient.baselineScores?.conversation ?? 0,
    },
    goals: (dbPatient.goals || []).map((g: any) => ({
      title: g.title || 'Goal',
      baselinePct: g.baselinePct ?? 0,
      currentPct: g.currentPct ?? 0,
      targetPct: g.targetPct ?? 80,
      status: g.status || 'In Progress',
    })),
    recentObservation: dbPatient.recentObservation || '',
    suggestedFocus: dbPatient.suggestedFocus || [],
    historicalProgress: dbPatient.historicalProgress || [],
    nextSessionDate: dbPatient.nextSessionDate,
  } as PatientContext;
}

function mapToSessionData(dbSession: any): SessionData {
  return {
    sessionNumber: dbSession.sessionNumber || 0,
    speechPerformanceScore: dbSession.speechPerformanceScore || 0,
    phonemeAccuracyScore: dbSession.phonemeAccuracyScore || 0,
    level: dbSession.level || 'Sentence',
    targetSound: dbSession.targetSound || '/r/',
    soapNotes: dbSession.soapNotes || {},
    therapistConfidence: dbSession.therapistConfidence || 5,
    attendance: dbSession.attendance || 'Present',
  };
}

// ─── POST /api/ai/assistant ────────────────────────────────────────────────────

export const askAssistant = async (req: Request, res: Response) => {
  try {
    const { prompt, context, patientId } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });

    let responseText: string;

    // If patientId provided, use full patient context from DB
    if (patientId) {
      const dbPatient = await Patient.findById(patientId).lean();
      if (dbPatient) {
        const recentDbSessions = await Session.find({ patientId: dbPatient._id })
          .sort({ date: -1 })
          .limit(5)
          .lean();
        const patientCtx = mapToPatientContext(dbPatient);
        const sessions = recentDbSessions.map(mapToSessionData);
        responseText = generateAssistantResponse(prompt, patientCtx, sessions);
      } else {
        // Fall back to legacy context-string approach
        responseText = await getAIResponse(prompt, context || '');
      }
    } else {
      // Legacy: context string only
      responseText = await getAIResponse(prompt, context || '');
    }

    res.json({ success: true, data: { response: responseText } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/ai/activities ────────────────────────────────────────────────────

export const getAIActivities = async (req: Request, res: Response) => {
  try {
    let activities = await AIActivity.find().sort({ createdAt: 1 });
    if (activities.length === 0) {
      for (const act of DEFAULT_AI_ACTIVITIES) {
        await AIActivity.findOneAndUpdate(
          { activityId: act.activityId },
          { $setOnInsert: act },
          { upsert: true, new: true }
        );
      }
      activities = await AIActivity.find().sort({ createdAt: 1 });
    }
    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── PUT /api/ai/activities/:id ────────────────────────────────────────────────

export const updateAIActivityStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    let activity = await AIActivity.findOne({ activityId: req.params.id });
    if (!activity) {
      activity = await AIActivity.findById(req.params.id);
    }

    if (!activity) {
      const defaultAct = DEFAULT_AI_ACTIVITIES.find((a) => a.activityId === req.params.id);
      if (defaultAct) {
        activity = await AIActivity.create({ ...defaultAct, status });
      } else {
        return res.status(404).json({ success: false, error: 'Activity not found' });
      }
    } else {
      activity.status = status;
      await activity.save();
    }

    res.json({ success: true, data: activity });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/ai/plan-quality ─────────────────────────────────────────────────

/**
 * AI Plan Quality Check
 * Body: { planId } OR { plan: { goals: [...] } }
 * Returns: quality score, checklist, errors, warnings, suggestions
 */
export const checkPlanQualityHandler = async (req: Request, res: Response) => {
  try {
    const { planId, plan: inlinePlan } = req.body;

    let planData: any = inlinePlan;

    if (planId && !planData) {
      const dbPlan = await TherapyPlan.findById(planId).lean();
      if (!dbPlan) return res.status(404).json({ success: false, error: 'Therapy plan not found' });
      planData = dbPlan;
    }

    if (!planData) {
      return res.status(400).json({ success: false, error: 'planId or plan object required' });
    }

    const result = checkPlanQuality(planData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/ai/adaptive-therapy ────────────────────────────────────────────

/**
 * Adaptive Therapy Engine
 * Body: { patientId }
 * Returns: AdaptiveRecommendation with current level, suggested level, reason, activities
 */
export const getAdaptiveTherapyRecommendation = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ success: false, error: 'patientId is required' });

    let dbPatient: any = await Patient.findById(patientId).lean();
    if (!dbPatient) {
      dbPatient = await Patient.findOne({ patientId }).lean();
    }
    if (!dbPatient) return res.status(404).json({ success: false, error: 'Patient not found' });

    const recentDbSessions = await Session.find({ patientId: dbPatient._id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const patientCtx = mapToPatientContext(dbPatient);
    const sessions = recentDbSessions.map(mapToSessionData);
    const recommendation = runAdaptiveTherapyEngine(patientCtx, sessions);

    res.json({ success: true, data: recommendation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/ai/progress-summary ────────────────────────────────────────────

/**
 * AI Progress Summary
 * Body: { patientId, sessionRange?: { start: number, end: number } }
 * Returns: ProgressSummary with goals progress, trends, areas of improvement/practice
 */
export const generateProgressSummaryHandler = async (req: Request, res: Response) => {
  try {
    const { patientId, sessionRange } = req.body;
    if (!patientId) return res.status(400).json({ success: false, error: 'patientId is required' });

    let dbPatient: any = await Patient.findById(patientId).lean();
    if (!dbPatient) {
      dbPatient = await Patient.findOne({ patientId }).lean();
    }
    if (!dbPatient) return res.status(404).json({ success: false, error: 'Patient not found' });

    const sessionsQuery: any = { patientId: dbPatient._id };
    const dbSessions = await Session.find(sessionsQuery).sort({ sessionNumber: 1 }).lean();

    const patientCtx = mapToPatientContext(dbPatient);
    const sessions = dbSessions.map(mapToSessionData);
    const summary = generateProgressSummary(patientCtx, sessions, sessionRange);

    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/ai/supervisor-priority ──────────────────────────────────────────

/**
 * Supervisor Priority Intelligence — Bulk
 * Calculates priority for all active cases using the rule-based priority engine.
 * Returns: array of PriorityResult sorted by priorityScore desc
 */
export const getSupervisorPriority = async (req: Request, res: Response) => {
  try {
    const cases = await Case.find({
      status: {
        $nin: ['COMPLETED', 'DISCONTINUED'],
      },
    }).lean();

    const results = await Promise.all(
      cases.map(async (caseItem: any) => {
        try {
          const patient = await Patient.findById(caseItem.patientId).lean() as any;
          if (!patient) return null;

          const recentSessions = await Session.find({ caseId: caseItem._id })
            .sort({ date: -1 })
            .limit(3)
            .lean() as any[];

          const therapyPlan = await TherapyPlan.findOne({ caseId: caseItem._id }).lean() as any;

          const priority = calculateCasePriority(patient, caseItem as any, recentSessions, therapyPlan);

          return {
            ...priority,
            patientName: patient.name,
            patientId: patient._id,
            caseId: caseItem.caseId,
            caseDbId: caseItem._id,
            currentLevel: patient.currentLevel,
            sessionCount: patient.sessionCount,
            progressPct: patient.progressPct,
          };
        } catch {
          return null;
        }
      })
    );

    const filtered = results
      .filter(Boolean)
      .sort((a: any, b: any) => b.priorityScore - a.priorityScore);

    res.json({ success: true, data: filtered });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/ai/supervisor-priority/:caseId ──────────────────────────────────

/**
 * Supervisor Priority Intelligence — Single Case
 */
export const getSupervisorPriorityForCase = async (req: Request, res: Response) => {
  try {
    let caseItem: any = await Case.findById(req.params.caseId).lean();
    if (!caseItem) caseItem = await Case.findOne({ caseId: req.params.caseId }).lean();
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    const patient = await Patient.findById(caseItem.patientId).lean() as any;
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    const recentSessions = await Session.find({ caseId: caseItem._id })
      .sort({ date: -1 })
      .limit(3)
      .lean() as any[];

    const therapyPlan = await TherapyPlan.findOne({ caseId: caseItem._id }).lean() as any;
    const priority = calculateCasePriority(patient, caseItem as any, recentSessions, therapyPlan);

    res.json({
      success: true,
      data: {
        ...priority,
        patientName: patient.name,
        currentLevel: patient.currentLevel,
        sessionCount: patient.sessionCount,
        progressPct: patient.progressPct,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/ai/case-allocation ─────────────────────────────────────────────

/**
 * AI Case Allocation
 * Body: { caseId } OR { patientId }
 * Returns: Ranked therapist recommendations with match scores and reasoning.
 *
 * AI RECOMMENDS. Authorized users make the final allocation decision.
 * Does NOT automatically assign the case.
 */
export const getCaseAllocationHandler = async (req: Request, res: Response) => {
  try {
    const { caseId, patientId } = req.body;

    let caseItem: any = null;

    if (caseId) {
      caseItem = await Case.findById(caseId).lean();
      if (!caseItem) caseItem = await Case.findOne({ caseId }).lean();
    }

    if (!caseItem && patientId) {
      caseItem = await Case.findOne({ patientId }).lean();
    }

    if (!caseItem) {
      return res.status(400).json({ success: false, error: 'caseId or patientId required, and case must exist.' });
    }

    const patient = await Patient.findById(caseItem.patientId).lean() as any;
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    const therapists = await User.find({ role: 'student_therapist' }).lean() as any[];

    // Build supervisor capacity map: supervisorId → count of active students
    const supervisorCapacity: Record<string, number> = {};
    for (const t of therapists) {
      if (t.supervisorId) {
        const supId = t.supervisorId.toString();
        supervisorCapacity[supId] = (supervisorCapacity[supId] || 0) + (t.activeCaseload || 0);
      }
    }

    const recommendations = calculateAllocationRecommendations(patient, therapists, supervisorCapacity);

    // Enrich with supervisor names
    const enriched = await Promise.all(
      recommendations.map(async (rec) => {
        const therapistDoc = therapists.find((t) => t._id.toString() === rec.therapistId.toString());
        let supervisorName = 'Assigned Supervisor';
        if (therapistDoc?.supervisorId) {
          const sup = await User.findById(therapistDoc.supervisorId).select('name').lean() as any;
          if (sup) supervisorName = sup.name;
        }
        return {
          ...rec,
          availability: therapistDoc?.availability || 'Standard Hours',
          supervisorName,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
      meta: {
        caseId: caseItem.caseId,
        patientName: patient.name,
        targetSound: patient.targetSound,
        diagnosis: patient.diagnosis,
        disclaimer: 'AI recommends. The final allocation decision must be made by an authorized supervisor.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
