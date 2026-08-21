import { Avatar } from './Avatar';
import React, { useState, useMemo } from 'react';
import { Search, User, FileText, Activity, X, ArrowRight, Stethoscope, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, patients, navigateToPatient, setCurrentView } = useApp();
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        patients: patients.slice(0, 3),
        topics: [
          { title: 'Adaptive Progression Guidelines', view: 'adaptive-therapy' },
          { title: '10-Session Milestone Protocol', view: 'reports' },
          { title: 'Supervisor Case Intervention Queue', view: 'supervisor-center' },
          { title: 'Telugu Rhotic Stimulus Bank', view: 'speech-practice' },
        ],
      };
    }
    const q = query.toLowerCase();
    const matchedPatients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.caseId.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.targetSound.toLowerCase().includes(q) ||
        p.therapyLanguage.toLowerCase().includes(q)
    );

    return {
      patients: matchedPatients,
      topics: [
        { title: `Practice Stimuli for "${query}"`, view: 'speech-practice' },
        { title: `Clinical Notes mentioning "${query}"`, view: 'patient-detail' },
        { title: `Therapy Plans with "${query}"`, view: 'therapy-plans' },
      ],
    };
  }, [query, patients]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-[#F8FAFC]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, Case IDs (e.g. SLT-087), target sounds (/r/, /s/), therapists..."
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:ring-0"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded font-mono"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
          {/* Patient Matches */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Patient Records ({filteredResults.patients.length})</span>
            </div>
            {filteredResults.patients.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No patients matching your search.</p>
            ) : (
              <div className="space-y-1.5">
                {filteredResults.patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      navigateToPatient(patient.id, 'overview');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F2F4F6] text-left transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.avatarUrl}
                        alt={patient.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{patient.name}</span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {patient.caseId}
                          </span>
                          <span className="text-[11px] font-semibold text-[#006A61] bg-[#E0F2F1] px-1.5 py-0.5 rounded">
                            {patient.targetSound}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {patient.diagnosis} • {patient.therapyLanguage} • {patient.currentLevel} Level
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div className="text-xs">
                        <span className="text-slate-400 block">Progress</span>
                        <span className="font-semibold text-[#006A61]">{patient.progressPct}%</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Nav Actions */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Clinical Tools & Views
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setCurrentView('speech-practice');
                  setIsSearchOpen(false);
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-[#E0F2F1]/50 hover:border-[#006A61]/40 text-left transition-colors text-xs font-medium text-slate-800"
              >
                <Activity className="w-4 h-4 text-[#006A61]" />
                <div>
                  <span className="block font-semibold">Speech Practice Studio</span>
                  <span className="text-[11px] text-slate-500">Record & analyze speech</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentView('supervisor-center');
                  setIsSearchOpen(false);
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-[#E0F2F1]/50 hover:border-[#006A61]/40 text-left transition-colors text-xs font-medium text-slate-800"
              >
                <Stethoscope className="w-4 h-4 text-[#006A61]" />
                <div>
                  <span className="block font-semibold">Supervisor Command Center</span>
                  <span className="text-[11px] text-slate-500">Priority cases & reviews</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentView('adaptive-therapy');
                  setIsSearchOpen(false);
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-[#E0F2F1]/50 hover:border-[#006A61]/40 text-left transition-colors text-xs font-medium text-slate-800"
              >
                <FileText className="w-4 h-4 text-[#006A61]" />
                <div>
                  <span className="block font-semibold">Adaptive Progression Engine</span>
                  <span className="text-[11px] text-slate-500">Sound to Conversation ladder</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentView('ai-allocation');
                  setIsSearchOpen(false);
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-[#E0F2F1]/50 hover:border-[#006A61]/40 text-left transition-colors text-xs font-medium text-slate-800"
              >
                <User className="w-4 h-4 text-[#006A61]" />
                <div>
                  <span className="block font-semibold">AI Case Allocation</span>
                  <span className="text-[11px] text-slate-500">Match patient to therapist</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-4">
          <span>Navigate with arrows or click</span>
          <span className="font-mono text-[11px]">SPEECHCARE AI Global Directory</span>
        </div>
      </div>
    </div>
  );
};
