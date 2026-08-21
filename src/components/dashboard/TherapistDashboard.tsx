import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Mic,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Plus,
  Play,
  FileText,
  UserCheck,
  Stethoscope,
  Filter,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { Avatar } from '../common/Avatar';

export const TherapistDashboard: React.FC = () => {
  const {
    patients,
    navigateToPatient,
    setCurrentView,
    aiActivities,
    updateAIActivityStatus,
    dashboardStats,
    isLoading,
    selectedPatient,
    currentUser,
    role,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'All' | 'High' | 'Active'>('All');

  const filteredPatients = patients.filter((p) => {
    if (selectedFilter === 'High') return p.priority === 'High' || p.status === 'Review Needed';
    if (selectedFilter === 'Active') return p.status === 'Active';
    return true;
  });

  const featuredActivity = aiActivities[0];

  // Derive stat values from real data
  const activeCasesCount = currentUser?.role === 'student_therapist'
    ? patients.length
    : (dashboardStats.activeCases > 0
        ? dashboardStats.activeCases
        : patients.filter((p) => p.status === 'Active').length);

  const awaitingReview = dashboardStats.plansAwaitingReview > 0
    ? dashboardStats.plansAwaitingReview
    : patients.filter((p) => p.status === 'Review Needed').length;

  const reportsDue = dashboardStats.reportsDue > 0
    ? dashboardStats.reportsDue
    : patients.filter((p) => p.status === 'Milestone Due').length;

  const sessionsThisWeek = dashboardStats.sessionsThisWeek;

  // Pick first real patient for quick actions (never hardcode 'p1')
  const firstPatientId = patients[0]?.id || '';

  // Supervisor note
  const supervisorName = selectedPatient?.supervisor?.name || patients[0]?.supervisor?.name || 'Supervisor';

  // Clinical roadmap derived from selected patient's current level
  const levels = ['Sound', 'Syllable', 'Word', 'Sentence', 'Conversation'] as const;
  const currentLevelIdx = selectedPatient
    ? levels.indexOf(selectedPatient.currentLevel as any)
    : -1;

  return (
    <div className="space-y-8 pb-12">
      {/* 4 Stat Cards — derived from backend data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Cases */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-slate-400 text-xs font-medium uppercase mb-1">Active Cases</p>
          {isLoading ? (
            <div className="h-8 w-10 bg-slate-100 rounded animate-pulse" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-800">
              {String(activeCasesCount).padStart(2, '0')}
            </h3>
          )}
          <div className="mt-2 flex items-center text-[10px] text-teal-600 font-bold">
            <span>{patients.length} total patients</span>
          </div>
        </div>

        {/* Weekly Sessions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-slate-400 text-xs font-medium uppercase mb-1">Weekly Sessions</p>
          {isLoading ? (
            <div className="h-8 w-10 bg-slate-100 rounded animate-pulse" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-800">
              {String(sessionsThisWeek).padStart(2, '0')}
            </h3>
          )}
          <div className="mt-2 flex items-center text-[10px] text-teal-600 font-bold">
            <span>This week</span>
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-slate-400 text-xs font-medium uppercase mb-1">Awaiting Review</p>
          {isLoading ? (
            <div className="h-8 w-10 bg-slate-100 rounded animate-pulse" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-800">
              {String(awaitingReview).padStart(2, '0')}
            </h3>
          )}
          <div className={`mt-2 flex items-center text-[10px] font-bold ${awaitingReview > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            <span>{awaitingReview > 0 ? 'Action needed' : 'All clear'}</span>
          </div>
        </div>

        {/* Reports Due */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-slate-400 text-xs font-medium uppercase mb-1">Reports Due</p>
          {isLoading ? (
            <div className="h-8 w-10 bg-slate-100 rounded animate-pulse" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-800">
              {String(reportsDue).padStart(2, '0')}
            </h3>
          )}
          <div className={`mt-2 flex items-center text-[10px] font-bold ${reportsDue > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            <span>{reportsDue > 0 ? 'Milestone reports pending' : 'No reports due'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Active Cases + Right AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">My Active Cases</h3>
            <button
              onClick={() => setCurrentView('my-cases')}
              className="text-xs font-bold text-cyan-600 uppercase hover:underline"
            >
              View All
            </button>
          </div>

          {/* Loading skeleton or cards */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-2 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
              <Users className="w-10 h-10 text-slate-300" />
              <h4 className="font-bold text-slate-700 text-sm">No Active Student Cases</h4>
              <p className="text-xs text-slate-500 max-w-xs">You have not registered or been assigned any student cases yet.</p>
              <button
                onClick={() => setCurrentView('patients')}
                className="px-4 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <Plus className="w-4 h-4" />
                <span>Register Patient</span>
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredPatients.slice(0, 4).map((patient) => {
                const isPlateau = patient.status === 'Review Needed' || patient.priority === 'High';
                return (
                  <div
                    key={patient.id}
                    onClick={() => navigateToPatient(patient.id, 'overview')}
                    className={`bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:bg-white transition-all cursor-pointer shadow-xs ${
                      isPlateau
                        ? 'border-l-4 border-l-amber-500'
                        : 'border-l-4 border-l-teal-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-800">{patient.name}</h4>
                        <p className="text-xs text-slate-500">
                          ID: {patient.caseId} • Target: {patient.targetSound}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          isPlateau
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-500">Overall Progress</span>
                          <span className="font-bold text-slate-800">{patient.progressPct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isPlateau ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${patient.progressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px]">
                        <div>
                          <p className="text-slate-400">Current Level</p>
                          <p className="font-bold text-slate-700 uppercase">{patient.currentLevel}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Therapy Language</p>
                          <p className="font-bold text-slate-700 uppercase">{patient.therapyLanguage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Supervisor Feedback Note banner removed for Student Therapist portal */}
        </div>

        {/* Right Column (4 cols): AI Clinical Assistant */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
            {/* Glowing orb decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-cyan-400">✨</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">
                  AI Clinical Assistant
                </h3>
              </div>

              <div className="space-y-5">
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Current Focus</p>
                  <p className="text-xs leading-relaxed text-slate-200 italic">
                    {selectedPatient
                      ? `Patient ${selectedPatient.name} — ${selectedPatient.targetSound} at ${selectedPatient.currentLevel} level. Progress: ${selectedPatient.progressPct}%.`
                      : 'Select a patient to view clinical context.'}
                  </p>
                </div>

                {featuredActivity ? (
                  <div className="bg-cyan-900/30 rounded-2xl p-4 border border-cyan-700/30">
                    <p className="text-[10px] text-cyan-400 uppercase font-bold mb-2">Suggested Activity</p>
                    <p className="text-sm font-semibold mb-3">{featuredActivity.title}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          updateAIActivityStatus(featuredActivity.id, 'approved');
                          setCurrentView('speech-practice');
                        }}
                        className="text-[10px] bg-cyan-500 hover:bg-cyan-400 transition-colors text-white font-bold py-1 px-3 rounded-full cursor-pointer shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setCurrentView('ai-assistant')}
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 font-bold py-1 px-3 rounded-full cursor-pointer"
                      >
                        Modify
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-cyan-900/20 rounded-2xl p-4 border border-cyan-700/20 text-xs text-slate-400">
                    No AI activity suggestions available yet.
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-3">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => firstPatientId ? navigateToPatient(firstPatientId, 'progress') : undefined}
                      className="bg-slate-800 text-[10px] p-2 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      Draft Report
                    </div>
                    <div
                      onClick={() => setCurrentView('speech-practice')}
                      className="bg-slate-800 text-[10px] p-2 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      Live Acoustic
                    </div>
                    <div
                      onClick={() => setCurrentView('ai-assistant')}
                      className="bg-slate-800 text-[10px] p-2 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      AI Insights
                    </div>
                    <div
                      onClick={() => firstPatientId ? navigateToPatient(firstPatientId, 'therapy-plan') : undefined}
                      className="bg-slate-800 text-[10px] p-2 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      Goal Check
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {selectedPatient
                    ? `Context: ${selectedPatient.name} (${selectedPatient.caseId})`
                    : 'No patient selected'}
                </span>
                <span className="text-cyan-500 font-bold">AI ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Roadmap Footer Strip — based on selected patient's level */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-6 w-full overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Clinical Roadmap:
          </span>

          <div className="flex-1 flex items-center justify-between relative min-w-[320px]">
            <div className="absolute h-0.5 bg-slate-200 w-full top-1/2 -translate-y-1/2 z-0"></div>

            {levels.map((level, idx) => {
              const isDone = currentLevelIdx > idx;
              const isCurrent = currentLevelIdx === idx;
              const isFuture = currentLevelIdx < idx;
              return (
                <div
                  key={level}
                  className={`flex items-center space-x-1.5 relative z-10 bg-slate-50 ${idx === 0 ? 'pr-3' : idx === levels.length - 1 ? 'pl-3' : 'px-3'} ${isFuture ? 'opacity-40' : ''}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${
                      isDone ? 'bg-teal-500' : isCurrent ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-tighter ${
                      isCurrent ? 'text-teal-600' : isDone ? 'text-slate-600' : 'text-slate-600'
                    }`}
                  >
                    {level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
          <button
            onClick={() => setCurrentView('speech-practice')}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 whitespace-nowrap cursor-pointer"
          >
            START NEW SESSION
          </button>
        </div>
      </div>
    </div>
  );
};
