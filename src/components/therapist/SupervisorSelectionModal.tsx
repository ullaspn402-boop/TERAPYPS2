import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Avatar } from '../common/Avatar';
import { Patient } from '../../types';
import { useApp } from '../../context/AppContext';

interface SupervisorUser {
  _id: string;
  name: string;
  email: string;
  title?: string;
  specialties?: string[];
  activeCaseload?: number;
  maxCaseload?: number;
  avatarType?: string;
}

interface SupervisorSelectionModalProps {
  patient: Patient;
  /** The resolved MongoDB _id of the Case document. Passed in by AICaseAllocationView
   *  so the modal submits to the correct case regardless of seeded vs. new data. */
  caseMongoId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSuccess: (supervisorName: string) => void;
}

export const SupervisorSelectionModal: React.FC<SupervisorSelectionModalProps> = ({
  patient,
  caseMongoId,
  isOpen,
  onClose,
  onSelectSuccess,
}) => {
  const { refreshData } = useApp();
  const [supervisors, setSupervisors] = useState<SupervisorUser[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    // Load REAL supervisor accounts directly from the backend
    apiClient
      .get('/users/supervisors')
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setSupervisors(res.data);
          setSelectedSupervisorId(res.data[0]._id);
          setError(null);
        } else {
          setSupervisors([]);
          setError('No Supervisor accounts are currently available. Ask your institution to register a Supervisor.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load supervisor list. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmSupervisor = async () => {
    if (!selectedSupervisorId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const chosenSup = supervisors.find((s) => s._id === selectedSupervisorId);

      // Prioritize patient.id (the patient's unique MongoDB _id) for 100% exact targeting
      const candidateIds = [patient.id, caseMongoId, patient.caseId].filter(Boolean) as string[];
      let lastError = '';
      let successRes: any = null;

      for (const targetId of candidateIds) {
        try {
          const res = await apiClient.patch(`/cases/${targetId}/supervisor`, {
            supervisorId: selectedSupervisorId,
          });
          if (res.success) {
            successRes = res;
            break;
          }
          lastError = res.error || 'Failed';
        } catch (e: any) {
          lastError = e.message || 'Failed';
        }
      }

      if (successRes && successRes.success) {
        await refreshData();
        onSelectSuccess(chosenSup?.name || 'Selected Supervisor');
        onClose();
      } else {
        setError(lastError || 'Failed to assign supervisor. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending case to supervisor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#006A61] p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#86F2E4]" />
              <h3 className="font-bold text-base">Select Supervising SLP</h3>
            </div>
            <p className="text-xs text-[#86F2E4] mt-0.5">
              Submit Case <span className="font-mono">{patient.caseId}</span> ({patient.name}) for clinical supervision review
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Supervisors Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Available Clinical Supervisors ({supervisors.length})
            </label>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                Loading supervisor accounts...
              </div>
            ) : supervisors.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                No Supervisor accounts are currently available.
              </div>
            ) : (
              <div className="space-y-2.5">
                {supervisors.map((sup) => {
                  const isSelected = selectedSupervisorId === sup._id;

                  return (
                    <div
                      key={sup._id}
                      onClick={() => setSelectedSupervisorId(sup._id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E0F2F1]/60 border-[#006A61] ring-2 ring-[#006A61]/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={sup.name} role="supervisor" gender={sup.avatarType || 'neutral'} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{sup.name}</h4>
                          </div>
                          <span className="text-xs text-slate-500 block">{sup.title || 'Clinical Supervisor'}</span>
                          {sup.specialties && sup.specialties.length > 0 && (
                            <span className="text-[11px] text-teal-800 font-medium">
                              Specialties: {sup.specialties.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-[11px] text-slate-500 hidden sm:block font-mono">
                          <div>Caseload: {sup.activeCaseload || 0}/{sup.maxCaseload || 12}</div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-[#006A61] border-[#006A61] text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Case status will set to: <strong>Pending Supervisor Review</strong></span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSupervisor}
              disabled={isSubmitting || !selectedSupervisorId || isLoading || supervisors.length === 0}
              className="px-5 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit to Supervisor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
