import { Avatar } from '../common/Avatar';
import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';
import { THERAPIST_CANDIDATES } from '../../data/mockData';

import { SupervisorSelectionModal } from '../therapist/SupervisorSelectionModal';

export const AICaseAllocationView: React.FC = () => {
  const { selectedPatient, navigateToPatient, supervisorCases } = useApp();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  // Find the exact Case MongoDB ID instead of the Patient MongoDB ID
  const caseItem = supervisorCases.find(c => c.caseId === selectedPatient.caseId);
  const targetId = caseItem ? caseItem.id : selectedPatient.id;

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);

    const fallbackCandidates = THERAPIST_CANDIDATES.map(c => ({
      therapistId: c.id,
      therapistName: c.name,
      role: c.role,
      supervisorName: c.supervisorName,
      matchScore: c.matchScore,
      reasons: c.matchReasons,
      availability: c.availability,
      avatarType: c.name.includes('Rohan') || c.name.includes('Mohit') ? 'male' : 'female'
    }));

    apiClient.get('/cases/' + targetId + '/allocation-recommendations')
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCandidates(res.data);
          setSelectedCandidateId(res.data[0].therapistId);
          setError(null);
        } else {
          setCandidates(fallbackCandidates);
          setSelectedCandidateId(fallbackCandidates[0].therapistId);
          setError(null);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setCandidates(fallbackCandidates);
        setSelectedCandidateId(fallbackCandidates[0].therapistId);
        setError(null);
        setIsLoading(false);
      });
  }, [targetId]);
  const [isAllocated, setIsAllocated] = useState<boolean>(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#006A61]" />
            <h2 className="text-lg font-bold text-slate-900">AI Supervisor Recommendation</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmically matches this patient's linguistic profile and diagnosis with available Supervising SLPs based on clinical expertise and caseload capacity.
          </p>
        </div>
      </div>

      {/* Target Case Info Card */}
      <div className="bg-[#041627] text-white rounded-xl p-5 border border-slate-700 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={selectedPatient.name} role="patient" gender={selectedPatient.gender} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{selectedPatient.name}</h3>
                <span className="text-xs font-mono text-[#86F2E4] bg-slate-800 px-2 py-0.5 rounded">
                  {selectedPatient.caseId}
                </span>
                <span className="text-xs bg-[#006A61] text-white px-2 py-0.5 rounded-full font-bold">
                  {selectedPatient.targetSound}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedPatient.diagnosis} • Languages: {selectedPatient.primaryLanguage}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-mono">Prescribed Regimen</span>
            <span className="text-xs font-semibold text-[#86F2E4]">
              16 Sessions Total • Bi-weekly Morning Slots
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Clinicians List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Recommended Supervising SLPs</h3>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Loading algorithm recommendations...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No suitable clinician candidates found for this case profile.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {candidates.map((cand) => {
            const isSelected = selectedCandidateId === cand.therapistId;
            
            // Extract caseload from backend rationale string (e.g. "Moderate current caseload (6/8)")
            let activeCaseload = 0;
            let maxCaseload = 8;
            const caseloadReason = (cand.reasons || []).find((r: string) => r.includes('caseload ('));
            if (caseloadReason) {
              const match = caseloadReason.match(/\((\d+)\/(\d+)\)/);
              if (match) {
                activeCaseload = parseInt(match[1], 10);
                maxCaseload = parseInt(match[2], 10);
              }
            }

            return (
              <div
                key={cand.therapistId}
                onClick={() => setSelectedCandidateId(cand.therapistId)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#E0F2F1]/50 border-[#006A61] shadow-md ring-2 ring-[#006A61]/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Match Score Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-[#006A61] bg-[#E0F2F1] px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{cand.matchScore}% Match Score</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#006A61] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Clinician Profile */}
                  <div className="flex items-center gap-3 pt-1">
                    <Avatar name={cand.therapistName} role={cand.role} gender={cand.avatarType || "neutral"} size="md" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cand.therapistName}</h4>
                      <span className="text-xs text-slate-500 block">{cand.role.replace('_', ' ')}</span>
                      <span className="text-[11px] text-teal-800 font-semibold font-mono">
                        Supervisor: {cand.supervisorName || "Assigned Supervisor"}
                      </span>
                    </div>
                  </div>

                  {/* Caseload & Capacity */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Caseload:</span>
                      <strong className="text-slate-800 font-mono">
                        {activeCaseload} / {maxCaseload} Cases
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule:</span>
                      <span className="text-slate-700">{cand.availability || 'Standard Hours'}</span>
                    </div>
                  </div>

                  {/* Reasons List */}
                  <div className="space-y-1 pt-1 text-[11px] text-slate-600">
                    <strong className="text-slate-800 block text-xs">Matching Rationale:</strong>
                    {(cand.reasons || []).map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="text-[#006A61] font-bold">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[#006A61] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Selected Candidate' : 'Select Clinician'}
                </button>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Action: Student Therapist selects a Supervisor */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Request Supervisor Assignment</h4>
          <p className="text-xs text-slate-500">
            Submit this case to a Supervising SLP for clinical review. Once accepted, the supervisor will co-sign all session reports.
          </p>
        </div>

        {!isAllocated ? (
          <button
            onClick={() => setShowSupervisorModal(true)}
            className="px-6 py-2.5 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-[#86F2E4]" />
            <span>Select Supervisor</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#006A61] bg-[#E0F2F1] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Supervisor Request Submitted!
            </span>
            <button
              onClick={() => navigateToPatient(selectedPatient.id, 'overview')}
              className="text-xs font-semibold text-slate-700 hover:underline"
            >
              Open Patient Record ➔
            </button>
          </div>
        )}
      </div>

      {showSupervisorModal && (
        <SupervisorSelectionModal
          patient={selectedPatient}
          isOpen={showSupervisorModal}
          onClose={() => setShowSupervisorModal(false)}
          onSelectSuccess={() => {
            setIsAllocated(true);
          }}
        />
      )}
    </div>
  );
};
