export type UserRole = 'student_therapist' | 'supervisor' | 'admin' | 'patient';

export type TherapyLevel = 'Sound' | 'Syllable' | 'Word' | 'Sentence' | 'Conversation';

export type CaseStatus = 'Active' | 'Review Needed' | 'Milestone Due' | 'Completed' | 'Pending Allocation';

export type CasePriority = 'High' | 'Amber' | 'Normal';

export interface Patient {
  id: string;
  caseId: string;
  name: string;
  age: number;
  gender: string;
  avatarType?: string;
  diagnosis: string;
  targetSound: string;
  phoneticDescription: string;
  currentLevel: TherapyLevel;
  progressPct: number;
  status: CaseStatus;
  priority: CasePriority;
  assignedTherapist: {
    id: string;
    name: string;
    role: string;
    avatarType?: string;
  };
  supervisor: {
    id: string;
    name: string;
    title: string;
    avatarType?: string;
  };
  primaryLanguage: string;
  therapyLanguage: string;
  sessionCount: number;
  totalTargetSessions: number;
  recentSessionDate: string;
  nextSessionDate: string;
  attendancePct: number;
  baselineScores: {
    sound: number;
    syllable: number;
    word: number;
    sentence: number;
    conversation: number;
  };
  currentScores: {
    sound: number;
    syllable: number;
    word: number;
    sentence: number;
    conversation: number;
  };
  positionScores: {
    initial: number;
    medial: number;
    final: number;
  };
  historicalProgress: {
    session: string;
    score: number;
    targetScore: number;
    level: TherapyLevel;
  }[];
  goals: TherapyGoal[];
  initialNotes: string;
  recentObservation: string;
  suggestedFocus: string[];
}

export interface TherapyGoal {
  id: string;
  title: string;
  category: 'Articulation' | 'Phonology' | 'Fluency' | 'Acoustic Precision';
  baselinePct: number;
  currentPct: number;
  targetPct: number;
  status: 'In Progress' | 'Achieved' | 'Plateau' | 'Review Required';
  rationale: string;
  activities?: string[];
  expectedOutcome?: string;
  frequency?: string;
}

export interface SessionRecord {
  id: string;
  patientId: string;
  patientName: string;
  sessionNumber: number;
  date: string;
  durationMinutes: number;
  therapistName: string;
  level: TherapyLevel;
  targetSound: string;
  speechPerformanceScore: number;
  phonemeAccuracyScore: number;
  audioQuality: 'Excellent' | 'Good' | 'Fair';
  stimulusItems: {
    prompt: string;
    score: number;
    phonemeResult: 'Correct' | 'Distorted' | 'Substituted' | 'Omitted';
  }[];
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  supervisorFeedback?: {
    supervisorName: string;
    comment: string;
    rating: number; // 1-5
    date: string;
  };
}

export interface SpeechStimulus {
  id: string;
  targetSound: string;
  level: TherapyLevel;
  prompt: string;
  phoneticTarget: string;
  phoneticPosition: 'initial' | 'medial' | 'final' | 'cluster';
  language: string;
  referenceAudioWaveform?: number[];
  cueTips: string;
}

export interface TherapistCandidate {
  id: string;
  name: string;
  role: string;
  avatarType?: string;
  experienceYears: number;
  specialties: string[];
  activeCaseload: number;
  maxCaseload: number;
  availability: string;
  supervisorName: string;
  matchScore: number;
  matchReasons: string[];
}

export interface SupervisorPriorityCase {
  id: string;
  patientId: string;
  caseId: string;
  patientName: string;
  assignedTherapist: string;
  priority: 'High' | 'Amber' | 'Normal';
  headline: string;
  reason: string;
  lastSessionDate: string;
  sessionsCompleted: number;
  conversationScore: number;
  reportPending: boolean;
  statusText: string;
}

export interface StudentCompetencyItem {
  id: string;
  studentName: string;
  studentId: string;
  avatarType?: string;
  yearOfStudy: string;
  supervisor: string;
  activeCasesCount: number;
  metrics: {
    planning: number;
    goalSetting: number;
    documentation: number;
    sessionHandling: number;
    supervisorRating: number;
  };
  overallAverage: number;
  trend: '+3%' | '+5%' | '-2%' | '+1%';
  historicalTrend: { month: string; score: number }[];
  feedbackNotes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'assignment' | 'review_required' | 'milestone' | 'supervisor_feedback' | 'ai_insight';
  priority: 'high' | 'medium' | 'info';
  unread: boolean;
  relatedCaseId?: string;
}

export interface AIActivitySuggestion {
  id: string;
  title: string;
  level: TherapyLevel;
  description: string;
  clinicalRationale: string;
  targetPhoneme: string;
  recommendedDuration: string;
  status: 'suggested' | 'approved' | 'modified' | 'rejected';
}
