import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TherapyLevel } from '../../types';
import { Avatar } from '../common/Avatar';
import { apiClient } from '../../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdaptiveRecommendation {
  currentLevel: string;
  suggestedLevel: string | null;
  action: 'ADVANCE' | 'CONTINUE' | 'REINFORCE';
  reason: string;
  evidencePoints: string[];
  suggestedActivities: string[];
  disclaimer: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AdaptiveTherapyView: React.FC = () => {
  const { patients, selectedPatient, setSelectedPatientId, advanceTherapyLevel, setCurrentView } = useApp();

  const [activePatientId, setActivePatientId] = useState<string>(selectedPatient?.id || '');
  const [recommendationStatus, setRecommendationStatus] = useState<'pending' | 'approved' | 'modified' | 'rejected'>('pending');
  const [recommendation, setRecommendation] = useState<AdaptiveRecommendation | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  const currentPatient = patients.find((p) => p.id === activePatientId) || selectedPatient;

  if (!selectedPatient || !currentPatient) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-xs mt-12">
          <div className="w-16 h-16 bg-[#E0F2F1] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sliders className="w-8 h-8 text-[#006A61]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Adaptive Therapy Protocol</h2>
          <p className="text-sm text-slate-500 mb-6">
            No patient record selected. Register a patient to manage adaptive therapy protocols.
          </p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-6 py-2.5 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Go to Dashboard & Register Patient
          </button>
        </div>
      </div>
    );
  }

  const ladderLevels: {
    level: TherapyLevel;
    title: string;
    description: string;
    score: number;
    threshold: number;
  }[] = [
    {
      level: 'Sound',
      title: '1. Sound (Isolation)',
      description: 'Single phoneme production with acoustic spectral resonance and oral posture feedback.',
      score: currentPatient.currentScores.sound,
      threshold: 80,
    },
    {
      level: 'Syllable',
      title: '2. Syllable',
      description: 'CV, VC, and CVC transitions testing coarticulation onset.',
      score: currentPatient.currentScores.syllable,
      threshold: 80,
    },
    {
      level: 'Word',
      title: '3. Word',
      description: 'Initial, medial, final, and blend positions in target vocabulary sets.',
      score: currentPatient.currentScores.word,
      threshold: 80,
    },
    {
      level: 'Sentence',
      title: '4. Sentence',
      description: 'Multi-word connected speech with syntactic rhythm and natural intonation pacing.',
      score: currentPatient.currentScores.sentence,
      threshold: 80,
    },
    {
      level: 'Conversation',
      title: '5. Conversation',
      description: 'Unstructured storytelling, question answering, and functional communication transfer.',
      score: currentPatient.currentScores.conversation,
      threshold: 80,
    },
  ];

  // ── Fetch AI recommendation from backend ────────────────────────────────────
  const fetchRecommendation = async (patId: string) => {
    setIsLoadingRec(true);
    setRecError(null);
    setRecommendation(null);
    setRecommendationStatus('pending');
    try {
      const res = await apiClient.post('/ai/adaptive-therapy', { patientId: patId });
      if (res.success && res.data) {
        setRecommendation(res.data as AdaptiveRecommendation);
      } else {
        setRecError(res.error || 'Failed to load AI recommendation.');
      }
    } catch (e: any) {
      setRecError('Network error. Could not load AI recommendation.');
    } finally {
      setIsLoadingRec(false);
    }
  };

  useEffect(() => {
    if (activePatientId) {
      fetchRecommendation(activePatientId);
    }
  }, [activePatientId]);

  const handlePromoteLevel = (targetLevel: TherapyLevel) => {
    advanceTherapyLevel(currentPatient.id, targetLevel);
    setRecommendationStatus('approved');
  };

  // ── Action label & color from action type ─────────────────────────────────
  const actionBadge = recommendation
    ? recommendation.action === 'ADVANCE'
      ? { label: 'Recommended: Advance Level', color: 'bg-teal-100 text-teal-800 border-teal-300' }
      : recommendation.action === 'REINFORCE'
      ? { label: 'Recommended: Reinforce / Return', color: 'bg-amber-100 text-amber-800 border-amber-300' }
      : { label: 'Recommended: Continue Current Level', color: 'bg-slate-100 text-slate-700 border-slate-300' }
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Principle Banner */}
      <div className="bg-[#E0F2F1] border border-[#006A61]/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#006A61] text-[#86F2E4] flex items-center justify-center font-bold text-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#006A61]">
                CLINICAL DECISION SUPPORT
              </span>
              <span className="text-[10px] bg-[#006A61] text-white font-bold px-2 py-0.5 rounded-full">
                Therapist Retains Final Control
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              AI suggests level progression based on performance trends. Therapist makes final clinical decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Top Header & Patient Picker */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#006A61]" />
            <h2 className="text-lg font-bold text-slate-900">
              Adaptive Therapy Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates acoustic performance stability across therapy continuum tiers.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Active Patient:</span>
          <select
            value={activePatientId}
            onChange={(e) => {
              setActivePatientId(e.target.value);
              setSelectedPatientId(e.target.value);
            }}
            className="p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:ring-1 focus:ring-[#006A61] outline-none cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.caseId} - {p.targetSound})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Active Context Banner */}
      <div className="bg-[#041627] text-white rounded-2xl p-5 border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={currentPatient.name} role="patient" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{currentPatient.name}</h3>
              <span className="text-xs font-mono text-[#86F2E4] bg-slate-800 px-2 py-0.5 rounded">
                {currentPatient.caseId}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Target Sound: <strong className="text-[#86F2E4]">{currentPatient.targetSound}</strong> • Therapy Language: <strong className="text-[#86F2E4]">{currentPatient.therapyLanguage}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">Current Active Tier</span>
            <span className="text-sm font-bold text-[#86F2E4] bg-teal-900/60 px-3 py-1 rounded-full border border-teal-500/40">
              {currentPatient.currentLevel} Level
            </span>
          </div>
        </div>
      </div>

      {/* Adaptive Progression Workflow Diagram */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Adaptive Progression Workflow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-semibold">
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-mono">STEP 1</span>
            <span className="text-slate-800">Patient Performance</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-mono">STEP 2</span>
            <span className="text-slate-800">AI Rule Analysis</span>
          </div>
          <div className="bg-[#E0F2F1] p-3 rounded-xl border border-[#006A61]/30">
            <span className="text-[10px] text-[#006A61] block font-mono">STEP 3</span>
            <span className="text-[#006A61] font-bold">AI Recommendation</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
            <span className="text-[10px] text-amber-800 block font-mono">STEP 4</span>
            <span className="text-amber-900 font-bold">Therapist Decision</span>
          </div>
          <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
            <span className="text-[10px] text-teal-800 block font-mono">STEP 5</span>
            <span className="text-teal-900 font-bold">Approved Activity</span>
          </div>
        </div>
      </div>

      {/* 5-Level Continuum Visual Ladder */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Therapy Level Progression Ladder</h3>
            <p className="text-xs text-slate-500">Configured Progression Threshold: 80% accuracy sustained</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#006A61]">
            <span>SOUND</span>
            <span>↓</span>
            <span>SYLLABLE</span>
            <span>↓</span>
            <span>WORD</span>
            <span>↓</span>
            <span>SENTENCE</span>
            <span>↓</span>
            <span>CONVERSATION</span>
          </div>
        </div>

        <div className="space-y-4">
          {ladderLevels.map((lvl, index) => {
            const isCurrent = lvl.level === currentPatient.currentLevel;
            const nextLevel = ladderLevels[index + 1]?.level;
            const isMastered = lvl.score >= lvl.threshold && !isCurrent;
            const isAIRecommended = recommendation?.action === 'ADVANCE' && recommendation.suggestedLevel === lvl.level;
            const isReinforce = recommendation?.action === 'REINFORCE' && recommendation.suggestedLevel === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`p-4 rounded-xl border transition-all ${isCurrent
                  ? 'bg-[#E0F2F1]/60 border-[#006A61] shadow-xs'
                  : isAIRecommended
                  ? 'bg-amber-50 border-amber-300'
                  : isMastered
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{lvl.title}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-[#006A61] text-white px-2.5 py-0.5 rounded-full">
                          Current Active Level
                        </span>
                      )}
                      {isMastered && (
                        <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#006A61]" />
                          Mastered (Completed)
                        </span>
                      )}
                      {isAIRecommended && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                          AI Recommended Next Level
                        </span>
                      )}
                      {isReinforce && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-300">
                          AI: Reinforce This Level
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{lvl.description}</p>
                  </div>

                  {/* Score & Progression Buttons */}
                  <div className="flex items-center gap-4">
                    <div className="text-right min-w-[90px]">
                      <span className="text-[10px] text-slate-400 font-mono block">Current Score</span>
                      <span
                        className={`text-lg font-bold font-mono ${lvl.score >= 80 ? 'text-[#006A61]' : 'text-slate-800'
                          }`}
                      >
                        {lvl.score}%
                      </span>
                    </div>

                    {isCurrent && nextLevel && (
                      <button
                        onClick={() => handlePromoteLevel(nextLevel)}
                        className="px-4 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Confirm Promotion</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Suggested Next Level Box with Evidence & Approve / Modify / Reject */}
        <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#006A61]" />
              <h4 className="font-bold text-slate-900 text-sm">AI Adaptive Recommendation</h4>
            </div>

            <div className="flex items-center gap-2">
              {actionBadge && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${actionBadge.color}`}>
                  {actionBadge.label}
                </span>
              )}
              <button
                onClick={() => fetchRecommendation(activePatientId)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-[#E0F2F1] text-slate-600 transition-colors"
                title="Refresh AI recommendation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRec ? 'animate-spin text-[#006A61]' : ''}`} />
              </button>
            </div>
          </div>

          {isLoadingRec ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#006A61]" />
              <span>AI engine analyzing performance data...</span>
            </div>
          ) : recError ? (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{recError}</span>
            </div>
          ) : recommendation ? (
            <>
              {/* Reason */}
              <div className="space-y-2 text-xs">
                <p className="text-slate-700 font-medium leading-relaxed">
                  <strong className="text-slate-900">Reason: </strong>
                  {recommendation.reason}
                </p>
              </div>

              {/* Evidence Points */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Supporting Evidence
                </span>
                {recommendation.evidencePoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <span className="text-[#006A61] font-bold shrink-0 mt-0.5">•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Suggested Activities */}
              {recommendation.suggestedActivities.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    AI-Suggested Activities
                  </span>
                  {recommendation.suggestedActivities.map((act, i) => (
                    <div key={i} className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      {act}
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 italic">{recommendation.disclaimer}</p>

              {/* Action Buttons: Approve | Modify | Reject */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setRecommendationStatus('approved');
                    if (recommendation.action === 'ADVANCE' && recommendation.suggestedLevel) {
                      advanceTherapyLevel(currentPatient.id, recommendation.suggestedLevel as TherapyLevel);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${recommendationStatus === 'approved'
                    ? 'bg-[#006A61] text-white'
                    : 'bg-white border border-slate-300 text-slate-800 hover:bg-[#E0F2F1] hover:text-[#006A61]'
                    }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Recommendation</span>
                </button>

                <button
                  onClick={() => setRecommendationStatus('modified')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${recommendationStatus === 'modified'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-800 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Modify Settings</span>
                </button>

                <button
                  onClick={() => setRecommendationStatus('rejected')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${recommendationStatus === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-800 hover:bg-red-50 hover:text-red-700'
                    }`}
                >
                  <X className="w-4 h-4" />
                  <span>Reject Recommendation</span>
                </button>

                {recommendationStatus !== 'pending' && (
                  <span className="text-xs font-bold text-slate-500 capitalize ml-auto">
                    Status: {recommendationStatus}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 italic py-2">
              No recommendation available. Select a patient to generate AI analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
