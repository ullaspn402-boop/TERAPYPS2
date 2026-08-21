import { Request, Response } from 'express';
import Case from '../models/Case';
import Patient from '../models/Patient';
import Session from '../models/Session';
import Evaluation from '../models/Evaluation';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/analytics/summary
 * Returns aggregated statistics calculated from MongoDB collections,
 * filtered by the authenticated user's role and ownership.
 *
 * - student_therapist: sees only their own cases/patients
 * - supervisor: sees only cases assigned to them
 * - admin: sees all (global)
 */
export const getAnalyticsSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    // ── Build role-scoped case and patient filters ─────────────────────────
    let caseFilter: any = {};
    let patientFilter: any = {};

    if (role === 'student_therapist') {
      caseFilter = { therapistId: userId };
      patientFilter = { assignedTherapistId: userId };
    } else if (role === 'supervisor') {
      caseFilter = { supervisorId: userId };
      // Patients linked to this supervisor's cases
      const supervisorCases = await Case.find({ supervisorId: userId }).select('patientId');
      const supervisorPatientIds = supervisorCases.map(c => c.patientId);
      patientFilter = { _id: { $in: supervisorPatientIds } };
    } else {
      // Admin — global view
      caseFilter = {};
      patientFilter = {};
    }

    // ── Case counts ────────────────────────────────────────────────────────
    const totalCases = await Case.countDocuments(caseFilter);
    const activeCases = await Case.countDocuments({
      ...caseFilter,
      status: { $in: ['ALLOCATED', 'PLAN_PENDING', 'SUPERVISOR_REVIEW', 'APPROVED', 'IN_THERAPY'] }
    });
    const milestoneCases = await Case.countDocuments({ ...caseFilter, status: 'MILESTONE_DUE' });
    const completedCases = await Case.countDocuments({ ...caseFilter, status: 'COMPLETED' });
    const discontinuedCases = await Case.countDocuments({ ...caseFilter, status: 'DISCONTINUED' });

    // Priority breakdown
    const highPriorityCases = await Case.countDocuments({ ...caseFilter, priority: 'High' });
    const amberPriorityCases = await Case.countDocuments({ ...caseFilter, priority: 'Amber' });
    const normalPriorityCases = await Case.countDocuments({ ...caseFilter, priority: 'Normal' });

    // ── Sessions this week (scoped to user's patients) ──────────────────────
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let sessionFilter: any = { date: { $gte: weekStart } };
    if (role === 'student_therapist') {
      sessionFilter.therapistId = userId;
    } else if (role === 'supervisor') {
      const supervisorCaseIds = (await Case.find({ supervisorId: userId }).select('_id')).map(c => c._id);
      sessionFilter.caseId = { $in: supervisorCaseIds };
    }
    const sessionsThisWeek = await Session.countDocuments(sessionFilter);

    // ── Average patient progress (scoped) ──────────────────────────────────
    const patients = await Patient.find(patientFilter, 'progressPct therapyLanguage status');
    const avgProgress = patients.length > 0
      ? Math.round(patients.reduce((sum, p) => sum + (p.progressPct || 0), 0) / patients.length)
      : 0;

    // ── Reports due (scoped) ───────────────────────────────────────────────
    const reportsDue = await Case.countDocuments({ ...caseFilter, status: 'MILESTONE_DUE' });

    // ── Supervisor evaluation average (scoped for student / global for admin/supervisor) ──
    let evalFilter: any = {};
    if (role === 'student_therapist') evalFilter = { therapistId: userId };
    const evaluations = await Evaluation.find(evalFilter, 'overallRating');
    const avgSupervisorRating = evaluations.length > 0
      ? Math.round((evaluations.reduce((sum, e) => sum + (e.overallRating || 0), 0) / evaluations.length) * 10) / 10
      : 0;

    // ── Plans awaiting supervisor review (scoped) ──────────────────────────
    const plansAwaitingReview = await Case.countDocuments({ ...caseFilter, status: 'SUPERVISOR_REVIEW' });

    // ── Language distribution from scoped patients ─────────────────────────
    const langCounts: Record<string, number> = {};
    for (const p of patients) {
      if (p.therapyLanguage) {
        const lang = p.therapyLanguage.trim();
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      }
    }
    const langDistribution = Object.entries(langCounts)
      .map(([language, count]) => ({
        language,
        count,
        percent: patients.length > 0 ? Math.round((count / patients.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // ── Phoneme progress from scoped patients ──────────────────────────────
    const phonemeCounts: Record<string, { totalBaseline: number; totalCurrent: number; count: number }> = {};
    for (const p of await Patient.find(patientFilter, 'targetSound baselineScores currentScores progressPct')) {
      if (p.targetSound) {
        const sound = p.targetSound.trim();
        if (!phonemeCounts[sound]) phonemeCounts[sound] = { totalBaseline: 0, totalCurrent: 0, count: 0 };
        const baseline = p.baselineScores?.sentence || 0;
        const current = p.currentScores?.sentence || p.progressPct || 0;
        phonemeCounts[sound].totalBaseline += baseline;
        phonemeCounts[sound].totalCurrent += current;
        phonemeCounts[sound].count++;
      }
    }
    const phonemeProgress = Object.entries(phonemeCounts).map(([sound, data]) => ({
      sound,
      avgBaseline: data.count > 0 ? Math.round(data.totalBaseline / data.count) : 0,
      avgCurrent: data.count > 0 ? Math.round(data.totalCurrent / data.count) : 0,
      count: data.count,
    }));

    res.json({
      success: true,
      data: {
        cases: {
          total: totalCases,
          active: activeCases,
          milestoneDue: milestoneCases,
          completed: completedCases,
          discontinued: discontinuedCases,
          highPriority: highPriorityCases,
          amberPriority: amberPriorityCases,
          normalPriority: normalPriorityCases,
        },
        sessions: {
          thisWeek: sessionsThisWeek,
        },
        patients: {
          total: patients.length,
          avgProgress,
        },
        reports: {
          due: reportsDue,
        },
        plansAwaitingReview,
        avgSupervisorRating,
        langDistribution,
        phonemeProgress,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
