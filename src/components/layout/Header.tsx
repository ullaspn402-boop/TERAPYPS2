import React, { useState } from 'react';
import {
  Search,
  LogOut,
  Bell,
  Globe,
  UserCheck,
  ChevronDown,
  Sparkles,
  Shield,
  GraduationCap,
  HeartPulse,
  Check,
} from 'lucide-react';
import { useApp, NavigationPage } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { UserRole } from '../../types';
import { useTranslation } from '../../i18n/translations';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    currentView,
    setIsSearchOpen,
    setIsNotificationOpen,
    unreadNotificationCount,
    interfaceLanguage,
    setInterfaceLanguage,
    selectedPatient,
    logout,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = useTranslation();

  const getPageTitle = (view: NavigationPage) => {
    switch (view) {
      case 'landing':
        return 'Public Overview';
      case 'dashboard':
        return role === 'supervisor'
          ? t.supervisorCenter
          : role === 'patient'
          ? 'Patient Practice Portal'
          : t.dashboard;
      case 'my-cases':
        return t.supervisedCases;
      case 'patients':
        return t.patients;
      case 'patient-detail':
        return `Patient Record: ${selectedPatient.name} (${selectedPatient.caseId})`;
      case 'therapy-sessions':
        return t.therapySessions;
      case 'speech-practice':
        return t.speechPractice;
      case 'progress':
        return t.milestones;
      case 'reports':
        return t.reports;
      case 'ai-assistant':
        return 'AI Clinical Assistant';
      case 'adaptive-therapy':
        return 'Adaptive Progression Ladder';
      case 'ai-insights':
        return 'Clinical AI Insights';
      case 'supervisor-center':
        return t.supervisorCenter;
      case 'therapy-plans':
        return t.planReviews;
      case 'reviews':
        return 'Supervisory Case Reviews';
      case 'student-competency':
        return t.studentCompetency;
      case 'ai-allocation':
        return t.aiAllocation;
      case 'analytics':
        return 'Clinical Analytics';
      case 'users':
        return 'Account Management';
      case 'settings':
        return t.settings;
      default:
        return t.dashboard;
    }
  };

  const getRoleConfig = (currentRole: UserRole) => {
    const userName = currentUser?.name || '';
    switch (currentRole) {
      case 'admin':
        return {
          name: userName || 'Administrator',
          roleLabel: 'Institute Director',
          icon: Shield,
          badgeBg: 'bg-indigo-50 border-indigo-100 text-indigo-700',
        };
      case 'supervisor':
        return {
          name: userName || 'Supervisor',
          roleLabel: 'Clinical Supervisor',
          icon: UserCheck,
          badgeBg: 'bg-teal-50 border-teal-100 text-teal-700',
        };
      case 'patient':
        return {
          name: userName || 'Patient',
          roleLabel: 'Patient Portal',
          icon: HeartPulse,
          badgeBg: 'bg-blue-50 border-blue-100 text-blue-700',
        };
      case 'student_therapist':
      default:
        return {
          name: userName || 'Student Therapist',
          roleLabel: 'Student Therapist',
          icon: GraduationCap,
          badgeBg: 'bg-indigo-50 border-indigo-100 text-indigo-700',
        };
    }
  };

  const currentRoleConfig = getRoleConfig(role);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
      {/* Left Title & Context */}
      <div>
        <h2 className="text-lg lg:text-xl font-semibold text-slate-800 tracking-tight">
          {getPageTitle(currentView)}
        </h2>
        <p className="text-xs text-slate-400">
          Intelligent Clinical Supervision • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Search Omnibox */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 w-60 lg:w-64 cursor-pointer hover:border-slate-300 transition-colors shadow-xs"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <span className="text-xs text-slate-400 flex-1 truncate">Search cases, patients...</span>
          <kbd className="font-mono text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">
            ⌘K
          </kbd>
        </div>

        {/* Global Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">
              {SUPPORTED_LANGUAGES.find((l) => l.code === interfaceLanguage)?.name || 'English'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setInterfaceLanguage(lang.code);
                    setIsLangMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700"
                >
                  <span>{lang.name}</span>
                  {interfaceLanguage === lang.code && (
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Sleek Role Badge Switcher */}
        <div className="relative">
          <div
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className={`flex items-center space-x-2 border rounded-lg px-3 py-1.5 cursor-pointer hover:opacity-90 transition-opacity ${currentRoleConfig.badgeBg}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-tight opacity-75">
              Role:
            </span>
            <span className="text-xs font-semibold">{currentRoleConfig.roleLabel}</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </div>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => logout()}
                className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors text-red-600 hover:bg-red-50"
              >
                <div className="font-semibold flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
