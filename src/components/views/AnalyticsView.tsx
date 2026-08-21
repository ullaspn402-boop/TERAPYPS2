import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, ShieldCheck, Award, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { dashboardStats, patients, isLoading } = useApp();

  const {
    activeCases,
    totalCases,
    avgProgress,
    avgSupervisorRating,
    sessionsThisWeek,
    reportsDue,
    highPriority,
    amberPriority,
    langDistribution,
    phonemeProgress,
  } = dashboardStats;

  // If no lang distribution from backend, derive from patients array
  const langData = langDistribution.length > 0
    ? langDistribution
    : (() => {
        const counts: Record<string, number> = {};
        patients.forEach((p) => {
          if (p.therapyLanguage) {
            const lang = p.therapyLanguage.trim();
            counts[lang] = (counts[lang] || 0) + 1;
          }
        });
        const total = patients.length || 1;
        return Object.entries(counts)
          .map(([language, count]) => ({
            language,
            count,
            percent: Math.round((count / total) * 100),
          }))
          .sort((a, b) => b.count - a.count);
      })();

  // If no phoneme progress from backend, derive from patients array
  const phonemeData = phonemeProgress.length > 0
    ? phonemeProgress
    : (() => {
        const sounds: Record<string, { totalBaseline: number; totalCurrent: number; count: number }> = {};
        patients.forEach((p) => {
          if (p.targetSound) {
            const s = p.targetSound.trim();
            if (!sounds[s]) sounds[s] = { totalBaseline: 0, totalCurrent: 0, count: 0 };
            sounds[s].totalBaseline += p.baselineScores?.sentence || 0;
            sounds[s].totalCurrent += p.currentScores?.sentence || p.progressPct || 0;
            sounds[s].count++;
          }
        });
        return Object.entries(sounds).map(([sound, data]) => ({
          sound,
          avgBaseline: data.count > 0 ? Math.round(data.totalBaseline / data.count) : 0,
          avgCurrent: data.count > 0 ? Math.round(data.totalCurrent / data.count) : 0,
          count: data.count,
        }));
      })();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#006A61] animate-spin" />
          <p className="text-sm text-slate-500">Loading analytics from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Institutional Clinical Analytics</h2>
        <p className="text-xs text-slate-500">
          Aggregated performance across {totalCases} clinical case{totalCases !== 1 ? 's' : ''},
          {' '}{patients.length} patient{patients.length !== 1 ? 's' : ''},
          and {langData.length} therapy language{langData.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Top metrics — all from backend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Active Cases</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{activeCases}</span>
          <span className="text-[11px] text-teal-700 font-medium block mt-1">
            {totalCases > 0 ? `${Math.round((activeCases / totalCases) * 100)}% of total` : 'No cases yet'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Average Patient Progress</span>
          <span className="text-2xl font-bold text-[#006A61] mt-1 block">{avgProgress}%</span>
          <span className="text-[11px] text-teal-700 font-medium block mt-1">Across all active patients</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Sessions This Week</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{sessionsThisWeek}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Live from session records</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Supervisor Audit Rating</span>
          <span className="text-2xl font-bold text-teal-800 mt-1 block">
            {avgSupervisorRating > 0 ? `${avgSupervisorRating.toFixed(1)} / 5.0` : 'N/A'}
          </span>
          <span className="text-[11px] text-teal-700 font-medium block mt-1">
            {avgSupervisorRating > 0 ? 'From evaluation records' : 'No evaluations yet'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Phoneme Accuracy Progress — from patients in DB */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Target Phoneme Accuracy Progress</h3>
          {phonemeData.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No phoneme data available yet.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {phonemeData.map((ph) => {
                const gain = ph.avgCurrent - ph.avgBaseline;
                const gainText = gain >= 0 ? `+${gain}%` : `${gain}%`;
                const gainColor = gain >= 20 ? 'text-[#006A61]' : gain >= 0 ? 'text-amber-700' : 'text-red-600';
                return (
                  <div key={ph.sound}>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>{ph.sound} ({ph.count} patient{ph.count !== 1 ? 's' : ''})</span>
                      <span className={`${gainColor} font-mono font-bold`}>
                        {gainText} Gain (Baseline {ph.avgBaseline}% → {ph.avgCurrent}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="bg-[#006A61] h-full rounded-full"
                        style={{ width: `${Math.min(ph.avgCurrent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Language Distribution — from patients in DB */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Language Distribution Across Caseload</h3>
          {langData.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No language data available yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              {langData.slice(0, 8).map((ld) => (
                <div key={ld.language} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-mono">{ld.language}</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">{ld.percent}%</span>
                  <span className="text-[10px] text-slate-400">{ld.count} patient{ld.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Case Priority Distribution</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
            <span className="text-red-700 font-bold text-2xl block">{highPriority}</span>
            <span className="text-red-600 font-medium">High Priority</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
            <span className="text-amber-700 font-bold text-2xl block">{amberPriority}</span>
            <span className="text-amber-600 font-medium">Review Soon</span>
          </div>
          <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl text-center">
            <span className="text-teal-700 font-bold text-2xl block">
              {totalCases - highPriority - amberPriority}
            </span>
            <span className="text-teal-600 font-medium">Normal Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
