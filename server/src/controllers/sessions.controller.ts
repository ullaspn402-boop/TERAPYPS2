import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Session from '../models/Session';
import Patient from '../models/Patient';
import Case from '../models/Case';
import ProgressReport from '../models/ProgressReport';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { patientId, caseId, ...sessionData } = req.body;

    let targetPatientId = patientId;
    let patient = await Patient.findById(targetPatientId);
    if (!patient && targetPatientId) {
      patient = await Patient.findOne({ patientId: targetPatientId });
      if (patient) targetPatientId = patient._id;
    }
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    let targetCaseId = caseId;
    if (!targetCaseId && patient.caseId) {
      const caseItem = await Case.findOne({ caseId: patient.caseId });
      if (caseItem) targetCaseId = caseItem._id;
    }

    const session = await Session.create({
      patientId: targetPatientId,
      caseId: targetCaseId,
      therapistId: (req as any).user._id,
      sessionNumber: (patient.sessionCount || 0) + 1,
      date: sessionData.date ? new Date(sessionData.date) : new Date(),
      ...sessionData
    });

    patient.sessionCount = (patient.sessionCount || 0) + 1;
    patient.recentSessionDate = session.date;

    // Update progress/history logic based on score
    if (session.speechPerformanceScore > 0) {
      if (!patient.historicalProgress) {
        patient.historicalProgress = [];
      }
      patient.historicalProgress.push({
        session: `S${patient.sessionCount}`,
        score: session.speechPerformanceScore,
        targetScore: 80,
        level: session.level
      });
      if (patient.currentScores) {
        patient.currentScores.sentence = session.speechPerformanceScore;
      }
    }

    await patient.save();

    // 10-Session Milestone Check
    if (patient.sessionCount % 10 === 0 && targetCaseId) {
      const caseItem = await Case.findById(targetCaseId);
      if (caseItem) {
        caseItem.status = 'MILESTONE_DUE';
        await caseItem.save();

        // Auto-create draft ProgressReport
        await ProgressReport.create({
          patientId: patient._id,
          caseId: caseItem._id,
          therapistId: (req as any).user._id,
          supervisorId: caseItem.supervisorId,
          sessionRange: { start: patient.sessionCount - 9, end: patient.sessionCount },
          initialAssessmentSummary: patient.initialNotes || 'No initial notes available.',
          goalsProgress: (patient.goals || []).map(g => ({
            goalTitle: g.title,
            baselinePct: g.baselinePct,
            currentPct: g.currentPct,
            status: g.status
          })),
          baselineScores: patient.baselineScores,
          currentScores: patient.currentScores,
          attendancePct: patient.attendancePct,
          trendAnalysis: 'Auto-generated draft: Patient has reached the 10-session milestone.',
          therapistObservations: session.soapNotes?.assessment || '',
          status: 'Draft'
        });
      }
    }

    res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSessionsByPatient = async (req: Request, res: Response) => {
  try {
    let pId = req.params.patientId;
    if (!mongoose.Types.ObjectId.isValid(pId)) {
      const patient = await Patient.findOne({ patientId: pId });
      if (patient) {
        pId = patient._id.toString();
      }
    }

    const sessions = await Session.find({ patientId: pId })
      .populate('therapistId', 'name role avatarType')
      .populate('supervisorFeedback.supervisorId', 'name title avatarType')
      .sort({ sessionNumber: 1 });

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

