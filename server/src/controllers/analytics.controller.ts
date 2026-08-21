import { Request, Response } from 'express';
import Case from '../models/Case';
import Patient from '../models/Patient';
import Session from '../models/Session';
import Evaluation from '../models/Evaluation';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/analytics/summary
 * Returns aggregated statistics calculated from MongoDB collections.
 * Used by the frontend AnalyticsView and dashboard stats.
 */
export const getAnalyticsSummary = async (req: AuthRequest, res: Response) => {
  try {
    // ── Case counts ────────────────────────────────────────────────────────
    const totalCases = await Case.countDocuments();
    const activeCases = await Case.countDocuments({
      status: { $in: ['ALLOCATED', 'PLAN_PENDING', 'SUPERVISOR_REVIEW', 'APPROVED', 'IN_THERAPY'] }
    });
    const milestoneCases = await Case.countDocuments({ status: 'MILESTONE_DUE' });
    const completedCases = await Case.countDocuments({ status: 'COMPLETED' });
    const discontinuedCases = await Case.countDocuments({ status: 'DISCONTINUED' });

    // Priority breakdown
    const highPriorityCases = await Case.countDocuments({ priority: 'High' });
    const amberPriorityCases = await Case.countDocuments({ priority: 'Amber' });
    const normalPriorityCases = await Case.countDocuments({ priority: 'Normal' });

    // ── Sessions this week ─────────────────────────────────────────────────
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const sessionsThisWeek = await Session.countDocuments({ date: { $gte: weekStart } });

    // ── Average patient progress ───────────────────────────────────────────
    const patients = await Patient.find({}, 'progressPct therapyLanguage status');
    const avgProgress = patients.length > 0
      ? Math.round(patients.reduce((sum, p) => sum + (p.progressPct || 0), 0) / patients.length)
      : 0;

    // ── Patients needing reports (milestone due, reports pending) ──────────
    const reportsDue = await Case.countDocuments({ status: 'MILESTONE_DUE' });

    // ── Supervisor evaluation average ──────────────────────────────────────
    const evaluations = await Evaluation.find({}, 'overallRating');
    const avgSupervisorRating = evaluations.length > 0
      ? Math.round((evaluations.reduce((sum, e) => sum + (e.overallRating || 0), 0) / evaluations.length) * 10) / 10
      : 0;

    // ── Plans awaiting supervisor review ──────────────────────────────────
    const plansAwaitingReview = await Case.countDocuments({ status: 'SUPERVISOR_REVIEW' });

    // ── Language distribution from patients ───────────────────────────────
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

    // ── Phoneme progress from patients ────────────────────────────────────
    const phonemeCounts: Record<string, { totalBaseline: number; totalCurrent: number; count: number }> = {};
    for (const p of await Patient.find({}, 'targetSound baselineScores currentScores progressPct')) {
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
