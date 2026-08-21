/**
 * SpeechCare AI — Local Rule-Based AI Service
 *
 * All AI logic is deterministic and rule-based.
 * No external API, no LLM, no Gemini, no API keys required.
 *
 * Human-in-the-loop: AI RECOMMENDS → Therapist/Supervisor DECIDES.
 *
 * Disclaimer: This is a clinical-support prototype.
 * All outputs are labelled as AI-Assisted Observations or AI Recommendations.
 * Outputs do not constitute clinical diagnosis or validated clinical opinion.
 */

// ─── Shared Constants ─────────────────────────────────────────────────────────

const PROGRESSION_THRESHOLD = 80; // % accuracy required before advancing a level
const PLATEAU_TOLERANCE = 5;      // % variance allowed before declaring plateau
const PLATEAU_MIN_SESSIONS = 3;   // sessions needed to confirm plateau

export const THERAPY_LEVELS = ['Sound', 'Syllable', 'Word', 'Sentence', 'Conversation'] as const;
export type TherapyLevel = typeof THERAPY_LEVELS[number];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientContext {
  name: string;
  caseId: string;
  targetSound: string;
  currentLevel: TherapyLevel;
  progressPct: number;
  sessionCount: number;
  totalTargetSessions: number;
  attendancePct: number;
  therapyLanguage: string;
  diagnosis: string;
  currentScores: { sound: number; syllable: number; word: number; sentence: number; conversation: number };
  baselineScores: { sound: number; syllable: number; word: number; sentence: number; conversation: number };
  goals: { title: string; baselinePct: number; currentPct: number; targetPct: number; status: string }[];
  recentObservation?: string;
  suggestedFocus?: string[];
  historicalProgress?: { session: string; score: number; targetScore: number; level: string }[];
  nextSessionDate?: Date | string;
}

export interface SessionData {
  sessionNumber: number;
  speechPerformanceScore: number;
  phonemeAccuracyScore: number;
  level: string;
  targetSound: string;
  soapNotes?: { subjective?: string; objective?: string; assessment?: string; plan?: string };
  therapistConfidence: number;
  attendance?: string;
}

export interface AdaptiveRecommendation {
  currentLevel: TherapyLevel;
  suggestedLevel: TherapyLevel | null;
  action: 'ADVANCE' | 'CONTINUE' | 'REINFORCE';
  reason: string;
  evidencePoints: string[];
  suggestedActivities: string[];
  disclaimer: string;
}

export interface ProgressSummary {
  overallProgress: string;
  sessionRange: string;
  goalsProgress: { goalTitle: string; baseline: number; current: number; target: number; status: string; observation: string }[];
  areasOfImprovement: string[];
  areasRequiringPractice: string[];
  suggestedFocus: string;
  trendAnalysis: string;
  attendanceNote: string;
  disclaimer: string;
}

export interface PlanQualityResult {
  qualityScore: number;
  passed: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  checklist: { label: string; passed: boolean }[];
  disclaimer: string;
}

// ─── AI FEATURE #1: Therapist Assistant ──────────────────────────────────────

/**
 * Deterministic AI Therapist Assistant.
 * Pattern-matches user prompt intent against known clinical topics.
 * Uses actual patient context to produce contextual responses.
 */
export const generateAssistantResponse = (
  prompt: string,
  patient: PatientContext,
  recentSessions: SessionData[] = []
): string => {
  const lp = prompt.toLowerCase();

  const levelIdx = THERAPY_LEVELS.indexOf(patient.currentLevel);
  const nextLevel = THERAPY_LEVELS[levelIdx + 1] || null;
  const prevLevel = THERAPY_LEVELS[levelIdx - 1] || null;

  const currentScore = (() => {
    switch (patient.currentLevel) {
      case 'Sound': return patient.currentScores.sound;
      case 'Syllable': return patient.currentScores.syllable;
      case 'Word': return patient.currentScores.word;
      case 'Sentence': return patient.currentScores.sentence;
      case 'Conversation': return patient.currentScores.conversation;
      default: return patient.progressPct;
    }
  })();

  const lastSession = recentSessions[0] || null;
  const recentScores = recentSessions.slice(0, 5).map(s => s.speechPerformanceScore);
  const avgRecent = recentScores.length > 0
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
    : currentScore;

  // ── Intent: Patient Summary ───────────────────────────────────────────────
  if (lp.includes('summarize') || lp.includes('summary') || lp.includes('clinical status') || lp.includes('overview')) {
    const goalsSummary = patient.goals.map(g =>
      `  • ${g.title}: Baseline ${g.baselinePct}% → Current ${g.currentPct}% (Target ${g.targetPct}%) [${g.status}]`
    ).join('\n') || '  • No goals defined yet.';

    return [
      `[AI-Assisted Clinical Summary — ${patient.name} | ${patient.caseId}]`,
      ``,
      `Diagnosis: ${patient.diagnosis}`,
      `Target Sound: ${patient.targetSound} | Therapy Language: ${patient.therapyLanguage}`,
      `Current Therapy Level: ${patient.currentLevel} | Overall Progress: ${patient.progressPct}%`,
      `Sessions Completed: ${patient.sessionCount} / ${patient.totalTargetSessions}`,
      `Attendance: ${patient.attendancePct}%`,
      ``,
      `Goal Progress:`,
      goalsSummary,
      ``,
      `AI-Assisted Observation: ${
        currentScore >= PROGRESSION_THRESHOLD
          ? `Performance at ${patient.currentLevel} level (${currentScore}%) meets the progression threshold. A structured-to-next-level transition should be considered.`
          : `Performance at ${patient.currentLevel} level (${currentScore}%) is below the progression threshold of ${PROGRESSION_THRESHOLD}%. Continued practice is recommended before advancement.`
      }`,
      ``,
      `[Prototype: This summary is algorithmically generated from stored data and requires therapist clinical validation.]`
    ].join('\n');
  }

  // ── Intent: Session Review ────────────────────────────────────────────────
  if (lp.includes('previous session') || lp.includes('last session') || lp.includes('session record') || lp.includes('review session')) {
    if (!lastSession) {
      return `[AI-Assisted Observation]\n\nNo session records found for ${patient.name}. Once sessions are logged, I can analyze performance trends, SOAP notes, and phoneme accuracy.`;
    }
    const soapStr = lastSession.soapNotes
      ? [
          lastSession.soapNotes.subjective ? `  S: ${lastSession.soapNotes.subjective}` : '',
          lastSession.soapNotes.objective ? `  O: ${lastSession.soapNotes.objective}` : '',
          lastSession.soapNotes.assessment ? `  A: ${lastSession.soapNotes.assessment}` : '',
          lastSession.soapNotes.plan ? `  P: ${lastSession.soapNotes.plan}` : '',
        ].filter(Boolean).join('\n')
      : '  SOAP notes not recorded.';

    return [
      `[AI-Assisted Previous Session Review — Session #${lastSession.sessionNumber}]`,
      ``,
      `Level: ${lastSession.level} | Target: ${lastSession.targetSound}`,
      `Speech Performance Score: ${lastSession.speechPerformanceScore}%`,
      `Phoneme Accuracy: ${lastSession.phonemeAccuracyScore}%`,
      `Therapist Confidence: ${lastSession.therapistConfidence}/10`,
      ``,
      `Session Notes (SOAP):`,
      soapStr,
      ``,
      `AI-Assisted Observation: ${
        lastSession.speechPerformanceScore >= PROGRESSION_THRESHOLD
          ? `Strong performance recorded. Scores suggest readiness for increased complexity.`
          : `Performance below target threshold. Continued structured drills at the current level are recommended.`
      }`,
      ``,
      `[Prototype: Requires therapist review and clinical validation.]`
    ].join('\n');
  }

  // ── Intent: Suggest Activities ────────────────────────────────────────────
  if (lp.includes('suggest') || lp.includes('activit') || lp.includes('exercise') || lp.includes('drill') || lp.includes('practice')) {
    const activities = generateActivitiesForLevel(patient.currentLevel, patient.targetSound, patient.therapyLanguage, currentScore);
    return [
      `[AI Recommendation — Therapy Activities for ${patient.name}]`,
      ``,
      `Target Sound: ${patient.targetSound} | Current Level: ${patient.currentLevel} | Score: ${currentScore}%`,
      ``,
      ...activities.map((a, i) => `Activity ${i + 1}:\n${a}`),
      ``,
      `AI Recommendation: ${
        currentScore >= PROGRESSION_THRESHOLD
          ? `Current level performance is strong. Consider integrating conversation-level activities to consolidate generalization.`
          : `Focus activities at the ${patient.currentLevel} level with increased stimulus frequency until the 80% threshold is consistently achieved.`
      }`,
      ``,
      `[Prototype: Activities are rule-generated. Please review and adapt for the individual patient.]`
    ].join('\n');
  }

  // ── Intent: Progress Explanation ─────────────────────────────────────────
  if (lp.includes('progress') || lp.includes('trend') || lp.includes('velocity') || lp.includes('score')) {
    const improving = recentScores.length >= 2 && recentScores[0] > recentScores[recentScores.length - 1];
    const plateau = recentScores.length >= 3 && recentScores.every(s => Math.abs(s - recentScores[0]) <= PLATEAU_TOLERANCE);

    return [
      `[AI-Assisted Progress Analysis — ${patient.name}]`,
      ``,
      `Baseline ${patient.currentLevel} Score: ${(patient.baselineScores as any)[patient.currentLevel.toLowerCase()] ?? 'N/A'}%`,
      `Current ${patient.currentLevel} Score: ${currentScore}%`,
      `Recent Average (last ${recentScores.length} sessions): ${avgRecent}%`,
      `Progression Threshold: ${PROGRESSION_THRESHOLD}%`,
      ``,
      `Score Breakdown by Level:`,
      `  Sound: ${patient.currentScores.sound}% | Syllable: ${patient.currentScores.syllable}% | Word: ${patient.currentScores.word}%`,
      `  Sentence: ${patient.currentScores.sentence}% | Conversation: ${patient.currentScores.conversation}%`,
      ``,
      `AI-Assisted Trend Observation: ${
        plateau
          ? `Performance has plateaued over recent sessions (variance ≤${PLATEAU_TOLERANCE}%). Consider modifying stimulus materials or therapy approach.`
          : improving
          ? `Positive trajectory detected. Performance is trending upward across recent sessions.`
          : `Scores are variable. Monitor for consistency before advancing to the next therapy level.`
      }`,
      ``,
      `[Prototype: Trend analysis is based on stored session scores. Clinical interpretation required.]`
    ].join('\n');
  }

  // ── Intent: Draft SOAP Note ───────────────────────────────────────────────
  if (lp.includes('soap') || lp.includes('session note') || lp.includes('draft note') || lp.includes('note')) {
    return [
      `[AI-Assisted SOAP Note Draft — ${patient.name} | ${new Date().toLocaleDateString()}]`,
      ``,
      `S (Subjective):`,
      `  Patient ${patient.name} presented for ${patient.currentLevel}-level ${patient.targetSound} practice.`,
      `  ${lastSession?.soapNotes?.subjective || 'Patient reported no concerns. Cooperation level: adequate.'}`,
      ``,
      `O (Objective):`,
      `  Target Sound: ${patient.targetSound} | Level: ${patient.currentLevel}`,
      `  Speech Performance Score: ${lastSession?.speechPerformanceScore ?? currentScore}%`,
      `  Phoneme Accuracy: ${lastSession?.phonemeAccuracyScore ?? 'N/A'}%`,
      `  Therapist Confidence: ${lastSession?.therapistConfidence ?? 'N/A'}/10`,
      ``,
      `A (Assessment):`,
      `  ${
        currentScore >= PROGRESSION_THRESHOLD
          ? `Performance meets the ${PROGRESSION_THRESHOLD}% progression threshold at the ${patient.currentLevel} level. Generalization activities are appropriate.`
          : `Performance (${currentScore}%) remains below the ${PROGRESSION_THRESHOLD}% threshold. Continued structured practice at this level is recommended.`
      }`,
      ``,
      `P (Plan):`,
      `  Continue ${patient.currentLevel}-level drills for ${patient.targetSound}.`,
      `  ${nextLevel ? `Target: advance to ${nextLevel} level when threshold is reached.` : 'Patient is at final therapy level. Focus on maintenance and generalization.'}`,
      `  Next session: ${patient.nextSessionDate ? new Date(patient.nextSessionDate as any).toLocaleDateString() : 'As scheduled.'}`,
      ``,
      `[Prototype SOAP draft. Must be reviewed, amended, and signed by the treating therapist.]`
    ].join('\n');
  }

  // ── Intent: Prepare Progress Summary ─────────────────────────────────────
  if (lp.includes('milestone') || lp.includes('10-session') || lp.includes('progress summary') || lp.includes('prepare')) {
    const isAtMilestone = patient.sessionCount > 0 && patient.sessionCount % 10 === 0;
    return [
      `[AI-Assisted 10-Session Progress Summary — ${patient.name} | Sessions 1–${patient.sessionCount}]`,
      ``,
      isAtMilestone
        ? `✅ Milestone Reached: ${patient.sessionCount} sessions completed.`
        : `ℹ️ Session count: ${patient.sessionCount}. Milestone at session ${Math.ceil(patient.sessionCount / 10) * 10}.`,
      ``,
      `Overall Progress: ${patient.progressPct}% (from baseline)`,
      `Current Level: ${patient.currentLevel} | Current Score: ${currentScore}%`,
      `Attendance: ${patient.attendancePct}%`,
      ``,
      `Goal Progress:`,
      ...patient.goals.map(g =>
        `  • ${g.title}: ${g.baselinePct}% → ${g.currentPct}% (Target: ${g.targetPct}%) — ${g.status}`
      ),
      ``,
      `AI Recommendation: ${
        patient.progressPct >= 70
          ? `Strong overall progress. Continue current therapy plan with planned level advancement.`
          : patient.progressPct >= 40
          ? `Moderate progress. Consider reviewing therapy plan goals and stimuli variety.`
          : `Progress is below expected level. Supervisor review recommended.`
      }`,
      ``,
      `[Prototype: This summary is auto-generated from stored data. The treating therapist must review and clinically validate before submission.]`
    ].join('\n');
  }

  // ── Default: Helpful Guidance ─────────────────────────────────────────────
  return [
    `[AI Decision Support — ${patient.name} | ${patient.caseId}]`,
    ``,
    `I am analyzing stored data for ${patient.name} (${patient.targetSound}, ${patient.currentLevel} level, ${currentScore}% score).`,
    ``,
    `I can assist with:`,
    `  • Patient summary — "Summarize clinical status"`,
    `  • Session review — "Review previous sessions"`,
    `  • Activity suggestions — "Suggest ${patient.targetSound} activities"`,
    `  • Progress analysis — "Explain progress trends"`,
    `  • SOAP note draft — "Draft session note"`,
    `  • Milestone summary — "Prepare 10-session progress summary"`,
    ``,
    `[Prototype: Rule-based AI assistance. All outputs require therapist review and approval.]`
  ].join('\n');
};

// ─── AI FEATURE #2: Case Allocation (Local Rule-Based) ────────────────────────
// Implemented in allocationEngine.service.ts — no changes needed.

// ─── AI FEATURE #3: Plan Quality Check ────────────────────────────────────────

/**
 * Enhanced AI Plan Quality Check.
 * Inspects TherapyPlan fields, returns a quality score + structured checklist.
 */
export const checkPlanQuality = (plan: {
  goals?: {
    title?: string;
    baseline?: string;
    target?: string;
    activities?: string[];
    expectedOutcome?: string;
    frequency?: string;
  }[];
}): PlanQualityResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const checklist: { label: string; passed: boolean }[] = [];

  let scorePoints = 0;
  const totalPoints = 100;

  // ── Check 1: Goals exist (20 pts) ────────────────────────────────────────
  const hasGoals = plan.goals && plan.goals.length > 0;
  checklist.push({ label: 'At least one therapy goal defined', passed: !!hasGoals });
  if (hasGoals) {
    scorePoints += 20;
  } else {
    errors.push('Therapy plan must have at least one measurable goal.');
  }

  if (hasGoals && plan.goals) {
    plan.goals.forEach((goal, idx) => {
      const gLabel = `Goal ${idx + 1}${goal.title ? ` (${goal.title})` : ''}`;

      // ── Check 2: Title (10 pts total across goals) ─────────────────────
      const hasTitle = !!goal.title?.trim();
      checklist.push({ label: `${gLabel}: Title defined`, passed: hasTitle });
      if (hasTitle) {
        scorePoints += Math.round(10 / plan.goals!.length);
      } else {
        errors.push(`${gLabel} is missing a title.`);
      }

      // ── Check 3: Baseline (15 pts) ────────────────────────────────────
      const hasBaseline = !!goal.baseline?.trim();
      checklist.push({ label: `${gLabel}: Baseline measurement defined`, passed: hasBaseline });
      if (hasBaseline) {
        scorePoints += Math.round(15 / plan.goals!.length);
      } else {
        errors.push(`${gLabel} is missing a baseline measurement.`);
      }

      // ── Check 4: Measurable Target (15 pts) ──────────────────────────
      const hasTarget = !!goal.target?.trim();
      const isMeasurable = hasTarget && /(%|percent|out of|\/|\d+\s*(correct|trials|attempts))/i.test(goal.target!);
      checklist.push({ label: `${gLabel}: Measurable target defined`, passed: isMeasurable });
      if (isMeasurable) {
        scorePoints += Math.round(15 / plan.goals!.length);
      } else if (hasTarget) {
        warnings.push(`${gLabel} target may not be objectively measurable. Include a numeric metric (e.g., "80%", "8/10 correct").`);
        scorePoints += Math.round(8 / plan.goals!.length); // partial credit
      } else {
        errors.push(`${gLabel} is missing a measurable target.`);
      }

      // ── Check 5: Activities (20 pts) ──────────────────────────────────
      const hasActivities = goal.activities && goal.activities.length > 0 &&
        goal.activities.some(a => a.trim().length > 0);
      checklist.push({ label: `${gLabel}: At least one activity listed`, passed: !!hasActivities });
      if (hasActivities) {
        scorePoints += Math.round(20 / plan.goals!.length);
      } else {
        errors.push(`${gLabel} must include at least one therapy activity.`);
      }

      // ── Check 6: Expected Outcome (10 pts) ────────────────────────────
      const hasOutcome = !!goal.expectedOutcome?.trim();
      checklist.push({ label: `${gLabel}: Expected outcome documented`, passed: hasOutcome });
      if (hasOutcome) {
        scorePoints += Math.round(10 / plan.goals!.length);
      } else {
        warnings.push(`${gLabel} is missing an expected outcome. This helps supervisors evaluate goal appropriateness.`);
      }

      // ── Check 7: Frequency (10 pts) ────────────────────────────────────
      const hasFrequency = !!goal.frequency?.trim();
      checklist.push({ label: `${gLabel}: Session frequency specified`, passed: hasFrequency });
      if (hasFrequency) {
        scorePoints += Math.round(10 / plan.goals!.length);
      } else {
        errors.push(`${gLabel} is missing frequency of practice.`);
      }
    });
  }

  // ── Suggestions (always) ──────────────────────────────────────────────────
  if (plan.goals && plan.goals.length === 1) {
    suggestions.push('Consider adding a second goal to address a secondary skill area (e.g., conversation generalization).');
  }
  if (plan.goals && plan.goals.length > 0) {
    const allHaveProgress = plan.goals.every(g => /(\d+%|percent|out of)/i.test(g.target || ''));
    if (!allHaveProgress) {
      suggestions.push('Ensure all goals use a numeric progress criterion (e.g., "80% accuracy across 3 sessions") for clear milestone tracking.');
    }
  }

  const qualityScore = Math.min(100, Math.max(0, scorePoints));

  return {
    qualityScore,
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
    checklist,
    disclaimer: 'AI Plan Quality Check is a prototype tool. Supervisor clinical judgment is the authoritative standard for plan approval.'
  };
};

// ─── AI FEATURE #4: Adaptive Therapy Recommendation ───────────────────────────

/**
 * Local rule-based Adaptive Therapy Engine.
 * Analyzes current and adjacent level scores.
 * Returns a structured recommendation with evidence and suggested activities.
 */
export const runAdaptiveTherapyEngine = (
  patient: PatientContext,
  recentSessions: SessionData[] = []
): AdaptiveRecommendation => {
  const currentLevelIdx = THERAPY_LEVELS.indexOf(patient.currentLevel);
  const nextLevel = THERAPY_LEVELS[currentLevelIdx + 1] || null;
  const prevLevel = THERAPY_LEVELS[currentLevelIdx - 1] || null;

  const currentScore = getScoreForLevel(patient, patient.currentLevel);
  const nextScore = nextLevel ? getScoreForLevel(patient, nextLevel) : null;
  const prevScore = prevLevel ? getScoreForLevel(patient, prevLevel) : null;

  // Recent session scores at current level
  const recentAtCurrentLevel = recentSessions
    .filter(s => s.level === patient.currentLevel)
    .slice(0, PLATEAU_MIN_SESSIONS)
    .map(s => s.speechPerformanceScore);

  const avgRecent = recentAtCurrentLevel.length > 0
    ? Math.round(recentAtCurrentLevel.reduce((a, b) => a + b, 0) / recentAtCurrentLevel.length)
    : currentScore;

  const isAboveThreshold = currentScore >= PROGRESSION_THRESHOLD;
  const isConsistentlyAbove = avgRecent >= PROGRESSION_THRESHOLD && recentAtCurrentLevel.length >= 2;
  const isPlateau = recentAtCurrentLevel.length >= PLATEAU_MIN_SESSIONS &&
    recentAtCurrentLevel.every(s => Math.abs(s - recentAtCurrentLevel[0]) <= PLATEAU_TOLERANCE) &&
    currentScore < PROGRESSION_THRESHOLD;

  const nextScoreTooLow = nextScore !== null && nextScore < currentScore - 20;
  const evidencePoints: string[] = [];

  evidencePoints.push(`${patient.currentLevel} level score: ${currentScore}%`);
  evidencePoints.push(`Progression threshold: ${PROGRESSION_THRESHOLD}%`);
  if (avgRecent !== currentScore) evidencePoints.push(`Recent average (${recentAtCurrentLevel.length} sessions): ${avgRecent}%`);
  if (nextScore !== null) evidencePoints.push(`${nextLevel} level score: ${nextScore}%`);
  if (prevScore !== null) evidencePoints.push(`${prevLevel} level score: ${prevScore}%`);

  // ── Decision Logic ─────────────────────────────────────────────────────────

  // Rule: If performance is above threshold AND next level is significantly lower
  if (isAboveThreshold && nextScoreTooLow && nextLevel) {
    evidencePoints.push(`Gap: ${nextLevel} performance is ${currentScore - nextScore!}% lower — structured transition needed`);
    return {
      currentLevel: patient.currentLevel,
      suggestedLevel: patient.currentLevel, // Stay but bridge to next
      action: 'CONTINUE',
      reason: `${patient.currentLevel} performance (${currentScore}%) meets the threshold, but ${nextLevel} performance (${nextScore}%) is substantially lower. A bridging strategy is recommended before a formal level advance.`,
      evidencePoints,
      suggestedActivities: generateActivitiesForLevel(patient.currentLevel, patient.targetSound, patient.therapyLanguage, currentScore),
      disclaimer: 'AI Recommendation — Therapist retains final clinical decision authority.'
    };
  }

  // Rule: Consistently above threshold → recommend advance
  if (isConsistentlyAbove && nextLevel) {
    evidencePoints.push(`Consistent above-threshold performance confirmed over ${recentAtCurrentLevel.length} sessions`);
    return {
      currentLevel: patient.currentLevel,
      suggestedLevel: nextLevel,
      action: 'ADVANCE',
      reason: `${patient.currentLevel} level performance (${currentScore}%) has been consistently above the ${PROGRESSION_THRESHOLD}% threshold. Progression to ${nextLevel} level is recommended.`,
      evidencePoints,
      suggestedActivities: generateActivitiesForLevel(nextLevel, patient.targetSound, patient.therapyLanguage, nextScore ?? 50),
      disclaimer: 'AI Recommendation — Therapist retains final clinical decision authority.'
    };
  }

  // Rule: Plateau below threshold → reinforce
  if (isPlateau) {
    evidencePoints.push(`Performance plateau detected: variance ≤${PLATEAU_TOLERANCE}% over ${PLATEAU_MIN_SESSIONS} sessions`);
    return {
      currentLevel: patient.currentLevel,
      suggestedLevel: prevLevel,
      action: 'REINFORCE',
      reason: `Performance at ${patient.currentLevel} level has plateaued at ${currentScore}% (below the ${PROGRESSION_THRESHOLD}% threshold). Consider reviewing stimulus materials and approach, or temporarily returning to ${prevLevel || 'foundational'} level.`,
      evidencePoints,
      suggestedActivities: generateActivitiesForLevel(patient.currentLevel, patient.targetSound, patient.therapyLanguage, currentScore),
      disclaimer: 'AI Recommendation — Therapist retains final clinical decision authority.'
    };
  }

  // Rule: Default — continue at current level
  return {
    currentLevel: patient.currentLevel,
    suggestedLevel: null,
    action: 'CONTINUE',
    reason: `${patient.currentLevel} level performance (${currentScore}%) is below the ${PROGRESSION_THRESHOLD}% threshold. Continue structured practice at the current level.`,
    evidencePoints,
    suggestedActivities: generateActivitiesForLevel(patient.currentLevel, patient.targetSound, patient.therapyLanguage, currentScore),
    disclaimer: 'AI Recommendation — Therapist retains final clinical decision authority.'
  };
};

// ─── AI FEATURE #5: Progress Summary ──────────────────────────────────────────

/**
 * Generates a structured AI Progress Summary from actual stored data.
 * If data is missing, explicitly indicates "unavailable."
 */
export const generateProgressSummary = (
  patient: PatientContext,
  sessions: SessionData[] = [],
  sessionRange?: { start: number; end: number }
): ProgressSummary => {
  const range = sessionRange
    ? `Sessions ${sessionRange.start}–${sessionRange.end}`
    : `Sessions 1–${patient.sessionCount}`;

  const recentScores = sessions.map(s => s.speechPerformanceScore).filter(s => s > 0);
  const avgScore = recentScores.length > 0
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
    : patient.progressPct;

  const firstScore = recentScores[recentScores.length - 1] ?? patient.baselineScores.sentence;
  const latestScore = recentScores[0] ?? patient.progressPct;
  const scoreChange = latestScore - firstScore;

  const areasOfImprovement: string[] = [];
  const areasRequiringPractice: string[] = [];

  // Analyze scores by level
  const levels: Array<{ key: keyof typeof patient.currentScores; label: string }> = [
    { key: 'sound', label: 'Sound isolation' },
    { key: 'syllable', label: 'Syllable production' },
    { key: 'word', label: 'Word-level production' },
    { key: 'sentence', label: 'Sentence-level production' },
    { key: 'conversation', label: 'Conversational generalization' },
  ];

  for (const { key, label } of levels) {
    const baseline = patient.baselineScores[key] ?? 0;
    const current = patient.currentScores[key] ?? 0;
    if (baseline === 0 && current === 0) continue;
    const gain = current - baseline;
    if (gain >= 10 || current >= PROGRESSION_THRESHOLD) {
      areasOfImprovement.push(`${label} (+${gain}% gain, now at ${current}%)`);
    } else if (current < PROGRESSION_THRESHOLD) {
      areasRequiringPractice.push(`${label} (${current}% — below ${PROGRESSION_THRESHOLD}% threshold)`);
    }
  }

  // Goal progress
  const goalsProgress = patient.goals.map(g => {
    let observation = '';
    const gain = g.currentPct - g.baselinePct;
    if (gain >= 15) observation = 'Substantial improvement noted.';
    else if (gain > 0) observation = 'Gradual improvement noted.';
    else if (gain === 0) observation = 'No measurable change from baseline.';
    else observation = 'Performance has declined from baseline — review recommended.';
    return { goalTitle: g.title, baseline: g.baselinePct, current: g.currentPct, target: g.targetPct, status: g.status, observation };
  });

  // Trend
  const trendAnalysis = (() => {
    if (recentScores.length < 2) return 'Insufficient session data to establish a trend. More sessions required.';
    const improving = recentScores[0] > recentScores[recentScores.length - 1];
    const plateau = recentScores.every(s => Math.abs(s - recentScores[0]) <= PLATEAU_TOLERANCE);
    if (plateau) return `Performance has plateaued around ${avgScore}% over the past ${recentScores.length} sessions. Stimulus modification is recommended.`;
    if (improving) return `Positive upward trend: performance improved from ${firstScore}% to ${latestScore}% (Δ${scoreChange > 0 ? '+' : ''}${scoreChange}%) over this period.`;
    return `Performance declined from ${firstScore}% to ${latestScore}% (Δ${scoreChange}%). Supervisor review is recommended.`;
  })();

  // Suggested focus
  const suggestedFocus = (() => {
    const currentScore = getScoreForLevel(patient, patient.currentLevel);
    if (currentScore >= PROGRESSION_THRESHOLD) {
      const nextIdx = THERAPY_LEVELS.indexOf(patient.currentLevel) + 1;
      const next = THERAPY_LEVELS[nextIdx];
      return next ? `Advance to ${next} level activities for ${patient.targetSound}.` : 'Maintain conversational generalization practice.';
    }
    return `Continue ${patient.currentLevel}-level structured drills for ${patient.targetSound} until ${PROGRESSION_THRESHOLD}% threshold is reached.`;
  })();

  const attendanceNote = patient.attendancePct >= 90
    ? `Excellent attendance (${patient.attendancePct}%).`
    : patient.attendancePct >= 75
    ? `Adequate attendance (${patient.attendancePct}%). Encourage consistency.`
    : `Below-target attendance (${patient.attendancePct}%). Poor attendance may be limiting progress.`;

  return {
    overallProgress: `${patient.progressPct}% overall progress. Average session score: ${avgScore}%.`,
    sessionRange: range,
    goalsProgress: goalsProgress.length > 0 ? goalsProgress : [{ goalTitle: 'No goals recorded', baseline: 0, current: 0, target: 0, status: 'N/A', observation: 'Goals were not defined for this reporting period.' }],
    areasOfImprovement: areasOfImprovement.length > 0 ? areasOfImprovement : ['Insufficient data to identify areas of improvement.'],
    areasRequiringPractice: areasRequiringPractice.length > 0 ? areasRequiringPractice : ['No specific deficit areas identified at this time.'],
    suggestedFocus,
    trendAnalysis,
    attendanceNote,
    disclaimer: 'AI-generated progress summary. Based on data stored in the SpeechCare system. Therapist must review and clinically validate before submission to supervisor.'
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreForLevel(patient: PatientContext, level: TherapyLevel): number {
  switch (level) {
    case 'Sound': return patient.currentScores.sound;
    case 'Syllable': return patient.currentScores.syllable;
    case 'Word': return patient.currentScores.word;
    case 'Sentence': return patient.currentScores.sentence;
    case 'Conversation': return patient.currentScores.conversation;
    default: return patient.progressPct;
  }
}

function generateActivitiesForLevel(
  level: TherapyLevel,
  targetSound: string,
  language: string,
  score: number
): string[] {
  const ts = targetSound || 'target phoneme';
  const isLow = score < 50;
  const isModerate = score >= 50 && score < PROGRESSION_THRESHOLD;

  const levelActivities: Record<TherapyLevel, string[]> = {
    Sound: [
      `Isolation drill: Produce ${ts} in isolation with mirror biofeedback for oral posture correction. Duration: 5 mins.`,
      `Minimal contrast pairs: Distinguish ${ts} from nearest phoneme neighbor to establish auditory-articulatory mapping. Duration: 8 mins.`,
      isLow
        ? `Imitation with tactile cuing: Clinician models ${ts} with tactile placement guide, patient imitates. Duration: 10 mins.`
        : `Delayed imitation: 3-second delay between model and patient production to develop self-monitoring. Duration: 8 mins.`
    ],
    Syllable: [
      `CV/VC syllable drill: ${ts} in initial and final positions across 20 syllable cards. Duration: 10 mins.`,
      `Minimal pair syllables: Contrast ${ts}-initial syllables vs. nearest error pattern (e.g., /r/ vs /w/ in "ree" vs "wee"). Duration: 8 mins.`,
      isModerate
        ? `Syllable chaining: Produce 2–3 syllable sequences containing ${ts} with rhythm tracking. Duration: 8 mins.`
        : `Nonsense syllable stimulation: Novel CV structures to reduce phoneme-specific word habituation. Duration: 5 mins.`
    ],
    Word: [
      `Word list practice: 30 target words containing ${ts} in initial, medial, and final positions. ${language !== 'English' ? `Include ${language}-specific vocabulary.` : ''} Duration: 12 mins.`,
      `Picture naming: Clinician presents picture cards with ${ts} words; patient names without model. Duration: 10 mins.`,
      `Error analysis drill: Review words with consistent errors, isolate error context, re-practice in blocked format. Duration: 8 mins.`
    ],
    Sentence: [
      `Carrier phrase drill: "I see a ___" / "I want the ___" with ${ts} target nouns. Duration: 12 mins.`,
      `Sentence completion: Clinician reads sentence frame; patient completes with target ${ts} word. Duration: 10 mins.`,
      `Reading aloud: ${language}-appropriate passages highlighting ${ts} words. Self-monitor accuracy rate. Duration: 10 mins.`
    ],
    Conversation: [
      `Structured topic discussion: Guide patient through 5-minute discussion on a familiar topic, count spontaneous ${ts} productions. Duration: 15 mins.`,
      `Role-play scenario: Simulate functional communication contexts (ordering food, asking directions) requiring ${ts} use. Duration: 10 mins.`,
      `Unstructured narrative: Patient retells a story or experience; clinician records ${ts} accuracy without prompting. Duration: 10 mins.`
    ]
  };

  return levelActivities[level] || [`Structured ${ts} practice at ${level} level.`];
}

// ─── Legacy export (kept for ai.controller.ts backward compatibility) ──────────

/** @deprecated Use generateAssistantResponse() directly with PatientContext */
export const getAIResponse = async (prompt: string, context: string = ''): Promise<string> => {
  // Parse context into minimal PatientContext for backward compatibility
  const nameMatch = context.match(/Patient:\s*([^,]+)/i);
  const soundMatch = context.match(/Target Sound:\s*([^,]+)/i);
  const levelMatch = context.match(/Current Level:\s*([^,]+)/i);

  const minimalPatient: PatientContext = {
    name: nameMatch ? nameMatch[1].trim() : 'Patient',
    caseId: 'N/A',
    targetSound: soundMatch ? soundMatch[1].trim() : '/r/',
    currentLevel: (levelMatch ? levelMatch[1].trim() : 'Sentence') as TherapyLevel,
    progressPct: 0,
    sessionCount: 0,
    totalTargetSessions: 16,
    attendancePct: 100,
    therapyLanguage: 'English',
    diagnosis: 'Articulation disorder',
    currentScores: { sound: 80, syllable: 80, word: 87, sentence: 74, conversation: 58 },
    baselineScores: { sound: 20, syllable: 20, word: 30, sentence: 20, conversation: 10 },
    goals: [],
    recentObservation: '',
    suggestedFocus: [],
  };

  return generateAssistantResponse(prompt, minimalPatient);
};
