import React from 'react';
import { X, Check, Bell, AlertTriangle, Sparkles, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateToPatient,
    setCurrentView,
    patients,
  } = useApp();

  if (!isNotificationOpen) return null;

  const handleNotificationClick = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.relatedCaseId) {
      const patient = patients.find((p) => p.caseId === notif.relatedCaseId);
      if (patient) {
        if (notif.type === 'milestone') {
          navigateToPatient(patient.id, 'progress');
        } else if (notif.type === 'supervisor_feedback') {
          navigateToPatient(patient.id, 'sessions');
        } else if (notif.type === 'ai_insight') {
          navigateToPatient(patient.id, 'overview');
        } else {
          navigateToPatient(patient.id, 'overview');
        }
      }
    } else if (notif.type === 'assignment') {
      setCurrentView('ai-allocation');
    }
    setIsNotificationOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2F1] text-[#006A61] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Notifications & Clinical Alerts</h3>
              <p className="text-xs text-slate-500">Real-time supervision & AI triggers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-[#006A61] hover:underline font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-teal-600 mb-2 opacity-50" />
              <p className="text-sm">All notifications cleared</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUrgent = n.priority === 'high';
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                    n.unread
                      ? isUrgent
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-[#F2FBF9] border-[#86F2E4]'
                      : 'bg-white border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isUrgent
                          ? 'bg-red-100 text-red-600'
                          : n.type === 'ai_insight'
                          ? 'bg-teal-100 text-[#006A61]'
                          : n.type === 'milestone'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : n.type === 'ai_insight' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : n.type === 'milestone' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {n.description}
                      </p>
                      {n.relatedCaseId && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#006A61]">
                          <span>View {n.relatedCaseId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-slate-200 text-center text-xs text-slate-500">
          Showing clinical updates for current active cases
        </div>
      </div>
    </div>
  );
};
