import { IPatient } from '../models/Patient';
import { ICase } from '../models/Case';
import { ISession } from '../models/Session';
import { ITherapyPlan } from '../models/TherapyPlan';

export interface PriorityResult {
  caseId: string;
  priorityScore: number;
  priorityLevel: 'HIGH' | 'REVIEW_SOON' | 'NORMAL';
  reasons: string[];
  recommendedAction: string;
}

export const calculateCasePriority = (
  patient: IPatient,
  caseInfo: ICase,
  recentSessions: ISession[],
  therapyPlan?: ITherapyPlan
): PriorityResult => {
  let score = 0;
  const reasons: string[] = [];
  let recommendedAction = 'Continue current therapy plan.';

  // Progress Plateau / Decline (+25)
  if (recentSessions.length >= 3) {
    const scores = recentSessions.map(s => s.speechPerformanceScore);
    const isPlateau = scores.slice(0, 3).every(s => Math.abs(s - scores[0]) <= 5 && s < 85);
    const isDecline = scores[0] < scores[1] && scores[1] < scores[2] && scores[2] - scores[0] > 10;
    
    if (isPlateau) {
      score += 25;
      reasons.push('Progress plateau detected over last 3 sessions');
      recommendedAction = 'Review therapy plan and consider adaptive changes or new stimuli.';
    } else if (isDecline) {
      score += 25;
      reasons.push('Progress decline detected');
      recommendedAction = 'Immediate review required. Check patient engagement and stimulus difficulty.';
    }
  }

  // 10-Session Milestone (+20)
  if (patient.sessionCount > 0 && patient.sessionCount % 10 === 0) {
    score += 20;
    reasons.push('10-session milestone reached');
    recommendedAction = 'Complete 10-session progress report and schedule supervisor review.';
  }

  // Review Overdue (+20) - Example threshold: last session > 14 days ago
  if (patient.recentSessionDate) {
    const daysSince = (new Date().getTime() - patient.recentSessionDate.getTime()) / (1000 * 3600 * 24);
    if (daysSince > 14 && patient.status === 'Active') {
      score += 20;
      reasons.push(`Session review overdue (${Math.round(daysSince)} days)`);
    }
  }

  // Report Pending (+15)
  if (caseInfo.status === 'PROGRESS_REVIEW' || caseInfo.status === 'SUPERVISOR_REVIEW') {
    score += 15;
    reasons.push('Report or plan pending supervisor approval');
    recommendedAction = 'Supervisor needs to review pending submissions.';
  }

  // Goal Stagnation (+15)
  const stagnantGoals = patient.goals.filter(g => g.status === 'Plateau');
  if (stagnantGoals.length > 0) {
    score += 15;
    reasons.push(`Goal stagnation on ${stagnantGoals.length} goal(s)`);
  }

  // Low confidence (+10)
  if (recentSessions.length > 0 && recentSessions[0].therapistConfidence <= 2) {
    score += 10;
    reasons.push('Low therapist confidence reported in last session');
  }

  // Attendance issue (+10)
  if (patient.attendancePct < 75) {
    score += 10;
    reasons.push('Consistent attendance issues (<75%)');
  }

  // Determine Level
  let level: 'HIGH' | 'REVIEW_SOON' | 'NORMAL' = 'NORMAL';
  if (score >= 60) level = 'HIGH';
  else if (score >= 30) level = 'REVIEW_SOON';

  return {
    caseId: caseInfo.caseId,
    priorityScore: score,
    priorityLevel: level,
    reasons,
    recommendedAction
  };
};
