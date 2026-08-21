import React from 'react';
import { FileSpreadsheet, Download, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { patients, navigateToPatient } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Clinical Reports & Milestone Documentation</h2>
          <p className="text-xs text-slate-500">
            Official 10-session summaries, diagnostic intake baselines, and discharge readiness evaluations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {patients.map((p) => (
          <div
            key={p.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E0F2F1] text-[#006A61] flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    10-Session Clinical Progress Summary: {p.name}
                  </h4>
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {p.caseId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: {p.targetSound} • Treating SLP: {p.assignedTherapist?.name} • Supervisor: {p.supervisor?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => navigateToPatient(p.id, 'progress')}
                className="px-3.5 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span>Open Milestone Summary</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
