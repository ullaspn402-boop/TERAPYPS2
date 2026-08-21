import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CalendarDays,
  Mic,
  TrendingUp,
  FileSpreadsheet,
  Bot,
  Sliders,
  Sparkles,
  ShieldAlert,
  ClipboardList,
  GraduationCap,
  BarChart3,
  UserCog,
  Settings,
  SplitSquareVertical,
  Home,
  HeartPulse,
} from 'lucide-react';
import { useApp, NavigationPage } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';
import { useTranslation } from '../../i18n/translations';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  isAi?: boolean;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, role, currentUser } = useApp();
  const t = useTranslation();

  const getNavForRole = () => {
    switch (role) {
      case 'supervisor':
        return [
          {
            title: t.supervisorCenter,
            items: [
              { id: 'supervisor-center' as NavigationPage, label: t.supervisorCenter, icon: ShieldAlert, badge: '3 Priority', badgeColor: 'bg-red-500/20 text-red-400' },
              { id: 'my-cases' as NavigationPage, label: t.supervisedCases, icon: FolderKanban },
              { id: 'therapy-plans' as NavigationPage, label: t.planReviews, icon: ClipboardList },
              // Student Competency removed — feedback/evaluation handled within Therapy Plan Review
              // AI Case Allocation removed — not needed in Supervisor portal
            ],
          },
          {
            title: 'AI Decision Support',
            items: [
              { id: 'ai-insights' as NavigationPage, label: 'AI Telemetry Insights', icon: Sparkles, isAi: true },
              { id: 'ai-assistant' as NavigationPage, label: 'AI Clinical Assistant', icon: Bot, isAi: true },
            ],
          },
          {
            title: 'Clinical Analytics',
            items: [
              { id: 'reports' as NavigationPage, label: t.reports, icon: FileSpreadsheet },
              { id: 'analytics' as NavigationPage, label: 'Institution Analytics', icon: BarChart3 },
              { id: 'settings' as NavigationPage, label: t.settings, icon: Settings },
            ],
          },
        ];

      case 'admin':
        return [
          {
            title: 'Institution Admin',
            items: [
              { id: 'analytics' as NavigationPage, label: 'Institution Dashboard', icon: BarChart3 },
              { id: 'users' as NavigationPage, label: 'Account Management', icon: UserCog },
              // Patient Registration removed — Admin does not register patients
              // Case Directory removed — Admin manages users, not cases
              { id: 'settings' as NavigationPage, label: t.settings, icon: Settings },
            ],
          },
        ];

      case 'patient':
        return [
          {
            title: 'Patient Portal',
            items: [
              { id: 'dashboard' as NavigationPage, label: 'My Therapy Portal', icon: LayoutDashboard },
              { id: 'speech-practice' as NavigationPage, label: t.speechPractice, icon: Mic, badge: 'Live', badgeColor: 'bg-cyan-500/20 text-cyan-400' },
              { id: 'adaptive-therapy' as NavigationPage, label: 'Therapy Activities', icon: Sliders },
              { id: 'progress' as NavigationPage, label: t.milestones, icon: TrendingUp },
              { id: 'therapy-sessions' as NavigationPage, label: t.therapySessions, icon: CalendarDays },
              { id: 'settings' as NavigationPage, label: t.settings, icon: Settings },
            ],
          },
        ];

      case 'student_therapist':
      default:
        return [
          {
            title: 'Clinical Care',
            items: [
              { id: 'dashboard' as NavigationPage, label: t.dashboard, icon: LayoutDashboard },
              { id: 'my-cases' as NavigationPage, label: 'My Assigned Cases', icon: FolderKanban, badge: '06' },
              // Patient Directory removed — patient access is through My Assigned Cases → Open Case → Patient
              { id: 'therapy-sessions' as NavigationPage, label: t.therapySessions, icon: CalendarDays },
              { id: 'speech-practice' as NavigationPage, label: t.speechPractice, icon: Mic, badge: 'Live', badgeColor: 'bg-cyan-500/20 text-cyan-400' },
              // Progress/10-session milestone removed from Student Therapist portal per design requirements
              { id: 'reports' as NavigationPage, label: t.reports, icon: FileSpreadsheet, badge: '02', badgeColor: 'bg-red-500/20 text-red-400' },
            ],
          },
          {
            title: 'AI Decision Support',
            items: [
              { id: 'ai-assistant' as NavigationPage, label: 'AI Therapist Assistant', icon: Bot, isAi: true },
              // AI Supervisor Recommendation removed — student selects supervisor directly during patient creation / case view
              { id: 'adaptive-therapy' as NavigationPage, label: 'Adaptive Progression', icon: Sliders, isAi: true },
              { id: 'ai-insights' as NavigationPage, label: 'AI Insights', icon: Sparkles, isAi: true },
            ],
          },
          {
            title: 'Account',
            items: [
              { id: 'settings' as NavigationPage, label: t.settings, icon: Settings },
            ],
          },
        ];
    }
  };

  const navGroups = getNavForRole();

  const getRoleLabel = () => {
    switch (role) {
      case 'supervisor': return 'Clinical Supervisor';
      case 'admin': return 'Institute Director';
      case 'patient': return 'Patient / Family';
      default: return 'Student Therapist';
    }
  };

  const displayName = currentUser?.name || 'User';
  const roleLabel = getRoleLabel();

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-screen border-r border-slate-800 shadow-xl fixed left-0 top-0 z-40 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center space-x-3 border-b border-slate-800/80">
        <div className="w-8 h-8 bg-[#006A61] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20 shrink-0">
          S
        </div>
        <div className="overflow-hidden">
          <h1 className="text-white font-semibold text-base tracking-tight leading-none">
            {t.appName}
          </h1>
          <p className="text-[#86F2E4] text-[10px] font-bold uppercase tracking-wider mt-1">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Public Landing Link */}
      <div className="px-4 pt-3 pb-1">
        <div
          onClick={() => setCurrentView('landing')}
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
            currentView === 'landing'
              ? 'bg-[#006A61]/30 text-[#86F2E4] border-[#006A61]/50'
              : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Public Landing View</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 mt-4 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-2 mb-2">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? 'text-white bg-slate-800 font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          item.isAi
                            ? 'text-[#86F2E4]'
                            : isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Role Footer */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/50 space-y-2.5">
          <div className="flex items-center space-x-3">
            <Avatar name={displayName} role={role} size="sm" />
            <div className="overflow-hidden min-w-0">
              <p className="text-white text-xs font-medium truncate">{displayName}</p>
              <p className="text-slate-400 text-[10px] truncate">{roleLabel}</p>
            </div>
          </div>
          <div className="bg-[#006A61]/20 border border-[#006A61]/40 rounded py-1 px-2 text-center">
            <span className="text-[#86F2E4] text-[10px] font-bold uppercase tracking-wider block">
              ROLE: {role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
