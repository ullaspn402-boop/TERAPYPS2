import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LandingPage } from './components/landing/LandingPage';
import { TherapistDashboard } from './components/dashboard/TherapistDashboard';
import { PatientDetailView } from './components/patient/PatientDetailView';
import { SpeechPracticeStudio } from './components/therapy/SpeechPracticeStudio';
import { AdaptiveTherapyView } from './components/adaptive/AdaptiveTherapyView';
import { SupervisorCenter } from './components/supervision/SupervisorCenter';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { AIInsightsView } from './components/ai/AIInsightsView';
import { AICaseAllocationView } from './components/allocation/AICaseAllocationView';
import { PatientsListView } from './components/views/PatientsListView';
import { AdminUsersView } from './components/views/AdminUsersView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { LoginView } from './components/auth/LoginView';

const MainAppContent: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage />
        <GlobalSearchModal />
        <NotificationDrawer />
      </>
    );
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <TherapistDashboard />;
      case 'my-cases':
      case 'patients':
        return <PatientsListView />;
      case 'users':
        return <AdminUsersView />;
      case 'patient-detail':
      case 'therapy-sessions':
      case 'progress':
        return <PatientDetailView />;
      case 'speech-practice':
        return <SpeechPracticeStudio />;
      case 'adaptive-therapy':
        return <AdaptiveTherapyView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'ai-insights':
        return <AIInsightsView />;
      case 'supervisor-center':
      case 'therapy-plans':
      case 'reviews':
      case 'student-competency':
        return <SupervisorCenter />;
      case 'ai-allocation':
        return <AICaseAllocationView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TherapistDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block no-print">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* Mobile Navigation Header */}
        <div className="no-print">
          <MobileNav />
        </div>

        {/* Top Header */}
        <div className="hidden md:block no-print">
          <Header />
        </div>

        {/* Inner Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 md:pt-6 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Drawers */}
      <div className="no-print">
        <GlobalSearchModal />
        <NotificationDrawer />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
