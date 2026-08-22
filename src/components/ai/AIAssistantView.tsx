import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  FileText,
  Send,
  RefreshCw,
  Play,
  Check,
  X,
  Sliders,
  User,
  ShieldCheck,
  HelpCircle,
  FileCheck2,
  Lightbulb,
  BarChart2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';

export const AIAssistantView: React.FC = () => {
  const { selectedPatient, aiActivities, updateAIActivityStatus, setCurrentView } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [chatMessages, setChatMessages] = useState<
    { sender: 'ai' | 'user'; text: string; time: string }[]
  >([]);

  React.useEffect(() => {
    if (selectedPatient) {
      setChatMessages([
        {
          sender: 'ai',
          text: `Hello! I am analyzing telemetry data for ${selectedPatient.name} (${selectedPatient.caseId}). Recent session data shows strong performance on initial ${selectedPatient.targetSound} words (88%) but coarticulation friction during cluster blends in ${selectedPatient.therapyLanguage} stimulus. How would you like me to assist you with today's session planning?`,
          time: '09:00 AM',
        },
      ]);
    }
  }, [selectedPatient?.id]);

  if (!selectedPatient) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-xs mt-12">
          <div className="w-16 h-16 bg-[#E0F2F1] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-[#006A61]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">AI Therapist Assistant</h2>
          <p className="text-sm text-slate-500 mb-6">
            No patient record selected. Select a patient from your assigned cases to launch contextual AI decision support.
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

  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || inputPrompt;
    if (!userText.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    if (!textToSend) setInputPrompt('');
    setIsGenerating(true);

    try {
      const response = await apiClient.post('/ai/assistant', {
        prompt: userText,
        patientId: selectedPatient.id,
        context: `Patient: ${selectedPatient.name}, Target Sound: ${selectedPatient.targetSound}, Current Level: ${selectedPatient.currentLevel}`
      });

      if (response.success && response.data) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: response.data.response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error connecting to AI Assistant backend.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Principle Banner: AI ASSISTS -> THERAPIST DECIDES */}
      <div className="bg-[#E0F2F1] border border-[#006A61]/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#006A61] text-[#86F2E4] flex items-center justify-center font-bold text-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#006A61]">
                CLINICAL WORKFLOW PRINCIPLE
              </span>
              <span className="text-[10px] bg-[#006A61] text-white font-bold px-2 py-0.5 rounded-full">
                Human-in-the-Loop
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              AI ASSISTS → THERAPIST DECIDES
            </p>
          </div>
        </div>
        <span className="text-[11px] text-[#006A61] font-medium italic">
          All AI suggestions require explicit therapist review and approval.
        </span>
      </div>

      {/* Patient Context Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006A61] text-[#86F2E4] flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Therapist Assistant</h2>
              <p className="text-xs text-slate-500">
                Contextual decision support co-pilot for SLP practicum workflow
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('speech-practice')}
            className="px-4 py-2 bg-[#006A61] hover:bg-[#005049] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Speech Practice</span>
          </button>
        </div>

        {/* Patient Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient</span>
            <span className="font-bold text-slate-900">{selectedPatient.name}</span>
            <span className="text-[10px] text-slate-500 block font-mono">{selectedPatient.caseId}</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Sound</span>
            <span className="font-bold text-[#006A61]">{selectedPatient.targetSound}</span>
            <span className="text-[10px] text-slate-500 block">{selectedPatient.therapyLanguage}</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Level</span>
            <span className="font-bold text-slate-900">{selectedPatient.currentLevel}</span>
            <span className="text-[10px] font-mono text-teal-700 block">Level 4 of 5</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Progress</span>
            <span className="font-bold text-slate-900">{selectedPatient.progressPct}%</span>
            <span className="text-[10px] text-slate-500 block">Milestone due</span>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sessions</span>
            <span className="font-bold text-slate-900">{selectedPatient.sessionCount} / {selectedPatient.totalTargetSessions}</span>
            <span className="text-[10px] text-slate-500 block">Attendance {selectedPatient.attendancePct}%</span>
          </div>
        </div>

        {/* AI Observation & Suggested Focus Cards */}
        <div className="grid md:grid-cols-2 gap-4 pt-1">
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Lightbulb className="w-4 h-4 text-[#006A61]" />
              <span>AI Observation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Performance is stronger during structured word practice than during spontaneous conversation."
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-[#006A61]" />
              <span>Suggested Focus</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "Continue sentence-to-conversation transition activities."
            </p>
          </div>
        </div>
      </div>

      {/* Contextual Quick Actions Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
          Contextual Assistant Quick Actions
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Summarize Patient', icon: User, prompt: `Summarize clinical status for ${selectedPatient.name}` },
            { label: 'Review Previous Sessions', icon: FileCheck2, prompt: `Review previous session records for ${selectedPatient.name}` },
            { label: 'Suggest Activities', icon: Lightbulb, prompt: `Suggest targeted ${selectedPatient.targetSound} activities for ${selectedPatient.currentLevel} level` },
            { label: 'Explain Progress', icon: BarChart2, prompt: `Explain progress velocity and score trends for ${selectedPatient.name}` },
            { label: 'Draft Session Note', icon: FileText, prompt: `Draft SOAP note for latest session with ${selectedPatient.name}` },
            { label: 'Prepare Progress Summary', icon: CheckCircle2, prompt: `Prepare 10-session milestone progress summary` },
          ].map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(act.prompt)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-[#E0F2F1] hover:text-[#006A61] text-slate-700 rounded-lg text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-[#006A61]" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: AI Assistant Chat + Suggested Activities */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Contextual Dialog */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
          <div className="p-3.5 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#006A61]" />
              <span className="font-bold text-slate-800 text-xs">AI Decision Support Dialog</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Context-Aware Assistance</span>
          </div>

          {/* Chat log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-[#006A61] text-[#86F2E4] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-[#006A61] text-white rounded-br-none'
                      : 'bg-[#F2F4F6] text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right font-mono ${
                      msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#006A61]" />
                <span>AI decision support is preparing response...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 flex gap-2 rounded-b-2xl"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask for minimal pairs, stimulus cards, or session note refinement..."
              className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#006A61]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#006A61] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right 5 Columns: AI-Suggested Therapy Activities with Approve / Modify / Reject */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#006A61]" />
                <h3 className="font-bold text-slate-900 text-sm">AI-Suggested Therapy Activities</h3>
              </div>
              <span className="text-[10px] font-mono bg-[#E0F2F1] text-[#006A61] px-2 py-0.5 rounded-full font-bold">
                Decision Support
              </span>
            </div>

            <div className="space-y-3.5">
              {aiActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold">{act.title}</strong>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {act.recommendedDuration}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{act.description}</p>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                    <strong className="text-[#006A61]">Rationale: </strong>
                    {act.clinicalRationale}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      Target: <span className="text-[#006A61]">{act.targetPhoneme}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        act.status === 'approved'
                          ? 'bg-teal-100 text-teal-800'
                          : act.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : act.status === 'modified'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  {/* Decision Controls: Approve | Modify | Reject */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                    <button
                      onClick={() => updateAIActivityStatus(act.id, 'approved')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        act.status === 'approved'
                          ? 'bg-[#006A61] text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#E0F2F1] hover:text-[#006A61]'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => updateAIActivityStatus(act.id, 'modified')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        act.status === 'modified'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Modify</span>
                    </button>

                    <button
                      onClick={() => updateAIActivityStatus(act.id, 'rejected')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        act.status === 'rejected'
                          ? 'bg-red-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <X className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
