import { ITherapyPlan } from '../models/TherapyPlan';

export interface QualityGateResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
}

export const checkTherapyPlanCompleteness = (plan: Partial<ITherapyPlan>): QualityGateResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!plan.goals || plan.goals.length === 0) {
    errors.push('Therapy plan must have at least one goal.');
  } else {
    plan.goals.forEach((goal, idx) => {
      if (!goal.title) errors.push(`Goal ${idx + 1} is missing a title.`);
      if (!goal.baseline) errors.push(`Goal ${idx + 1} is missing a baseline measurement.`);
      if (!goal.target) errors.push(`Goal ${idx + 1} is missing a measurable target.`);
      if (!goal.expectedOutcome) errors.push(`Goal ${idx + 1} is missing an expected outcome.`);
      if (!goal.frequency) errors.push(`Goal ${idx + 1} is missing frequency.`);
      
      if (!goal.activities || goal.activities.length === 0) {
        errors.push(`Goal ${idx + 1} must have at least one activity.`);
      }

      // Simple consistency check: target should look like it's measurable (contains % or out of)
      if (goal.target && !/(%|percent|out of|\/)/i.test(goal.target)) {
        warnings.push(`Goal ${idx + 1} target might not be objectively measurable. Ensure it has a clear metric (e.g., 80%).`);
      }
    });
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
};
