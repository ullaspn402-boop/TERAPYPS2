import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  AlertOctagon,
  FileSpreadsheet,
  EyeOff,
  Sparkles,
  Mic,
  Sliders,
  Bot,
  ShieldCheck,
  Activity,
  Layers,
  Check,
  ChevronRight,
  TrendingUp,
  UserCheck,
  HeartPulse,
  BrainCircuit,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { Avatar } from '../common/Avatar';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setRole, navigateToPatient } = useApp();
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(5); // Speech Practice by default

  const workflowSteps = [
    { num: 1, title: 'Patient Registration', desc: 'Demographic & bilingual linguistic profiling' },
    { num: 2, title: 'Clinical Assessment', desc: 'Baseline articulation & phonetic acoustic testing' },
    { num: 3, title: 'AI Case Allocation', desc: 'Skill & caseload optimization algorithm' },
    { num: 4, title: 'Therapy Plan Builder', desc: 'Measurable goal setting with AI plan check' },
    { num: 5, title: 'Supervisor Approval', desc: 'Pre-session verification & quality sign-off' },
    { num: 6, title: 'Speech Practice', desc: 'Mic recording, acoustic visualizer & prompt cues' },
    { num: 7, title: 'Speech Analysis', desc: 'F1/F2/F3 formant analysis & phoneme tracking' },
    { num: 8, title: 'Adaptive Therapy', desc: 'Sound ➔ Syllable ➔ Word ➔ Sentence ➔ Conversation' },
    { num: 9, title: 'Milestone Progress', desc: '10-session automated progress summary' },
    { num: 10, title: 'Supervisor Intelligence', desc: 'Automated triage of plateau & overdue cases' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#191C1E] flex flex-col selection:bg-[#006A61]/15 selection:text-[#006A61]">
      {/* Top Public Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#006A61] text-[#86F2E4] flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-[#041627]">SPEECHCARE AI</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline ml-2 border-l border-slate-300 pl-2 font-mono">
              Clinical Platform
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-[#006A61] transition-colors">Core Innovations</a>
          <a href="#workflow" className="hover:text-[#006A61] transition-colors">Connected Workflow</a>
          <a href="#clinical-evidence" className="hover:text-[#006A61] transition-colors">Clinical Evidence</a>
          <a href="#institutions" className="hover:text-[#006A61] transition-colors">Institutions</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setRole('student_therapist');
              setCurrentView('dashboard');
            }}
            className="text-xs font-semibold text-slate-700 hover:text-[#006A61] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => {
              setRole('student_therapist');
              setCurrentView('dashboard');
            }}
            className="text-xs font-semibold bg-[#006A61] text-white hover:bg-[#005049] px-3.5 py-1.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#006A61] border border-[#86F2E4]/40 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#006A61]" />
              <span>Enterprise Clinical Intelligence Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#041627] tracking-tight leading-[1.15]">
              Intelligent Speech Therapy.{' '}
              <span className="text-[#006A61] block mt-1">Smarter Clinical Supervision.</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              SPEECHCARE AI connects acoustic speech intelligence, adaptive therapy ladders, AI-assisted clinical workflows, and supervisor intelligence in one cohesive, data-driven platform designed for hospitals, university clinics, and private practices.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setRole('student_therapist');
                  setCurrentView('dashboard');
                }}
                className="px-6 py-3 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg font-semibold text-sm transition-all shadow-md flex items-center gap-2 group"
              >
                <span>Launch Clinical Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setCurrentView('speech-practice');
                }}
                className="px-5 py-3 border border-[#041627] hover:bg-slate-100 text-[#041627] rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-[#006A61] fill-[#006A61]" />
                <span>Test Speech Practice</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-slate-700">
              <div>
                <span className="block text-2xl font-bold text-[#041627]">8+</span>
                <span className="text-xs text-slate-500">Indian Languages</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#006A61]">94%</span>
                <span className="text-xs text-slate-500">Acoustic Accuracy</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#041627]">100%</span>
                <span className="text-xs text-slate-500">Supervisor Oversight</span>
              </div>
            </div>
          </div>

          {/* Right Hero Live Interactive Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Fake Window Header */}
              <div className="h-10 bg-[#041627] px-4 flex items-center justify-between text-white text-xs border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="ml-2 font-mono text-[11px] text-slate-300">
                    Clinical Telemetry Dashboard (Live Preview)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#006A61] text-[#86F2E4] text-[10px] font-bold">
                  Active Demo
                </span>
              </div>

              {/* Fake Dashboard Body */}
              <div className="p-4 sm:p-5 bg-[#F8FAFC] space-y-4">
                {/* Top Patient Summary Pill */}
                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name="Rahul Verma" role="patient" gender="Male" size="md" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">Rahul Verma</span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1 rounded">
                          SLT-087
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        Target: <strong className="text-[#006A61]">/r/ Rhoticity</strong> • Telugu & English
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Therapy Level
                    </span>
                    <span className="text-xs font-bold text-[#006A61] bg-[#E0F2F1] px-2 py-0.5 rounded-md">
                      Sentence Level
                    </span>
                  </div>
                </div>

                {/* Grid with Chart & AI Assistant Observation */}
                <div className="grid sm:grid-cols-5 gap-3">
                  {/* Acoustic Chart */}
                  <div className="sm:col-span-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-800">Acoustic Progression</span>
                      <span className="text-[#006A61] font-bold font-mono">76% Target Met</span>
                    </div>
                    {/* Simulated SVG Graph */}
                    <div className="h-28 w-full relative border-b border-l border-slate-200 pt-2">
                      <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#006A61"
                          strokeWidth="3"
                          strokeLinecap="round"
                          points="0,70 40,55 80,45 120,50 160,25 200,18"
                        />
                        <circle cx="0" cy="70" r="3" fill="#006A61" />
                        <circle cx="40" cy="55" r="3" fill="#006A61" />
                        <circle cx="80" cy="45" r="3" fill="#006A61" />
                        <circle cx="120" cy="50" r="3" fill="#006A61" />
                        <circle cx="160" cy="25" r="3" fill="#006A61" />
                        <circle cx="200" cy="18" r="4" fill="#86F2E4" stroke="#006A61" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>S1 (Sound)</span>
                      <span>S4 (Syllable)</span>
                      <span>S7 (Word)</span>
                      <span>S10 (Sentence)</span>
                    </div>
                  </div>

                  {/* Contextual AI Insight Box */}
                  <div className="sm:col-span-2 bg-[#E0F2F1] border-l-3 border-[#006A61] p-3 rounded-r-lg flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1 text-[#006A61] font-bold text-[11px] mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Clinical Insight</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-snug">
                        Word accuracy has stabilized at 87%. Next focus: minimal pairs (/t/ vs /tr/) to resolve cluster timing before full conversation transfer.
                      </p>
                    </div>
                    <button
                      onClick={() => navigateToPatient('p1', 'therapy-plan')}
                      className="mt-2 text-[10px] bg-white text-[#006A61] font-semibold py-1 px-2 rounded border border-[#006A61]/30 hover:bg-[#006A61] hover:text-white transition-colors"
                    >
                      Update Therapy Plan ➔
                    </button>
                  </div>
                </div>

                {/* Level Ladder Pill Strip */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Therapy Ladder:</span>
                  <span className="text-slate-400">Sound</span>
                  <span>➔</span>
                  <span className="text-slate-400">Syllable</span>
                  <span>➔</span>
                  <span className="text-slate-400">Word</span>
                  <span>➔</span>
                  <span className="font-bold text-[#006A61] bg-[#E0F2F1] px-2 py-0.5 rounded">
                    Sentence (Current)
                  </span>
                  <span>➔</span>
                  <span className="text-slate-400">Conversation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section (4 Issues) */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#041627] tracking-tight">
              Speech Therapy Needs More Than Documentation
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Legacy Electronic Health Records focus on administrative billing rather than clinical diagnostic precision. SPEECHCARE AI solves the 4 fundamental bottlenecks in speech-language pathology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Problem 1 */}
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-3">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Fragmented Clinical Workflow
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Patient baselines, therapy session goals, audio recordings, and SOAP notes exist in isolated silos, making continuity across student clinician rotations prone to errors.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-[#006A61]">
                Unified patient trajectory in 1 system
              </div>
            </div>

            {/* Problem 2 */}
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Manual Progress Tracking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clinicians rely on subjective tally counters rather than objective acoustic speech recognition and formant resonance metrics across therapy levels.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-[#006A61]">
                Objective acoustic F1/F2/F3 analytics
              </div>
            </div>

            {/* Problem 3 */}
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <EyeOff className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Limited Supervisor Visibility
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clinical supervisors oversee 20-30 student cases simultaneously without real-time triage to identify plateaus, delayed documentation, or critical patient regression.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-[#006A61]">
                Real-time supervisor command hub
              </div>
            </div>

            {/* Problem 4 */}
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-[#006A61] flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Difficult Speech Monitoring
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Home speech practice lacks structured acoustic biofeedback, leaving therapists unaware of whether patients practiced correctly between weekly clinical appointments.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-[#006A61]">
                Adaptive practice with instant feedback
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Clinical Workflow (Step by Step) */}
      <section id="workflow" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#006A61] uppercase tracking-wider bg-[#E0F2F1] px-3 py-1 rounded-full mb-2">
            Integrated Lifecycle
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#041627] tracking-tight">
            One Intelligent Platform. One Connected Clinical Workflow.
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Click on any step below to preview how SPEECHCARE AI bridges assessment, supervision, and adaptive speech therapy.
          </p>
        </div>

        {/* Workflow Horizontal Step Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-8">
          {workflowSteps.map((step) => {
            const isSelected = selectedWorkflowStep === step.num;
            return (
              <button
                key={step.num}
                onClick={() => setSelectedWorkflowStep(step.num)}
                className={`p-2.5 rounded-lg text-left border transition-all text-xs flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-[#006A61] text-white border-[#006A61] shadow-md scale-102'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isSelected ? 'bg-[#86F2E4] text-[#041627]' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {step.num}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#86F2E4]" />}
                </div>
                <span className="font-bold text-[11px] leading-tight line-clamp-2 mt-1">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Step Feature Detail Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#E0F2F1] text-[#006A61] px-2 py-0.5 rounded">
                Stage {selectedWorkflowStep} of 10
              </span>
              <h3 className="font-bold text-lg text-slate-900">
                {workflowSteps[selectedWorkflowStep - 1].title}
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {workflowSteps[selectedWorkflowStep - 1].desc}. Seamlessly connected into the patient's continuous clinical record with role-based access for students and supervisors.
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedWorkflowStep === 3) setCurrentView('ai-allocation');
              else if (selectedWorkflowStep === 4) setCurrentView('therapy-plans');
              else if (selectedWorkflowStep === 5 || selectedWorkflowStep === 10) setCurrentView('supervisor-center');
              else if (selectedWorkflowStep === 6) setCurrentView('speech-practice');
              else if (selectedWorkflowStep === 7) setCurrentView('patient-detail');
              else if (selectedWorkflowStep === 8) setCurrentView('adaptive-therapy');
              else if (selectedWorkflowStep === 9) setCurrentView('reports');
              else setCurrentView('dashboard');
            }}
            className="px-5 py-2.5 bg-[#041627] hover:bg-[#1A2B3C] text-white rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Open {workflowSteps[selectedWorkflowStep - 1].title} UI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4 Core Innovation Cards */}
      <section id="features" className="py-16 bg-[#F2F4F6] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#041627] tracking-tight">
              Four Core Clinical Innovations
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Engineered specifically for speech pathology departments, clinical practicums, and speech rehabilitation clinics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Intelligent Speech Analysis */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#006A61]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] text-[#006A61] flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  🎤 Intelligent Speech Analysis & Acoustic Telemetry
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Live microphone speech capture with real-time waveform inspection, acoustic F1/F2/F3 formant analysis, and target phoneme accuracy tracking across initial, medial, and final word positions.
                </p>
                <div className="bg-[#F8FAFC] rounded-lg p-3 border border-slate-200 text-xs space-y-1.5 font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>Target Phoneme:</span>
                    <strong className="text-[#006A61]">/r/ Rhotic Approximant</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Acoustic Accuracy:</span>
                    <span className="font-semibold text-teal-700">88% (Good F3 resonance)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('speech-practice')}
                className="mt-5 text-xs font-bold text-[#006A61] hover:underline flex items-center gap-1"
              >
                Launch Speech Practice Studio ➔
              </button>
            </div>

            {/* Card 2: Adaptive Therapy Engine */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#006A61]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#006A61] flex items-center justify-center mb-4">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  🧠 Adaptive Therapy Progression Engine
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Evaluates performance stability over multiple sessions to automatically recommend promotion along the clinical continuum: Sound ➔ Syllable ➔ Word ➔ Sentence ➔ Conversation.
                </p>
                <div className="bg-[#F8FAFC] rounded-lg p-3 border border-slate-200 text-xs space-y-1.5 font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>Suggested Next Level:</span>
                    <strong className="text-[#006A61]">Sentence Level</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    "Word performance stabilized at 89% across 3 trials. Ready for carrier phrases."
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('adaptive-therapy')}
                className="mt-5 text-xs font-bold text-[#006A61] hover:underline flex items-center gap-1"
              >
                View Adaptive Progression Engine ➔
              </button>
            </div>

            {/* Card 3: AI Therapist Assistant */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#006A61]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] text-[#006A61] flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  🤖 Contextual AI Therapist Assistant
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Clinical co-pilot that analyzes session acoustics, suggests evidence-based minimal pair activities, automates SOAP documentation drafts, and assists student clinicians under supervisor supervision.
                </p>
                <div className="bg-[#E0F2F1] rounded-lg p-3 border-l-3 border-[#006A61] text-xs space-y-1">
                  <div className="font-bold text-[#006A61] flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>Suggested Activity</span>
                  </div>
                  <p className="text-slate-800 text-[11px]">
                    Minimal pair contrast (/t/ vs /tr/) to resolve cluster timing delays before unstructured conversation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('ai-assistant')}
                className="mt-5 text-xs font-bold text-[#006A61] hover:underline flex items-center gap-1"
              >
                Explore AI Clinical Assistant ➔
              </button>
            </div>

            {/* Card 4: Intelligent Clinical Supervision */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#006A61]/40 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  🚨 Intelligent Clinical Supervision Hub
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Automated case triage (High Priority, Review Soon, Normal), student competency dashboards, therapy plan quality checking, and 10-session milestone verification.
                </p>
                <div className="bg-[#F8FAFC] rounded-lg p-3 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Priority Triage Queue:</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                    3 Urgent Cases Flagged
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setRole('supervisor');
                  setCurrentView('supervisor-center');
                }}
                className="mt-5 text-xs font-bold text-[#006A61] hover:underline flex items-center gap-1"
              >
                Enter Supervisor Command Center ➔
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Evidence / Footer */}
      <footer className="bg-[#041627] text-white py-12 px-4 sm:px-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#006A61] text-[#86F2E4] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight">SPEECHCARE AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Intelligent speech-language therapy and clinical supervision platform connecting speech acoustic intelligence, adaptive therapy, and supervisor workflows.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Clinical Areas</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Articulation & Phonological Disorders</li>
              <li>• Childhood Apraxia of Speech (CAS)</li>
              <li>• Multilingual Speech Assessment</li>
              <li>• Acoustic Formant & Spectrogram Telemetry</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Supervision & Institutions</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• University Practicum Supervision</li>
              <li>• Student Competency Analytics</li>
              <li>• AI Case Allocation & Balancing</li>
              <li>• 10-Session Milestone Sign-off</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Try Live Platform</h4>
            <p className="text-slate-400 text-xs">
              Explore the full student therapist, supervisor, and administrative prototype.
            </p>
            <button
              onClick={() => {
                setRole('student_therapist');
                setCurrentView('dashboard');
              }}
              className="w-full py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Enter Application ➔
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <span>© 2026 SPEECHCARE AI. All rights reserved. Professional Clinical Intelligence Platform.</span>
          <span className="font-mono text-slate-400">Measure speech. Adapt therapy. Assist therapists. Empower supervisors.</span>
        </div>
      </footer>
    </div>
  );
};
