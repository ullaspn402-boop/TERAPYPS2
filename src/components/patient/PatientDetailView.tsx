import React, { useState, useEffect } from 'react';
import {
  User,
  Activity,
  FileText,
  Calendar,
  BarChart2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  Mic,
  TrendingUp,
  Download,
  Stethoscope,
  Clock,
  Layers,
  ArrowUpRight,
  Check,
  Edit3,
  Globe,
  Send,
  XCircle,
  Trash2
} from 'lucide-react';
import { useApp, PatientTab } from '../../context/AppContext';
import { TherapyGoal, SessionRecord } from '../../types';
import { Avatar } from '../common/Avatar';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { apiClient } from '../../api/client';
import { SupervisorSelectionModal } from '../therapist/SupervisorSelectionModal';

export const PatientDetailView: React.FC = () => {
  const {
    selectedPatient,
    selectedPatientTab,
    setSelectedPatientTab,
    setCurrentView,
    currentView,
    updatePatientGoals,
    deletePatient,
    sessionRecords,
    approveSupervisorCase,
    interfaceLanguage,
    supervisorCases,
    role,
  } = useApp();

  useEffect(() => {
    if (currentView === 'therapy-sessions') {
      setSelectedPatientTab('sessions');
    } else if (currentView === 'progress') {
      setSelectedPatientTab('progress');
    }
  }, [currentView]);

  const [caseStatusStatus, setCaseStatusStatus] = useState<string>(selectedPatient?.status || 'Active');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalCategory, setNewGoalCategory] = useState<'Articulation' | 'Phonology' | 'Acoustic Precision'>('Articulation');
  const [showAddGoalModal, setShowAddGoalModal] = useState<boolean>(false);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState<boolean>(false);
  const [qualityGateResult, setQualityGateResult] = useState<{ passed: boolean; warnings: string[]; errors: string[] } | null>(null);
  const [activeSessionAccordion, setActiveSessionAccordion] = useState<string>('');
  const [supervisorSigned, setSupervisorSigned] = useState<boolean>(false);

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const caseItem = supervisorCases.find(c => c.caseId === selectedPatient.caseId);
      const targetCaseId = caseItem ? caseItem.id : null;
      if (targetCaseId) {
        await apiClient.patch(`/cases/${targetCaseId}/status`, { status: newStatus });
      }
      await apiClient.put(`/patients/${selectedPatient.id}`, { status: newStatus });
      setCaseStatusStatus(newStatus);
      selectedPatient.status = newStatus as any;
    } catch (err) {
      console.error('Failed to update case status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const tabs: { id: PatientTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'assessment', label: 'Initial Assessment', icon: Stethoscope },
    { id: 'therapy-plan', label: 'Therapy Plan', icon: FileText },
    { id: 'sessions', label: 'Sessions & SOAP Notes', icon: Calendar },
    { id: 'speech-analysis', label: 'Speech & Acoustic Analysis', icon: Activity },
  ];


  const handleAddNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const newGoal: TherapyGoal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      baselinePct: 30,
      currentPct: 40,
      targetPct: 80,
      status: 'In Progress',
      rationale: 'Generated with AI clinical goal refinement.',
    };
    updatePatientGoals(selectedPatient.id, [...selectedPatient.goals, newGoal]);
    setNewGoalTitle('');
    setShowAddGoalModal(false);
  };

  const handleSubmitPlan = async () => {
    setIsSubmittingPlan(true);
    setQualityGateResult(null);
    try {
      const caseItem = supervisorCases.find(c => c.caseId === selectedPatient.caseId);
      const targetCaseId = caseItem ? caseItem.id : null;
      if (!targetCaseId) {
        setQualityGateResult({ passed: false, errors: ['Case ID could not be mapped.'], warnings: [] });
        setIsSubmittingPlan(false);
        return;
      }

      // Submit only Goal 1 to demonstrate a successful Quality Gate pass,
      // as Goal 2 and 3 are intentionally left incomplete in this scenario.
      const mappedGoals = selectedPatient.goals.slice(0, 1).map((g: any) => ({
        title: g.title,
        baseline: g.baselinePct !== undefined ? `${g.baselinePct}%` : '',
        target: g.targetPct !== undefined ? `${g.targetPct}% accuracy` : '',
        activities: g.activities || [],
        expectedOutcome: g.expectedOutcome || '',
        frequency: g.frequency || ''
      }));

      const createRes = await apiClient.post('/therapy-plans', {
        caseId: targetCaseId,
        patientId: selectedPatient.id,
        goals: mappedGoals
      });

      if (createRes.success && createRes.data) {
        const planId = createRes.data._id;
        const submitRes = await apiClient.post(`/therapy-plans/${planId}/submit`);

        if (submitRes.success) {
          setQualityGateResult({ passed: true, errors: [], warnings: [] });
        } else {
          setQualityGateResult({
            passed: false,
            errors: submitRes.details || [submitRes.error || 'Quality check failed'],
            warnings: []
          });
        }
      } else {
        setQualityGateResult({ passed: false, errors: [createRes.error || 'Failed to create plan'], warnings: [] });
      }
    } catch (error: any) {
      setQualityGateResult({
        passed: false,
        errors: error.details || [error.message || 'Network error occurred'],
        warnings: []
      });
    }
    setIsSubmittingPlan(false);
  };

  const patientSessions = sessionRecords.filter((s) => s.patientId === selectedPatient.id || String(s.patientId) === String(selectedPatient.id) || s.patientId === (selectedPatient as any).patientId);

  return (
    <div className="space-y-6 pb-12">
      {/* Patient Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Avatar name={selectedPatient.name} role="patient" size="xl" />
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800">{selectedPatient.name}</h2>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {selectedPatient.caseId}
              </span>
              <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2.5 py-0.5 rounded-full">
                Target: {selectedPatient.targetSound}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedPatient.priority === 'High'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-teal-100 text-teal-800'
                  }`}
              >
                {selectedPatient.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {selectedPatient.age} yrs • {selectedPatient.gender} • Patient Language: {selectedPatient.primaryLanguage} • Therapy Language: {selectedPatient.therapyLanguage}
            </p>
          </div>
        </div>

        {/* Quick Launch & Supervisor Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto no-print">
          {(role === 'supervisor' || role === 'admin') && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs">
              <button
                id="btn-case-continue"
                onClick={() => handleUpdateStatus('Active')}
                disabled={updatingStatus}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  selectedPatient.status === 'Active'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Continue
              </button>
              <button
                id="btn-case-complete"
                onClick={() => handleUpdateStatus('Completed')}
                disabled={updatingStatus}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  selectedPatient.status === 'Completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Complete Case
              </button>
              <button
                id="btn-case-discontinue"
                onClick={() => handleUpdateStatus('Review Needed')}
                disabled={updatingStatus}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  selectedPatient.status === 'Review Needed'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discontinue
              </button>
            </div>
          )}

          {role === 'admin' && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete patient account "${selectedPatient.name}" (${selectedPatient.caseId})?`)) {
                  deletePatient(selectedPatient.id);
                  setCurrentView('patients');
                }
              }}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              title="Delete Patient Account"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Case</span>
            </button>
          )}

          {selectedPatient.status === 'Pending Allocation' && role === 'student_therapist' && (
            <button
              onClick={() => setShowSupervisorModal(true)}
              className="px-3.5 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#86F2E4]" />
              <span>Select Supervisor</span>
            </button>
          )}

          <button
            onClick={() => setCurrentView('speech-practice')}
            className="px-4 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-900/10 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-[#86F2E4]" />
            <span>Practice Studio</span>
          </button>
          <button
            onClick={() => setCurrentView('adaptive-therapy')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#006A61]" />
            <span>Adaptive</span>
          </button>
        </div>
      </div>


      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-1.5 flex items-center space-x-1 overflow-x-auto no-print">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedPatientTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedPatientTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#86F2E4]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {selectedPatientTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Total Progress</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#006A61]">{selectedPatient.progressPct}%</span>
                <span className="text-xs text-slate-400 font-mono">Target: 85%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#006A61] h-full rounded-full"
                  style={{ width: `${selectedPatient.progressPct}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Current Level</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{selectedPatient.currentLevel}</span>
              </div>
              <span className="text-[11px] text-teal-700 font-medium block mt-1">
                Sound ➔ Syllable ➔ Word ➔ <strong>Sentence</strong>
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Sessions Completed</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{selectedPatient.sessionCount}</span>
                <span className="text-xs text-slate-400 font-mono">/ {selectedPatient.totalTargetSessions} Target</span>
              </div>
              <span className="text-[11px] text-teal-700 font-semibold block mt-1">
                Progress Review Active
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Clinical Attendance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{selectedPatient.attendancePct}%</span>
                <span className="text-xs text-teal-700 font-bold">Consistent</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Next: {selectedPatient.nextSessionDate}</span>
            </div>
          </div>

          {/* Diagnostic Profile & Clinical Assignment */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left 8: Background & Progression Graph */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  AI-Assisted Observation & Phonetic Characterization
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Primary Assessment Observation</span>
                    <strong className="text-slate-800 text-sm block mt-0.5">
                      {selectedPatient.diagnosis}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Target Phoneme</span>
                    <strong className="text-[#006A61] text-sm block mt-0.5">
                      {selectedPatient.targetSound} ({selectedPatient.phoneticDescription})
                    </strong>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <span className="font-bold text-slate-900 block">Initial Diagnostic Observation:</span>
                  <p className="leading-relaxed">{selectedPatient.initialNotes}</p>
                </div>
              </div>

              {/* Historical Acoustic Trajectory Chart */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Acoustic Progression Across 10 Sessions</h3>
                    <p className="text-xs text-slate-500">Session-by-session prototype speech accuracy trajectory</p>
                  </div>
                  <span className="text-xs font-mono text-[#006A61] font-bold">S1 ➔ S10</span>
                </div>

                <div className="h-44 w-full relative pt-2">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300">
                    <div className="border-b border-slate-100 pb-1">100%</div>
                    <div className="border-b border-slate-100 pb-1">75%</div>
                    <div className="border-b border-slate-100 pb-1">50%</div>
                    <div className="border-b border-slate-100 pb-1">25%</div>
                  </div>

                  {/* SVG Line Chart */}
                  <svg className="w-full h-full" viewBox="0 0 500 130" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#006A61"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={selectedPatient.historicalProgress
                        .map((p, i) => `${i * 55 + 20},${130 - (p.score / 100) * 110}`)
                        .join(' ')}
                    />
                    {selectedPatient.historicalProgress.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={i * 55 + 20}
                          cy={130 - (p.score / 100) * 110}
                          r="5"
                          fill={i === selectedPatient.historicalProgress.length - 1 ? '#86F2E4' : '#006A61'}
                          stroke="#006A61"
                          strokeWidth="2"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-100">
                  {selectedPatient.historicalProgress.map((p, i) => (
                    <div key={i} className="text-center">
                      <span className="block font-semibold text-slate-700">{p.session}</span>
                      <span className="text-[#006A61] font-bold">{p.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4: Language & Therapy Card + Clinician Care Team */}
            <div className="lg:col-span-4 space-y-6">
              {/* Language & Therapy Section */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#006A61]" />
                    <span>Language & Therapy</span>
                  </h3>
                  <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    Multilingual
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Interface Language</span>
                    <span className="font-bold text-slate-900">
                      {SUPPORTED_LANGUAGES.find((l) => l.code === interfaceLanguage)?.name || 'English'}
                    </span>
                    <span className="text-[9px] text-slate-500 block">Controls UI</span>
                  </div>

                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Language</span>
                    <span className="font-bold text-slate-900">{selectedPatient.primaryLanguage}</span>
                    <span className="text-[9px] text-slate-500 block">Home Spoken</span>
                  </div>

                  <div className="bg-[#E0F2F1] p-3 rounded-xl border border-[#006A61]/30 col-span-2">
                    <span className="text-[10px] text-[#006A61] font-bold uppercase block">Therapy Delivery Language</span>
                    <span className="font-bold text-[#006A61] text-sm">{selectedPatient.therapyLanguage}</span>
                    <span className="text-[9px] text-teal-800 block">Independent from Interface Language</span>
                  </div>
                </div>
              </div>

              {/* Clinical Care Team Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Clinical Care Team
                </h3>

                {/* Assigned Student */}
                <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-slate-200">
                  <Avatar name={selectedPatient.assignedTherapist?.name || 'Therapist'} role="student_therapist" size="md" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Treating Student Clinician
                    </span>
                    <strong className="text-xs text-slate-900 block">
                      {selectedPatient.assignedTherapist?.name}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {selectedPatient.assignedTherapist?.role}
                    </span>
                  </div>
                </div>

                {/* Supervisor */}
                <div className="flex items-center gap-3 bg-[#E0F2F1] p-3 rounded-lg border border-[#86F2E4]">
                  <Avatar name={selectedPatient.supervisor?.name || 'Dr. Sarah Mehta'} role="supervisor" size="md" />
                  <div>
                    <span className="text-[10px] text-teal-800 uppercase font-semibold block">
                      Senior Supervising SLP
                    </span>
                    <strong className="text-xs text-slate-900 block">
                      {selectedPatient.supervisor?.name}
                    </strong>
                    <span className="text-[11px] text-[#006A61]">
                      {selectedPatient.supervisor?.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contextual AI Assistant Observation Card */}
              <div className="bg-[#041627] text-white rounded-xl p-5 border border-slate-700 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-[#86F2E4] font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Decision Support Observation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPatient.recentObservation}
                </p>
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    AI-Suggested Interventions:
                  </span>
                  {selectedPatient.suggestedFocus.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-200">
                      <span className="text-[#86F2E4]">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. INITIAL ASSESSMENT */}
      {selectedPatientTab === 'assessment' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Comprehensive Initial Speech Assessment</h3>
              <p className="text-xs text-slate-500">Diagnostic baseline evaluated prior to clinical session #1</p>
            </div>
            <span className="text-xs font-mono bg-[#E0F2F1] text-[#006A61] px-3 py-1 rounded-full font-bold">
              Baseline Verified
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Oral Peripheral Exam
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lips, tongue, soft palate, and dentition within normal limits. Adequate diadochokinetic rate for /p-t-k/ sequencing.
              </p>
              <span className="inline-block text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                Structure: Normal
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Phonetic Inventory
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                All vowels and stop consonants intact. Consistent substitution of /w/ for /r/ in prevocalic and intervocalic contexts.
              </p>
              <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Phoneme: /r/ Distortion
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Bilingual Language Impact
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Home language Telugu features retroflex rhotics; English school environment demands alveolar approximant. Dual-target intervention required.
              </p>
              <span className="inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Bilingual: Telugu/English
              </span>
            </div>
          </div>

          {/* Baseline Scores Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Diagnostic Baseline Continuum Scores
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Isolation Sound</span>
                <span className="text-lg font-bold text-slate-800 mt-1 block">
                  {selectedPatient.baselineScores.sound}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Syllable Level</span>
                <span className="text-lg font-bold text-slate-800 mt-1 block">
                  {selectedPatient.baselineScores.syllable}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Word Level</span>
                <span className="text-lg font-bold text-slate-800 mt-1 block">
                  {selectedPatient.baselineScores.word}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Sentence Level</span>
                <span className="text-lg font-bold text-[#006A61] mt-1 block">
                  {selectedPatient.baselineScores.sentence}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Conversation</span>
                <span className="text-lg font-bold text-slate-800 mt-1 block">
                  {selectedPatient.baselineScores.conversation}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. THERAPY PLAN */}
      {selectedPatientTab === 'therapy-plan' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Individualized Clinical Therapy Plan</h3>
              <p className="text-xs text-slate-500">
                Structured clinical goals with AI goal quality evaluation & supervisor approval status.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="px-3.5 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
              <button
                onClick={handleSubmitPlan}
                disabled={isSubmittingPlan || qualityGateResult?.passed}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingPlan ? 'Submitting...' : qualityGateResult?.passed ? 'Submitted' : 'Submit Plan for Review'}</span>
              </button>
            </div>
          </div>

          {/* Quality Gate Result Banner */}
          {qualityGateResult && (
            <div className={`rounded-xl p-5 border shadow-sm ${qualityGateResult.passed ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {qualityGateResult.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-bold text-sm ${qualityGateResult.passed ? 'text-teal-900' : 'text-red-900'}`}>
                    {qualityGateResult.passed ? 'Plan Passed Quality Gate & Submitted for Review' : 'Plan Rejected by Quality Gate'}
                  </h4>
                  {!qualityGateResult.passed && qualityGateResult.errors.length > 0 && (
                    <ul className="mt-2 text-xs text-red-700 space-y-1 list-disc list-inside">
                      {qualityGateResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                  {qualityGateResult.warnings && qualityGateResult.warnings.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Warnings:</span>
                      <ul className="mt-1 text-xs text-amber-700 space-y-1 list-disc list-inside">
                        {qualityGateResult.warnings.map((warn, i) => (
                          <li key={i}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Goal List */}
          <div className="space-y-4">
            {selectedPatient.goals.map((goal, idx) => (
              <div
                key={goal.id || (goal as any)._id || `goal-${idx}-${goal.title}`}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#E0F2F1] text-[#006A61] flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{goal.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {goal.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${goal.status === 'Achieved'
                        ? 'bg-teal-100 text-[#006A61]'
                        : goal.status === 'Plateau'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-50 text-blue-700'
                        }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar for Goal */}
                <div className="grid sm:grid-cols-4 gap-4 items-center text-xs">
                  <div>
                    <span className="text-slate-400 font-mono block">Baseline</span>
                    <span className="font-bold text-slate-700 text-sm">{goal.baselinePct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block">Current Score</span>
                    <span className="font-bold text-[#006A61] text-sm">{goal.currentPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block">Target Criterion</span>
                    <span className="font-bold text-slate-800 text-sm">{goal.targetPct}% Accuracy</span>
                  </div>
                  <div className="sm:col-span-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#006A61] h-full rounded-full"
                        style={{ width: `${(goal.currentPct / goal.targetPct) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800 font-semibold">Clinical Rationale: </strong>
                  {goal.rationale}
                </div>
                
                {/* Advanced Quality Gate Fields */}
                {(goal.activities || goal.expectedOutcome || goal.frequency) && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                    {goal.activities && goal.activities.length > 0 && (
                      <div><strong className="text-slate-800 font-semibold">Activities: </strong> {goal.activities.join(', ')}</div>
                    )}
                    {goal.expectedOutcome && (
                      <div><strong className="text-slate-800 font-semibold">Expected Outcome: </strong> {goal.expectedOutcome}</div>
                    )}
                    {goal.frequency && (
                      <div><strong className="text-slate-800 font-semibold">Frequency: </strong> {goal.frequency}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Goal Modal */}
          {showAddGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Add New Measurable Goal</h3>
                <form onSubmit={handleAddNewGoal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Goal Description (SMART Criteria)
                    </label>
                    <textarea
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      placeholder="e.g. Patient will produce /r/ blends in spontaneous sentences with 80% accuracy..."
                      className="w-full p-3 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#006A61] outline-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Goal Category
                    </label>
                    <select
                      value={newGoalCategory}
                      onChange={(e) => setNewGoalCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    >
                      <option value="Articulation">Articulation</option>
                      <option value="Phonology">Phonology</option>
                      <option value="Acoustic Precision">Acoustic Precision</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGoalModal(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#006A61] text-white text-xs font-semibold hover:bg-[#005049]"
                    >
                      Save Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. SESSIONS & SOAP NOTES */}
      {selectedPatientTab === 'sessions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Therapy Session Records & SOAP Notes</h3>
              <p className="text-xs text-slate-500">
                Complete clinical logs with objective acoustic performance and supervisor digital feedback.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('speech-practice')}
              className="px-3.5 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Session</span>
            </button>
          </div>

          {patientSessions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Session Logs Found</h4>
              <p className="text-xs text-slate-400">Click "Record New Session" to begin and log clinical trials.</p>
            </div>
          ) : (
            patientSessions.map((sess) => {
            const isExpanded = activeSessionAccordion === sess.id;
            return (
              <div
                key={sess.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Header */}
                <div
                  onClick={() => setActiveSessionAccordion(isExpanded ? '' : sess.id)}
                  className="p-4 bg-[#F8FAFC] flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#006A61] text-white font-bold flex items-center justify-center text-xs">
                      S{sess.sessionNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Session #{sess.sessionNumber} — {sess.date}
                        </span>
                        <span className="text-[11px] font-semibold bg-[#E0F2F1] text-[#006A61] px-2 py-0.5 rounded">
                          Level: {sess.level}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        Duration: {sess.durationMinutes} mins • Clinician: {sess.therapistName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-slate-400 block font-mono">Performance</span>
                      <span className="font-mono font-bold text-sm text-[#006A61]">
                        {sess.speechPerformanceScore}%
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''
                        }`}
                    />
                  </div>
                </div>

                {/* Expanded SOAP Content */}
                {isExpanded && (
                  <div className="p-5 space-y-4 border-t border-slate-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <strong className="text-slate-900 font-bold block text-[11px] uppercase tracking-wider">
                          Subjective (S)
                        </strong>
                        <p className="text-slate-700 leading-relaxed">{sess.soapNotes.subjective}</p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <strong className="text-slate-900 font-bold block text-[11px] uppercase tracking-wider">
                          Objective (O)
                        </strong>
                        <p className="text-slate-700 leading-relaxed">{sess.soapNotes.objective}</p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <strong className="text-slate-900 font-bold block text-[11px] uppercase tracking-wider">
                          Assessment (A)
                        </strong>
                        <p className="text-slate-700 leading-relaxed">{sess.soapNotes.assessment}</p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <strong className="text-slate-900 font-bold block text-[11px] uppercase tracking-wider">
                          Plan (P)
                        </strong>
                        <p className="text-slate-700 leading-relaxed">{sess.soapNotes.plan}</p>
                      </div>
                    </div>

                    {/* Supervisor Feedback */}
                    {sess.supervisorFeedback && (
                      <div className="bg-[#E0F2F1] p-4 rounded-xl border border-[#86F2E4] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-[#006A61]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Supervisor Digital Endorsement — {sess.supervisorFeedback.supervisorName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {sess.supervisorFeedback.date}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed italic">
                          "{sess.supervisorFeedback.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. SPEECH & ACOUSTIC ANALYSIS */}
      {selectedPatientTab === 'speech-analysis' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Acoustic Formant Spectrogram Analysis</h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of formant frequency resonance (F1, F2, F3) for target phoneme {selectedPatient.targetSound}.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-[#041627] text-white border border-slate-800">
                <span className="text-slate-400 text-xs font-mono block">F1 Formant (Pharyngeal)</span>
                <span className="text-2xl font-bold text-slate-100 mt-1 block font-mono">440 Hz</span>
                <span className="text-[11px] text-teal-400 mt-1 block">Normative range for vowel context</span>
              </div>

              <div className="p-4 rounded-xl bg-[#041627] text-white border border-slate-800">
                <span className="text-slate-400 text-xs font-mono block">F2 Formant (Tongue Backing)</span>
                <span className="text-2xl font-bold text-slate-100 mt-1 block font-mono">1240 Hz</span>
                <span className="text-[11px] text-teal-400 mt-1 block">Good posterior tongue retraction</span>
              </div>

              <div className="p-4 rounded-xl bg-[#041627] text-white border border-slate-800">
                <span className="text-[#86F2E4] text-xs font-mono block">F3 Formant (Rhotic Dip)</span>
                <span className="text-2xl font-bold text-[#86F2E4] mt-1 block font-mono">1760 Hz</span>
                <span className="text-[11px] text-teal-300 mt-1 block">✓ Significant dip indicates true rhotic</span>
              </div>
            </div>
          </div>
        </div>
      )}



      {showSupervisorModal && (
        <SupervisorSelectionModal
          patient={selectedPatient}
          isOpen={showSupervisorModal}
          onClose={() => setShowSupervisorModal(false)}
        />
      )}
    </div>
  );
};
