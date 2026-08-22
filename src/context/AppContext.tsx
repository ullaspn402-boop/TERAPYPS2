import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import {
  UserRole,
  Patient,
  SessionRecord,
  SupervisorPriorityCase,
  StudentCompetencyItem,
  NotificationItem,
  AIActivitySuggestion,
  TherapyLevel,
} from '../types';
// Note: INITIAL_PATIENTS removed — all data is fetched from the authenticated user's backend.

export type NavigationPage =
  | 'landing'
  | 'dashboard'
  | 'my-cases'
  | 'patients'
  | 'patient-detail'
  | 'therapy-sessions'
  | 'speech-practice'
  | 'progress'
  | 'reports'
  | 'ai-assistant'
  | 'adaptive-therapy'
  | 'ai-insights'
  | 'supervisor-center'
  | 'therapy-plans'
  | 'reviews'
  | 'student-competency'
  | 'ai-allocation'
  | 'analytics'
  | 'users'
  | 'settings';

export type PatientTab =
  | 'overview'
  | 'assessment'
  | 'therapy-plan'
  | 'sessions'
  | 'speech-analysis'
  | 'progress'
  | 'reports';

export interface DashboardStats {
  activeCases: number;
  sessionsThisWeek: number;
  plansAwaitingReview: number;
  reportsDue: number;
  highPriority: number;
  amberPriority: number;
  normalPriority: number;
  totalCases: number;
  avgProgress: number;
  avgSupervisorRating: number;
  langDistribution: { language: string; count: number; percent: number }[];
  phonemeProgress: { sound: string; avgBaseline: number; avgCurrent: number; count: number }[];
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: { name: string; role: string; avatarType?: string } | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  currentView: NavigationPage;
  setCurrentView: (view: NavigationPage) => void;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  selectedPatientTab: PatientTab;
  setSelectedPatientTab: (tab: PatientTab) => void;
  interfaceLanguage: string;
  setInterfaceLanguage: (lang: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  patients: Patient[];
  selectedPatient: Patient | null;
  sessionRecords: SessionRecord[];
  supervisorCases: SupervisorPriorityCase[];
  studentCompetencies: StudentCompetencyItem[];
  notifications: NotificationItem[];
  aiActivities: AIActivitySuggestion[];
  unreadNotificationCount: number;
  dashboardStats: DashboardStats;
  isLoading: boolean;
  // State modification actions
  navigateToPatient: (patientId: string, tab?: PatientTab) => void;
  updatePatientGoals: (patientId: string, goals: Patient['goals']) => void;
  advanceTherapyLevel: (patientId: string, newLevel: TherapyLevel) => void;
  addSessionRecord: (newSession: SessionRecord) => void;
  addPatient: (data: {
    name: string; age: number; gender: string;
    primaryLanguage: string; therapyLanguage: string;
    targetSound: string; diagnosis: string; initialNotes?: string;
  }) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  updateAIActivityStatus: (activityId: string, status: 'approved' | 'modified' | 'rejected') => void;
  approveSupervisorCase: (caseId: string, feedback: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  allocateCaseToTherapist: (patientId: string, therapistId: string) => void;
  refreshData: () => Promise<void>;
}

const defaultDashboardStats: DashboardStats = {
  activeCases: 0,
  sessionsThisWeek: 0,
  plansAwaitingReview: 0,
  reportsDue: 0,
  highPriority: 0,
  amberPriority: 0,
  normalPriority: 0,
  totalCases: 0,
  avgProgress: 0,
  avgSupervisorRating: 0,
  langDistribution: [],
  phonemeProgress: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('student_therapist');
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; avatarType?: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<NavigationPage>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatientTab, setSelectedPatientTab] = useState<PatientTab>('overview');
  const [interfaceLanguage, setInterfaceLanguageState] = useState<string>(
    localStorage.getItem('speechcare_lang') || 'en'
  );
  const setInterfaceLanguage = (lang: string) => {
    localStorage.setItem('speechcare_lang', lang);
    setInterfaceLanguageState(lang);
  };
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // All state initialized as empty — populated from backend on login
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([]);
  const [supervisorCases, setSupervisorCases] = useState<SupervisorPriorityCase[]>([]);
  const [studentCompetencies, setStudentCompetencies] = useState<StudentCompetencyItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [aiActivities, setAiActivities] = useState<AIActivitySuggestion[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(defaultDashboardStats);

  // ISOLATION FIX: Never auto-select another user's patient.
  // Only select a patient if selectedPatientId explicitly points to one in this user's list.
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;
  const unreadNotificationCount = notifications.filter((n) => n.unread).length;

  // ─── Fetch Sessions ────────────────────────────────────────────────────────

  const fetchSessionsForPatient = async (patientId: string) => {
    if (!patientId) return;

    try {
      const res = await apiClient.get(`/sessions/patient/${patientId}`);
      if (res.success && Array.isArray(res.data)) {
        const targetPatient = patients.find((p) => p.id === patientId);
        const mappedSessions: SessionRecord[] = res.data.map((dbS: any) => ({
          id: dbS._id,
          patientId: patientId,
          patientName: dbS.patientId?.name || targetPatient?.name || 'Patient',
          sessionNumber: dbS.sessionNumber,
          date: dbS.date
            ? new Date(dbS.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Recent',
          durationMinutes: dbS.durationMinutes || 45,
          therapistName: dbS.therapistId?.name || 'Ananya Sharma',
          level: dbS.level || 'Sentence',
          targetSound: dbS.targetSound || '/r/',
          speechPerformanceScore: dbS.speechPerformanceScore || 0,
          phonemeAccuracyScore: dbS.phonemeAccuracyScore || 0,
          audioQuality: dbS.audioQuality || 'Good',
          stimulusItems: (dbS.stimulusItems || []).map((item: any) => ({
            prompt: item.prompt,
            score: item.score,
            phonemeResult: item.phonemeResult,
          })),
          soapNotes: {
            subjective: dbS.soapNotes?.subjective || '',
            objective: dbS.soapNotes?.objective || '',
            assessment: dbS.soapNotes?.assessment || '',
            plan: dbS.soapNotes?.plan || '',
          },
          supervisorFeedback: dbS.supervisorFeedback?.comment
            ? {
                supervisorName: dbS.supervisorFeedback.supervisorId?.name || 'Supervisor',
                comment: dbS.supervisorFeedback.comment,
                rating: dbS.supervisorFeedback.rating || 5,
                date: dbS.supervisorFeedback.date
                  ? new Date(dbS.supervisorFeedback.date).toISOString().split('T')[0]
                  : '',
              }
            : undefined,
        }));
        setSessionRecords(mappedSessions);
      } else {
        setSessionRecords([]);
      }
    } catch (e) {
      console.error('Failed to load sessions from DB:', e);
      setSessionRecords([]);
    }
  };

  // ─── Fetch Notifications ───────────────────────────────────────────────────

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (e) {
      // Notifications are non-critical; silently fail
      console.warn('Could not load notifications:', e);
      setNotifications([]);
    }
  };

  // ─── Fetch Student Competencies ────────────────────────────────────────────

  const fetchStudentCompetencies = async () => {
    try {
      const therapistsRes = await apiClient.get('/users/therapists');
      if (!therapistsRes.success || !Array.isArray(therapistsRes.data)) return;

      const competencies: StudentCompetencyItem[] = await Promise.all(
        therapistsRes.data.map(async (t: any, idx: number) => {
          let metrics = { planning: 0, goalSetting: 0, documentation: 0, sessionHandling: 0, supervisorRating: 0 };
          let overallAverage = 0;
          let feedbackNotes = 'No evaluations recorded yet.';

          try {
            const compRes = await apiClient.get(`/users/therapists/${t._id}/competency`);
            if (compRes.success && compRes.data) {
              const d = compRes.data;
              metrics = {
                planning: d.planning || 0,
                goalSetting: d.goalSetting || 0,
                documentation: d.documentation || 0,
                sessionHandling: d.sessionHandling || 0,
                supervisorRating: d.clinicalReasoning || 0,
              };
              const vals = Object.values(metrics) as number[];
              overallAverage = vals.length > 0
                ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
                : 0;
            }
          } catch (e) {
            // Competency fetch for one therapist failed; keep defaults
          }

          const activeCasesCount = t.activeCaseload || 0;

          return {
            id: t._id,
            studentName: t.name,
            studentId: `ST-${String(idx + 1).padStart(4, '0')}`,
            avatarType: t.avatarType,
            yearOfStudy: t.experienceYears
              ? `Year ${Math.ceil(t.experienceYears)} (Clinical Practicum)`
              : 'Year 1 (Practicum)',
            supervisor: t.supervisorId?.name || 'Supervisor',
            activeCasesCount,
            metrics,
            overallAverage,
            trend: '+0%' as any,
            historicalTrend: [],
            feedbackNotes,
          };
        })
      );

      setStudentCompetencies(competencies);
    } catch (e) {
      console.warn('Could not load student competencies:', e);
    }
  };

  // ─── Fetch Analytics Summary ───────────────────────────────────────────────

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get('/analytics/summary');
      if (res.success && res.data) {
        const d = res.data;
        setDashboardStats({
          activeCases: d.cases?.active || 0,
          sessionsThisWeek: d.sessions?.thisWeek || 0,
          plansAwaitingReview: d.plansAwaitingReview || 0,
          reportsDue: d.reports?.due || 0,
          highPriority: d.cases?.highPriority || 0,
          amberPriority: d.cases?.amberPriority || 0,
          normalPriority: d.cases?.normalPriority || 0,
          totalCases: d.cases?.total || 0,
          avgProgress: d.patients?.avgProgress || 0,
          avgSupervisorRating: d.avgSupervisorRating || 0,
          langDistribution: d.langDistribution || [],
          phonemeProgress: d.phonemeProgress || [],
        });
      }
    } catch (e) {
      console.warn('Could not load analytics:', e);
    }
  };

  // ─── Main data fetch (runs on login and token restore) ────────────────────

  const fetchDbData = async (fetchRole?: string) => {
    // Use explicitly passed role (to avoid stale closure right after login),
    // or fall back to the current role state.
    const activeRole = fetchRole || role;
    setIsLoading(true);
    try {
      // ── Fetch patients, cases, and AI activities in PARALLEL for speed ──
      const [res, casesRes, aiRes] = await Promise.all([
        apiClient.get('/patients'),
        apiClient.get('/cases'),
        apiClient.get('/ai/activities'),
      ]);

      // ── Patients ──
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((dbP: any) => ({
          ...dbP,
          id: dbP._id,
          assignedTherapist: dbP.assignedTherapistId
            ? {
                id: dbP.assignedTherapistId._id,
                name: dbP.assignedTherapistId.name,
                role: dbP.assignedTherapistId.role,
                avatarType: dbP.assignedTherapistId.avatarType,
              }
            : undefined,
          supervisor: dbP.supervisorId
            ? {
                id: dbP.supervisorId._id,
                name: dbP.supervisorId.name,
                title: dbP.supervisorId.title,
                avatarType: dbP.supervisorId.avatarType,
              }
            : undefined,
        }));
        setPatients(mapped);
        // ISOLATION FIX: Do NOT auto-select patients[0] — that would show another user's
        // patient if selectedPatientId is empty. Only load sessions if a patient was
        // previously selected and still exists in this user's list.
        if (selectedPatientId) {
          const stillExists = mapped.find((p: any) => p.id === selectedPatientId);
          if (stillExists) fetchSessionsForPatient(selectedPatientId);
          else setSelectedPatientId('');
        }
      } else {
        // New account with no patients — start clean.
        setPatients([]);
        setSelectedPatientId('');
      }

      // ── Cases → supervisor priority queue ──
      // ISOLATION FIX: Only populate supervisorCases for supervisor/admin roles.
      // Student therapists must NEVER receive all cases — they only work with their own patients.
      if ((activeRole === 'supervisor' || activeRole === 'admin') && casesRes.success && casesRes.data) {
        const mappedCases = casesRes.data.map((c: any) => ({
          id: c._id,
          caseId: c.caseId,
          patientId: c.patientId?._id || c.patientId,
          patientName: c.patientId?.name || 'Unknown',
          assignedTherapist: c.therapistId?.name || 'Unassigned',
          priority: c.priority || 'Normal',
          priorityScore: c.priorityScore || 0,
          headline: c.priorityReasons?.[0] || (c.status ? c.status.replace(/_/g, ' ') : 'Active Case'),
          reason: (c.priorityReasons || []).join('. ') || 'Case is currently active.',
          lastSessionDate: 'Recent',
          sessionsCompleted: c.patientId?.sessionCount || 0,
          conversationScore: c.patientId?.currentScores?.conversation || 0,
          reportPending: c.status === 'MILESTONE_DUE' || c.status === 'PROGRESS_REVIEW',
          statusText: c.status === 'APPROVED'
            ? 'Approved & Signed Off'
            : (c.status ? c.status.replace(/_/g, ' ') : 'Unknown'),
          reasons: c.priorityReasons || [],
        }));
        setSupervisorCases(mappedCases);
      } else if (activeRole === 'student_therapist') {
        // Student therapists have no supervisor case queue — always empty.
        setSupervisorCases([]);
      }

      // ── AI Activities ──
      if (aiRes.success && Array.isArray(aiRes.data) && aiRes.data.length > 0) {
        const mappedActivities: AIActivitySuggestion[] = aiRes.data.map((dbAct: any) => ({
          id: dbAct.activityId || dbAct._id,
          title: dbAct.title,
          level: dbAct.level,
          description: dbAct.description,
          clinicalRationale: dbAct.clinicalRationale,
          targetPhoneme: dbAct.targetPhoneme,
          recommendedDuration: dbAct.recommendedDuration,
          status: dbAct.status,
        }));
        setAiActivities(mappedActivities);
      }

      // Run remaining non-critical fetches in parallel
      Promise.allSettled([
        fetchNotifications(),
        fetchStudentCompetencies(),
        fetchAnalytics(),
      ]);
    } catch (e) {
      console.error('Failed to load data from DB:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Auth ──────────────────────────────────────────────────────────────────

  const login = (token: string, user: any) => {
    if (!token) {
      console.error('Login called without a valid token');
      return;
    }
    localStorage.setItem('speechcare_token', token);

    // FIX: Clear ALL previous user's data before loading the new user's data.
    // This prevents stale state from one session bleeding into the next user's session.
    setPatients([]);
    setSessionRecords([]);
    setSupervisorCases([]);
    setStudentCompetencies([]);
    setNotifications([]);
    setAiActivities([]);
    setDashboardStats(defaultDashboardStats);
    setSelectedPatientId('');

    setRoleState(user.role as UserRole);
    setCurrentUser({ name: user.name, role: user.role, avatarType: user.avatarType });
    setIsAuthenticated(true);
    // Pass the role explicitly so fetchDbData doesn't rely on stale role state
    fetchDbData(user.role);

    if (user.role === 'supervisor') {
      setCurrentView('supervisor-center');
    } else if (user.role === 'admin') {
      setCurrentView('analytics');
    } else {
      setCurrentView('dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('speechcare_token');
    setIsAuthenticated(false);
    setRoleState('student_therapist');
    setCurrentUser(null);
    setCurrentView('dashboard');
    // Clear state
    setPatients([]);
    setSessionRecords([]);
    setSupervisorCases([]);
    setStudentCompetencies([]);
    setNotifications([]);
    setAiActivities([]);
    setDashboardStats(defaultDashboardStats);
  };

  useEffect(() => {
    const token = localStorage.getItem('speechcare_token');
    if (token && token !== 'undefined' && token !== 'null') {
      apiClient
        .get('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            setRoleState(res.data.role as UserRole);
            setCurrentUser({ name: res.data.name, role: res.data.role, avatarType: res.data.avatarType });
            setIsAuthenticated(true);
            fetchDbData(res.data.role);
          } else {
            logout();
          }
        })
        .catch((e) => {
          if (
            e.message &&
            (e.message.includes('token') ||
              e.message.includes('Authentication') ||
              e.message.includes('401'))
          ) {
            logout();
          }
        });
    } else {
      localStorage.removeItem('speechcare_token');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && selectedPatientId) {
      fetchSessionsForPatient(selectedPatientId);
    }
  }, [selectedPatientId, isAuthenticated]);

  const setRole = (newRole: UserRole) => {
    console.warn('setRole is disabled. Role is determined by the backend token.');
  };

  // ─── Navigation ────────────────────────────────────────────────────────────

  const navigateToPatient = (patientId: string, tab: PatientTab = 'overview') => {
    const target = patients.find((p) => p.id === patientId);
    const actualId = target ? target.id : patientId;
    setSelectedPatientId(actualId);
    setSelectedPatientTab(tab);
    setCurrentView('patient-detail');
    fetchSessionsForPatient(actualId);
  };

  // ─── Data Mutations ────────────────────────────────────────────────────────

  const updatePatientGoals = async (patientId: string, goals: Patient['goals']) => {
    const target = patients.find((p) => p.id === patientId);
    const actualId = target ? target.id : patientId;

    try {
      const res = await apiClient.put(`/patients/${actualId}`, { goals });
      if (res.success) {
        setPatients((prev) =>
          prev.map((p) => (p.id === actualId ? { ...p, goals } : p))
        );
      }
    } catch (e) {
      console.error('Failed to update patient goals in DB:', e);
    }
  };

  const advanceTherapyLevel = async (patientId: string, newLevel: TherapyLevel) => {
    const target = patients.find((p) => p.id === patientId);
    const actualId = target ? target.id : patientId;

    try {
      const res = await apiClient.put(`/patients/${actualId}`, { currentLevel: newLevel });
      if (res.success) {
        setPatients((prev) =>
          prev.map((p) => (p.id === actualId ? { ...p, currentLevel: newLevel } : p))
        );
      }
    } catch (e) {
      console.error('Failed to advance therapy level in DB:', e);
    }
  };

  const addSessionRecord = async (newSession: SessionRecord) => {
    try {
      const res = await apiClient.post('/sessions', newSession);
      if (res.success) {
        await fetchSessionsForPatient(selectedPatient?.id || '');
        await fetchAnalytics();
      }
    } catch (e) {
      console.error('Failed to add session record', e);
    }
  };

  const addPatient = async (data: {
    name: string; age: number; gender: string;
    primaryLanguage: string; therapyLanguage: string;
    targetSound: string; diagnosis: string; initialNotes?: string;
  }) => {
    const tempId = 'p-' + Date.now();
    const assignedTherapistObj = currentUser
      ? {
          id: currentUser.name.toLowerCase().replace(/\s+/g, '-'),
          name: currentUser.name,
          role: currentUser.role === 'student_therapist' ? 'Student Therapist' : 'Therapist',
        }
      : { id: 't1', name: 'Student Therapist', role: 'Student Therapist' };

    const newP: Patient = {
      id: tempId,
      caseId: `SLT-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      age: data.age,
      gender: data.gender as any,
      primaryLanguage: data.primaryLanguage,
      therapyLanguage: data.therapyLanguage,
      targetSound: data.targetSound,
      phoneticDescription: `Target sound ${data.targetSound} articulation therapy`,
      diagnosis: data.diagnosis || 'Functional Articulation Disorder',
      currentLevel: 'Word',
      progressPct: 0,
      status: 'Pending Allocation',
      priority: 'Normal',
      assignedTherapist: assignedTherapistObj,
      // FIX: Do not hardcode supervisor — leave undefined until the server responds
      // with the real supervisor assignment (after selectSupervisor is called).
      supervisor: undefined,
      sessionCount: 0,
      totalTargetSessions: 12,
      recentSessionDate: 'Just now',
      nextSessionDate: 'To be scheduled',
      attendancePct: 100,
      baselineScores: { sound: 60, syllable: 55, word: 50, sentence: 40, conversation: 30 },
      currentScores: { sound: 60, syllable: 55, word: 50, sentence: 40, conversation: 30 },
      positionScores: { initial: 60, medial: 50, final: 40 },
      historicalProgress: [],
      goals: [
        {
          id: 'g-1',
          title: `Improve ${data.targetSound} target sound accuracy`,
          category: 'Articulation',
          baselinePct: 50,
          currentPct: 50,
          targetPct: 85,
          status: 'In Progress',
          rationale: 'Target sound accuracy needs systematic practice and articulation feedback.',
        },
      ],
      initialNotes: data.initialNotes || '',
      recentObservation: 'Initial registration and assessment pending.',
      suggestedFocus: [`Target sound ${data.targetSound} practice`],
    };

    // 1. Immediately update local state so patient appears in UI in real-time
    setPatients(prev => [newP, ...prev]);

    // 2. Sync with API backend
    try {
      const res = await apiClient.post('/patients', data);
      if (res.success && res.data) {
        const serverP = {
          ...newP,
          ...res.data,
          id: res.data._id || res.data.id || tempId,
        };
        setPatients(prev => prev.map(p => (p.id === tempId ? serverP : p)));
      }
    } catch (e) {
      console.warn('Backend sync note (patient preserved locally):', e);
    }
  };

  const deletePatient = async (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    if (selectedPatientId === patientId) {
      setSelectedPatientId(null);
    }
    try {
      await apiClient.delete(`/patients/${patientId}`);
    } catch (e) {
      console.warn('Backend sync note (delete patient):', e);
    }
  };

  const updateAIActivityStatus = async (
    activityId: string,
    status: 'approved' | 'modified' | 'rejected'
  ) => {
    try {
      const res = await apiClient.put(`/ai/activities/${activityId}`, { status });
      if (res.success) {
        setAiActivities((prev) =>
          prev.map((act) => (act.id === activityId ? { ...act, status } : act))
        );
      }
    } catch (e) {
      console.error('Failed to update AI activity status in DB:', e);
    }
  };

  const approveSupervisorCase = async (caseId: string, feedback: string) => {
    try {
      const res = await apiClient.post(`/cases/${caseId}/approve`);
      if (res.success) {
        setSupervisorCases((prev) =>
          prev.map((sc) =>
            sc.caseId === caseId || sc.id === caseId
              ? { ...sc, statusText: 'Approved & Signed Off', priority: 'Normal' }
              : sc
          )
        );
      }
    } catch (e) {
      console.error('Failed to approve supervisor case in DB:', e);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, unread: false } : n))
    );
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
    } catch (e) {
      // Non-critical — optimistic update already applied
    }
  };

  const markAllNotificationsAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await apiClient.put('/notifications/read-all');
    } catch (e) {
      // Non-critical
    }
  };

  const allocateCaseToTherapist = async (patientId: string, therapistId: string) => {
    try {
      await apiClient.post(`/cases/${patientId}/allocate`, { therapistId });
      fetchDbData();
    } catch (e) {
      console.error('Failed to allocate case', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        isAuthenticated,
        login,
        logout,
        currentView,
        setCurrentView,
        selectedPatientId,
        setSelectedPatientId,
        selectedPatientTab,
        setSelectedPatientTab,
        interfaceLanguage,
        setInterfaceLanguage,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        patients,
        selectedPatient,
        sessionRecords,
        supervisorCases,
        studentCompetencies,
        notifications,
        aiActivities,
        unreadNotificationCount,
        dashboardStats,
        isLoading,
        navigateToPatient,
        updatePatientGoals,
        advanceTherapyLevel,
        addSessionRecord,
        addPatient,
        deletePatient,
        updateAIActivityStatus,
        approveSupervisorCase,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        allocateCaseToTherapist,
        refreshData: () => fetchDbData(role),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
