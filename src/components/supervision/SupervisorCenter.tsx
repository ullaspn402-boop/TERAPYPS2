import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Check,
  Clock,
  Filter,
  Eye,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';

export const SupervisorCenter: React.FC = () => {
  const {
    supervisorCases,
    approveSupervisorCase,
    navigateToPatient,
    setCurrentView,
    currentUser,
  } = useApp();

  const [activeTab] = useState<'priority'>('priority');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<'All' | 'High' | 'Milestone'>('All');
  const [signedCaseIds, setSignedCaseIds] = useState<string[]>([]);

  // Compute caseload stats from supervisorCases (backend data)
  const totalActiveCases = supervisorCases.length;
  const highPriorityCaseCount = supervisorCases.filter((c) => c.priority === 'High').length;
  const amberPriorityCaseCount = supervisorCases.filter((c) => c.priority === 'Amber').length;
  const normalPriorityCaseCount = supervisorCases.filter((c) => c.priority === 'Normal').length;
  const urgentCount = highPriorityCaseCount;

  const filteredCases = supervisorCases.filter((c) => {
    if (selectedCaseFilter === 'High') return c.priority === 'High';
    if (selectedCaseFilter === 'Milestone') return c.reportPending;
    return true;
  });

  const handleSignOff = (caseId: string, headline: string) => {
    setSignedCaseIds((prev) => [...prev, caseId]);
    approveSupervisorCase(caseId, `Dr. Sarah Mehta approved plan adjustments for ${headline}.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Illustrated Avatar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser?.name || "Dr. Sarah Mehta"} role="supervisor" size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentUser?.name || "Dr. Sarah Mehta"}</h2>
              <span className="text-xs bg-[#E0F2F1] text-[#006A61] font-semibold px-2.5 py-0.5 rounded-full border border-[#006A61]/20">
                Senior Clinical Supervisor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {supervisorCases.length > 0
                ? `Overseeing ${totalActiveCases} Active Supervised Clinical Cases`
                : 'Loading caseload...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Case Allocation removed from Supervisor portal — only Student Therapist uses AI Supervisor Recommendation */}
        </div>
      </div>

      {/* 24 Active Cases Metric Breakdown Strip */}
      <div className="bg-[#041627] text-white p-5 rounded-2xl border border-slate-700 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Active Caseload Overview</h3>
          <span className="text-xs font-mono text-[#86F2E4] bg-slate-800 px-3 py-1 rounded-full font-bold">
            {totalActiveCases} Active Cases Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-red-300 font-bold uppercase block">HIGH PRIORITY</span>
              <span className="text-xl font-extrabold text-red-400">{highPriorityCaseCount} Cases</span>
            </div>
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-300 font-bold uppercase block">REVIEW SOON</span>
              <span className="text-xl font-extrabold text-amber-400">{amberPriorityCaseCount} Cases</span>
            </div>
            <Clock className="w-6 h-6 text-amber-400" />
          </div>

          <div className="bg-teal-500/10 border border-teal-500/30 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-teal-300 font-bold uppercase block">NORMAL STABLE</span>
              <span className="text-xl font-extrabold text-[#86F2E4]">{normalPriorityCaseCount} Cases</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-[#86F2E4]" />
          </div>
        </div>
      </div>

      {/* Supervisor Section Header — Priority Triage Queue */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <div
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#006A61] text-white flex items-center gap-2"
        >
          Supervisor Priority Triage Queue{urgentCount > 0 ? ` (${urgentCount} Urgent)` : ''}
        </div>
      </div>

      {/* VIEW: PRIORITY CASE TRIAGE */}
      {activeTab === 'priority' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Every priority case explicitly details what happened, why attention is required, and what actions to review.
            </p>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              {(['All', 'High', 'Milestone'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedCaseFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                    selectedCaseFilter === filter
                      ? 'bg-[#006A61] text-white'
                      : 'text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredCases.map((c) => {
              const isSigned = signedCaseIds.includes(c.caseId);
              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    c.priority === 'High' && !isSigned
                      ? 'bg-red-50/50 border-red-200 shadow-xs'
                      : c.priority === 'Amber' && !isSigned
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                            c.priority === 'High'
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : c.priority === 'Amber'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          PRIORITY: {c.priority.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                          CASE #{c.caseId}
                        </span>
                        <strong className="text-slate-900 text-base">{c.patientName}</strong>
                        <span className="text-xs text-slate-500">
                          (Clinician: <strong className="text-slate-800">{c.assignedTherapist}</strong>)
                        </span>
                      </div>

                      {isSigned && (
                        <span className="text-xs font-bold text-[#006A61] bg-[#E0F2F1] px-3 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                          <CheckCircle2 className="w-4 h-4" />
                          Supervisor Approved
                        </span>
                      )}
                    </div>

                    {/* WHY PRIORITIZED - Explicit Reason Card */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-red-700 font-bold">
                        <ShieldAlert className="w-4 h-4" />
                        <span>WHY DOES THIS CASE NEED ATTENTION?</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {c.reason}
                      </p>

                      {/* Metrics checklist */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">SESSIONS</span>
                          <span className="font-bold text-slate-800">{c.sessionsCompleted} completed</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">CONVERSATION</span>
                          <span className="font-bold text-slate-800">{c.conversationScore}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">GOAL STATUS</span>
                          <span className="font-bold text-amber-700">Plateau</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">PROGRESS REPORT</span>
                          <span className="font-bold text-red-600">{c.reportPending ? 'Pending' : 'Done'}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[9px]">SUPERVISOR REVIEW</span>
                          <span className="font-bold text-red-600">Required</span>
                        </div>
                      </div>
                    </div>

                    {/* Supervisor Actions Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigateToPatient(c.patientId, 'overview')}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Review Case</span>
                        </button>

                        <button
                          onClick={() => navigateToPatient(c.patientId, 'reports')}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                          <span>Open Report</span>
                        </button>

                        <button
                          onClick={() => navigateToPatient(c.patientId, 'progress')}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Progress</span>
                        </button>

                        <button
                          onClick={() => navigateToPatient(c.patientId, 'therapy-plan')}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                          <span>Review Therapy Plan</span>
                        </button>
                      </div>

                      {!isSigned && (
                        <button
                          onClick={() => handleSignOff(c.caseId, c.headline)}
                          className="px-4 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ml-auto"
                        >
                          <Check className="w-4 h-4 text-[#86F2E4]" />
                          <span>Approve & Sign Off</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Competency Evaluation panel removed — the tab is gone.
          Evaluation feedback is entered through Therapy Plan Review. */}
    </div>
  );
};
