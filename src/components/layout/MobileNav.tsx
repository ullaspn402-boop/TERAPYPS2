import React, { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Mic,
  Users,
  ShieldAlert,
  Bot,
  Sliders,
  FileSpreadsheet,
  Globe,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useApp, NavigationPage } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, role } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks: { id: NavigationPage; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-cases', label: 'My Cases', icon: Users },
    { id: 'speech-practice', label: 'Speech Practice', icon: Mic },
    { id: 'adaptive-therapy', label: 'Adaptive', icon: Sliders },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'supervisor-center', label: 'Supervisor', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="md:hidden">
      {/* Mobile Top App Bar */}
      <div className="h-14 bg-[#041627] text-white flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm tracking-tight text-white">SPEECHCARE AI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold bg-[#E0F2F1] text-[#006A61] px-2 py-0.5 rounded-full capitalize">
            {role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs pt-14">
          <div className="bg-[#041627] text-white p-4 h-[calc(100vh-3.5rem)] overflow-y-auto space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Navigation Menu</div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1A2B3C] text-[#86F2E4] font-semibold border-l-2 border-[#86F2E4]'
                      : 'text-slate-300 hover:bg-[#112233]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setIsOpen(false);
                }}
                className="w-full text-center py-2.5 rounded-lg bg-[#006A61] text-white font-semibold text-xs"
              >
                Public Landing Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-lg">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentView === 'dashboard' ? 'text-[#006A61]' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Home</span>
        </button>

        <button
          onClick={() => setCurrentView('my-cases')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentView === 'my-cases' ? 'text-[#006A61]' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Cases</span>
        </button>

        <button
          onClick={() => setCurrentView('speech-practice')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-white relative -top-3"
        >
          <div className="w-12 h-12 rounded-full bg-[#006A61] flex items-center justify-center shadow-lg border-2 border-white">
            <Mic className="w-6 h-6 text-[#86F2E4]" />
          </div>
          <span className="text-[10px] font-semibold text-[#006A61] mt-0.5">Practice</span>
        </button>

        <button
          onClick={() => setCurrentView('ai-assistant')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentView === 'ai-assistant' ? 'text-[#006A61]' : 'text-slate-500'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">AI Assist</span>
        </button>

        <button
          onClick={() => setCurrentView('supervisor-center')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentView === 'supervisor-center' ? 'text-[#006A61]' : 'text-slate-500'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Supervision</span>
        </button>
      </div>
    </div>
  );
};
