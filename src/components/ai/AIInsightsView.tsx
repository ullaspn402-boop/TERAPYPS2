import React, { useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart2,
  Users,
  Clock,
  ShieldAlert,
  GraduationCap,
  FileSpreadsheet,
  Zap,
  BookOpen,
  Flag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ─── Helper Components ─────────────────────────────────────────────────────────

const TrendIcon: React.FC<{ change: number }> = ({ change }) => {
  if (change > 3) return <TrendingUp className="w-4 h-4 text-teal-500" />;
  if (change < -3) return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-amber-500" />;
};

const TrendLabel: React.FC<{ change: number }> = ({ change }) => {
  if (change > 3)
    return <span className="text-teal-600 font-bold">+{change}% Improving</span>;
  if (change < -3)
    return <span className="text-red-500 font-bold">{change}% Declining</span>;
  return <span className="text-amber-600 font-bold">~{change >= 0 ? '+' : ''}{change}% Stable</span>;
};

const ProgressBar: React.FC<{ value: number; color?: string }> = ({
  value,
  color = 'bg-[#006A61]',
}) => (
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
    <div
      className={`${color} h-1.5 rounded-full transition-all`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const SectionTitle: React.FC<{
  icon: React.ElementType;
  label: string;
  sub?: string;
}> = ({ icon: Icon, label, sub }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-4 h-4 text-[#006A61]" />
    <div>
      <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  </div>
);

// ─── STUDENT THERAPIST VIEW — per-patient longitudinal insights ────────────────

const StudentInsightsView: React.FC = () => {
  const { selectedPatient, sessionRecords, setCurrentView } = useApp();

  if (!selectedPatient) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-xs mt-12">
          <div className="w-16 h-16 bg-[#E0F2F1] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#006A61]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">AI Insights</h2>
          <p className="text-sm text-slate-500 mb-6">
            No patient record selected. Select a patient from your assigned cases to view longitudinal trend telemetry.
          </p>
          <button
            onClick={() => setCurrentView('my-cases')}
            className="px-6 py-2.5 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            View My Cases
          </button>
        </div>
      </div>
    );
  }

  const p = selectedPatient;

  // Compute level change from historical data
  const levelOrder = ['Sound', 'Syllable', 'Word', 'Sentence', 'Conversation'];
  const currentLevelIdx = levelOrder.indexOf(p.currentLevel);

  // Derive trend stats from historicalProgress
  const history = p.historicalProgress || [];
  const last4 = history.slice(-4);
  const earlier4 = history.slice(-8, -4);
  const avgLast4 = last4.length
    ? Math.round(last4.reduce((a, b) => a + b.score, 0) / last4.length)
    : p.progressPct;
  const avgEarlier4 = earlier4.length
    ? Math.round(earlier4.reduce((a, b) => a + b.score, 0) / earlier4.length)
    : Math.max(0, avgLast4 - 8);
  const trendChange = avgLast4 - avgEarlier4;

  // Goal progress summary
  const goals = p.goals || [];
  const goalsAchieved = goals.filter((g) => g.status === 'Achieved').length;
  const goalsInProgress = goals.filter((g) => g.status === 'In Progress').length;
  const goalsPlateaued = goals.filter((g) => g.status === 'Plateau').length;

  // Practice consistency (session attendance)
  const consistencyPct = p.attendancePct ?? 0;

  // Key attention flags
  const attentionFlags: string[] = [];
  if (goalsPlateaued > 0)
    attentionFlags.push(`${goalsPlateaued} goal(s) at plateau — review stimuli complexity`);
  if (trendChange < -3)
    attentionFlags.push('Performance declining over last 4 sessions — consider level adjustment');
  if (consistencyPct < 75)
    attentionFlags.push('Attendance below 75% — session consistency affecting progress');
  if (p.sessionCount >= 8 && p.sessionCount < 10)
    attentionFlags.push(
      `Session ${p.sessionCount} of 10 — milestone report due soon`
    );
  if (p.sessionCount >= 10)
    attentionFlags.push('10-session milestone reached — submit progress report for supervisor review');

  // Improvement areas
  const scores = p.currentScores || {};
  const baseline = p.baselineScores || {};
  const improvements = (
    Object.keys(scores) as Array<keyof typeof scores>
  ).map((k) => ({
    level: String(k).charAt(0).toUpperCase() + String(k).slice(1),
    current: scores[k] ?? 0,
    baseline: baseline[k] ?? 0,
    gain: (scores[k] ?? 0) - (baseline[k] ?? 0),
  })).sort((a, b) => b.gain - a.gain);

  const strongestArea = improvements[0];
  const persistentChallenge = [...improvements].sort((a, b) => a.current - b.current)[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#041627] to-[#006A61] text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[#86F2E4]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Insights</h2>
            <p className="text-[#86F2E4] text-xs">
              Longitudinal progress intelligence — {p.name} ({p.caseId})
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This view synthesises all available session history, goal data, and performance
          trends to surface key clinical insights. Unlike the AI Therapist Assistant
          (session-level chat support), AI Insights is a <strong className="text-white">trend intelligence</strong> view —
          answering "What patterns are developing over time?"
        </p>
      </div>

      {/* Progress Trend Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <SectionTitle
          icon={TrendingUp}
          label="Progress Trend"
          sub="Last 8 sessions vs. previous 8 sessions"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Progress</span>
            <span className="text-2xl font-extrabold text-slate-900">{p.progressPct}%</span>
            <div className="mt-1">
              <TrendLabel change={trendChange} />
            </div>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Level</span>
            <span className="text-sm font-extrabold text-[#006A61]">{p.currentLevel}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Level {currentLevelIdx + 1} of {levelOrder.length}
            </span>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sessions Done</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {p.sessionCount}
              <span className="text-sm text-slate-500 font-normal"> / {p.totalTargetSessions}</span>
            </span>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance</span>
            <span className="text-2xl font-extrabold text-slate-900">{consistencyPct}%</span>
            <ProgressBar
              value={consistencyPct}
              color={consistencyPct >= 80 ? 'bg-teal-500' : consistencyPct >= 65 ? 'bg-amber-500' : 'bg-red-400'}
            />
          </div>
        </div>

        {/* Session Score Sparkline */}
        {history.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Score Trajectory — All Sessions
            </p>
            <div className="flex items-end gap-1 h-16">
              {history.map((h, i) => {
                const pct = h.score / 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div
                      className="w-full rounded-t bg-[#006A61]/80 hover:bg-[#006A61] transition-colors cursor-default"
                      style={{ height: `${Math.max(8, pct * 56)}px` }}
                      title={`${h.session}: ${h.score}%`}
                    />
                    <span className="text-[8px] text-slate-400">{h.session}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Goal Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <SectionTitle
          icon={Target}
          label="Goal Progress"
          sub="Therapy goal achievement status"
        />
        <div className="flex items-center gap-3 mb-4 text-xs">
          <span className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {goalsAchieved} Achieved
          </span>
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
            <Activity className="w-3.5 h-3.5" /> {goalsInProgress} In Progress
          </span>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
            <Minus className="w-3.5 h-3.5" /> {goalsPlateaued} Plateau
          </span>
        </div>
        <div className="space-y-3">
          {goals.map((g) => (
            <div key={g.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-800 leading-snug">{g.title}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    g.status === 'Achieved'
                      ? 'bg-teal-100 text-teal-800'
                      : g.status === 'Plateau'
                      ? 'bg-amber-100 text-amber-800'
                      : g.status === 'Review Required'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {g.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 shrink-0">
                  Baseline: <strong className="text-slate-700">{g.baselinePct}%</strong>
                </span>
                <div className="flex-1">
                  <ProgressBar value={(g.currentPct / g.targetPct) * 100} />
                </div>
                <span className="text-[#006A61] font-bold shrink-0">
                  {g.currentPct}% / {g.targetPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance by Level */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <SectionTitle
          icon={BarChart2}
          label="Performance by Level"
          sub="Baseline vs. current scores across therapy levels"
        />
        <div className="space-y-3">
          {improvements.map((item) => (
            <div key={item.level} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700">{item.level}</span>
                <div className="flex items-center gap-2">
                  <TrendIcon change={item.gain} />
                  <span className="font-mono text-slate-600">
                    {item.baseline}% → <strong className="text-[#006A61]">{item.current}%</strong>
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.gain > 0 ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {item.gain >= 0 ? '+' : ''}{item.gain}%
                  </span>
                </div>
              </div>
              <ProgressBar value={item.current} />
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Areas & Persistent Challenges */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-[#E0F2F1] rounded-2xl p-5 border border-[#006A61]/30 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#006A61]" />
            <h3 className="font-bold text-[#006A61] text-sm">Strongest Area</h3>
          </div>
          {strongestArea && (
            <>
              <p className="text-lg font-extrabold text-slate-900">{strongestArea.level} Level</p>
              <p className="text-xs text-slate-700 mt-1">
                +{strongestArea.gain}% improvement from baseline ({strongestArea.baseline}% → {strongestArea.current}%)
              </p>
              <p className="text-[11px] text-[#006A61] mt-2 font-medium">
                Motor pattern for {p.targetSound} is most stable at this level.
              </p>
            </>
          )}
        </div>

        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-amber-800 text-sm">Persistent Challenge</h3>
          </div>
          {persistentChallenge && (
            <>
              <p className="text-lg font-extrabold text-slate-900">{persistentChallenge.level} Level</p>
              <p className="text-xs text-slate-700 mt-1">
                Current: {persistentChallenge.current}% — lowest across all levels
              </p>
              <p className="text-[11px] text-amber-700 mt-2 font-medium">
                Recommend additional cueing support or reduced stimuli complexity.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <SectionTitle icon={Award} label="Milestones" sub="Therapy progression checkpoints" />
        <div className="space-y-2 text-xs">
          {levelOrder.slice(0, currentLevelIdx + 1).map((lvl, i) => (
            <div key={lvl} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  i < currentLevelIdx
                    ? 'bg-teal-500 text-white'
                    : 'bg-[#006A61] text-white ring-2 ring-[#006A61]/30'
                }`}
              >
                {i < currentLevelIdx ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`font-medium ${
                  i < currentLevelIdx ? 'text-slate-400 line-through' : 'text-slate-900 font-bold'
                }`}
              >
                {lvl} Level
              </span>
              {i === currentLevelIdx && (
                <span className="text-[10px] bg-[#E0F2F1] text-[#006A61] font-bold px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
          ))}
          {levelOrder.slice(currentLevelIdx + 1).map((lvl) => (
            <div key={lvl} className="flex items-center gap-3 opacity-40">
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
              <span className="text-slate-400 font-medium">{lvl} Level</span>
            </div>
          ))}
          {p.sessionCount >= 10 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800">
                  10-Session Milestone Reached — Progress Report Due
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attention Flags */}
      {attentionFlags.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
          <SectionTitle icon={Flag} label="Attention Flags" sub="Items requiring clinical review" />
          <div className="space-y-2">
            {attentionFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-amber-900 font-medium">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Patient Insight */}
      <div className="bg-[#041627] text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#86F2E4]" />
          <h3 className="font-bold text-sm">Key Patient Insight</h3>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            AI-Generated
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {trendChange > 5
            ? `${p.name} is showing strong upward trajectory across all therapy levels, with the most notable gains at the ${strongestArea?.level ?? p.currentLevel} level. Maintain current treatment intensity and prepare milestone documentation.`
            : trendChange >= 0
            ? `${p.name} is progressing at a steady pace. No major regression detected. The ${persistentChallenge?.level ?? 'Conversation'} level remains the primary clinical focus — consider introducing minimal-pair contrasts to further stimulate coarticulation.`
            : `${p.name} shows signs of performance plateau or mild regression. Review stimuli difficulty and session frequency. Consider reducing level complexity temporarily to rebuild automaticity before advancing.`
          }
        </p>
        <p className="text-[10px] text-slate-500 mt-2">
          Not a clinical diagnosis. Based on prototype performance data. Therapist review required.
        </p>
      </div>
    </div>
  );
};

// ─── SUPERVISOR VIEW — multi-case telemetry ────────────────────────────────────

const SupervisorInsightsView: React.FC = () => {
  const { supervisorCases, studentCompetencies, patients, dashboardStats } = useApp();

  const totalCases = supervisorCases.length;
  const highPriority = supervisorCases.filter((c) => c.priority === 'High');
  const pendingReports = supervisorCases.filter((c) => c.reportPending);
  const pendingPlans = dashboardStats.plansAwaitingReview;

  // Milestone cases (10 sessions)
  const milestoneCases = patients.filter((p) => p.sessionCount >= 10);

  // Plateau cases
  const plateauCases = patients.filter((p) => {
    const history = p.historicalProgress || [];
    if (history.length < 4) return false;
    const last3 = history.slice(-3).map((h) => h.score);
    const variance = Math.max(...last3) - Math.min(...last3);
    return variance <= 4;
  });

  // Competency averages
  const avgCompetency = useMemo(() => {
    if (!studentCompetencies.length) return 0;
    return Math.round(
      studentCompetencies.reduce((a, b) => a + b.overallAverage, 0) /
        studentCompetencies.length
    );
  }, [studentCompetencies]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#041627] to-[#1a3a5c] text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[#86F2E4]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Supervisor Telemetry & Insights</h2>
            <p className="text-[#86F2E4] text-xs">
              Multi-case supervision intelligence — {totalCases} active cases
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This view answers: <em>"Which cases and students need my attention, why, and what should I review?"</em>
          Unlike the AI Clinical Assistant (session-level chat), this is a{' '}
          <strong className="text-white">supervision telemetry dashboard</strong> across your entire supervised caseload.
        </p>
      </div>

      {/* Priority Snapshot Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Supervised',
            value: totalCases,
            icon: Users,
            color: 'text-slate-900',
            bg: 'bg-white',
            border: 'border-slate-200',
          },
          {
            label: 'High Priority',
            value: highPriority.length,
            icon: ShieldAlert,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
          },
          {
            label: 'Reports Pending',
            value: pendingReports.length,
            icon: FileSpreadsheet,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
          },
          {
            label: 'Plans to Review',
            value: pendingPlans,
            icon: Clock,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`${item.bg} ${item.border} border rounded-2xl p-4 shadow-xs flex flex-col gap-1`}
            >
              <Icon className={`w-5 h-5 ${item.color} mb-1`} />
              <span className={`text-2xl font-extrabold ${item.color}`}>{item.value}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Priority Cases Requiring Attention */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <SectionTitle
          icon={ShieldAlert}
          label="Cases Requiring Attention"
          sub="High priority and milestone-due cases"
        />
        {highPriority.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-teal-400" />
            No high-priority cases at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {highPriority.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-red-100 bg-red-50/50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.patientName}</span>
                    <span className="font-mono text-slate-500 text-[10px]">{c.caseId}</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      High
                    </span>
                  </div>
                  {c.reportPending && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Report Due
                    </span>
                  )}
                </div>
                <p className="text-slate-600">
                  <strong>Therapist:</strong> {c.assignedTherapist}
                </p>
                <p className="text-red-700 font-medium">{c.reason}</p>
                <p className="text-slate-500">
                  <strong>Recommended Action:</strong>{' '}
                  {c.reportPending
                    ? 'Review 10-session report and provide evaluation'
                    : 'Open case record and review recent sessions + therapy plan'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10-Session Milestone Cases */}
      {milestoneCases.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <SectionTitle
            icon={Award}
            label="10-Session Milestones"
            sub="Patients requiring milestone report review"
          />
          <div className="space-y-2">
            {milestoneCases.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#E0F2F1] border border-[#006A61]/20 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{p.name}</span>
                  <span className="text-slate-500 ml-2 font-mono">{p.caseId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#006A61] font-bold">{p.sessionCount} sessions</span>
                  <Award className="w-4 h-4 text-[#006A61]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Plateaus */}
      {plateauCases.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
          <SectionTitle
            icon={Minus}
            label="Progress Plateaus Detected"
            sub="Patients with low score variance over last 3 sessions"
          />
          <div className="space-y-2">
            {plateauCases.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{p.name}</span>
                  <span className="text-slate-500 ml-2 font-mono">{p.caseId}</span>
                  <span className="block text-amber-700 font-medium">
                    Current Level: {p.currentLevel} — {p.progressPct}% overall progress
                  </span>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Plateau
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-amber-700 mt-3 font-medium">
            Recommended Action: Review therapy plan goals and stimuli complexity for these cases.
          </p>
        </div>
      )}

      {/* Student Competency Trends */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <SectionTitle
          icon={GraduationCap}
          label="Student Competency Overview"
          sub={`${studentCompetencies.length} student therapist(s) under supervision`}
        />
        {studentCompetencies.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No student competency data available yet.
          </p>
        ) : (
          <>
            <div className="mb-4 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600 font-medium">Average Competency Score (All Students)</span>
              <span
                className={`text-lg font-extrabold ${
                  avgCompetency >= 75
                    ? 'text-teal-600'
                    : avgCompetency >= 55
                    ? 'text-amber-600'
                    : 'text-red-500'
                }`}
              >
                {avgCompetency}%
              </span>
            </div>
            <div className="space-y-3">
              {studentCompetencies.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{s.studentName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{s.activeCasesCount} cases</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${
                          s.overallAverage >= 75
                            ? 'bg-teal-100 text-teal-800'
                            : s.overallAverage >= 55
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.overallAverage}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={s.overallAverage}
                    color={
                      s.overallAverage >= 75
                        ? 'bg-teal-500'
                        : s.overallAverage >= 55
                        ? 'bg-amber-500'
                        : 'bg-red-400'
                    }
                  />
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {Object.entries(s.metrics).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <div className="text-[10px] text-slate-400 capitalize truncate">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="font-bold text-slate-700">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Workload Summary */}
      <div className="bg-[#041627] text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#86F2E4]" />
          <h3 className="font-bold text-sm">Supervisor Workload Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Total Cases', value: totalCases },
            { label: 'Students Supervised', value: studentCompetencies.length },
            { label: 'Plans Awaiting Review', value: pendingPlans },
            { label: 'Reports Pending', value: pendingReports.length },
            { label: 'High Priority', value: highPriority.length },
            { label: 'Plateau Cases', value: plateauCases.length },
          ].map((item) => (
            <div key={item.label} className="bg-slate-800/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {item.label}
              </span>
              <span className="text-lg font-extrabold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Export — role-aware ──────────────────────────────────────────────────

export const AIInsightsView: React.FC = () => {
  const { role } = useApp();

  if (role === 'supervisor' || role === 'admin') {
    return <SupervisorInsightsView />;
  }
  return <StudentInsightsView />;
};
