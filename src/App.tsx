import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { ActiveAlarmBanner } from './components/common/ActiveAlarmBanner';
import { QuickCreateModal } from './components/common/QuickCreateModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SummaryModal } from './components/common/SummaryModal';
import { TeamScopeBar } from './components/common/TeamScopeBar';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/views/DashboardView';
import { TasksView } from './components/views/TasksView';
import { EventsView } from './components/views/EventsView';
import { DeadlinesView } from './components/views/DeadlinesView';
import { RoutinesView } from './components/views/RoutinesView';
import { FollowUpsView } from './components/views/FollowUpsView';
import { GroceryView } from './components/views/GroceryView';
import { RecurringTasksView } from './components/views/RecurringTasksView';
import { RemindersView } from './components/views/RemindersView';
import { NotificationsView } from './components/views/NotificationsView';
import { CalendarView } from './components/views/CalendarView';
import { CategoriesView } from './components/views/CategoriesView';
import { ContactsView } from './components/views/ContactsView';
import { DailyPlannerView } from './components/views/DailyPlannerView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { AndroidAppPlanView } from './components/views/AndroidAppPlanView';
import { FamilyView } from './components/views/FamilyView';

import {
  Menu,
  LayoutDashboard,
  CheckSquare,
  AlertTriangle,
  Flame,
  Plus,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateInitialTab, setQuickCreateInitialTab] = useState<any>('task');
  const [quickCreateLockTab, setQuickCreateLockTab] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // If user is not logged in, show full-screen Phone Login & Sign Up portal
  if (!currentUser) {
    return <LoginView />;
  }

  const handleOpenQuickCreate = (initialTab = 'task', lock = true) => {
    setQuickCreateInitialTab(initialTab);
    setQuickCreateLockTab(lock);
    setIsQuickCreateOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenQuickCreate={handleOpenQuickCreate}
          />
        );
      case 'family':
        return <FamilyView />;
      case 'tasks':
        return <TasksView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'events':
        return <EventsView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'deadlines':
        return <DeadlinesView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'routines':
        return <RoutinesView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'followups':
        return <FollowUpsView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'grocery':
        return <GroceryView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'recurring':
        return <RecurringTasksView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'reminders':
        return <RemindersView />;
      case 'notifications':
        return <NotificationsView />;
      case 'calendar':
        return <CalendarView />;
      case 'categories':
        return <CategoriesView />;
      case 'contacts':
        return <ContactsView onOpenQuickCreate={handleOpenQuickCreate} />;
      case 'planner':
        return <DailyPlannerView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'android_plan':
        return <AndroidAppPlanView />;
      default:
        return (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenQuickCreate={handleOpenQuickCreate}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Active Alarm Banner (Fires for urgent deadlines & critical overdue work) */}
      <ActiveAlarmBanner />

      {/* Header */}
      <Header
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        onOpenQuickCreate={() => handleOpenQuickCreate('task')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onNavigateToNotifications={() => setActiveTab('notifications')}
        onNavigateToSettings={() => setActiveTab('settings')}
        onNavigateToFamily={() => setActiveTab('family')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isMobileNavOpen}
          setIsOpenMobile={setIsMobileNavOpen}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto min-h-0 px-3 py-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 max-w-7xl mx-auto w-full">
          {/* Team Scope & Role Awareness Bar */}
          {activeTab !== 'android_plan' && activeTab !== 'family' && <TeamScopeBar />}

          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Quick Bar for instant one-thumb navigation */}
      <nav className="lg:hidden bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-4 py-2 sticky bottom-0 z-30 flex items-center justify-around text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Today</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'tasks' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => handleOpenQuickCreate(activeTab === 'planner' ? 'planner' : 'task')}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center -mt-4 shadow-lg shadow-indigo-600/30 cursor-pointer"
          title="Add New"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'deadlines' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Deadlines</span>
        </button>
        <button
          onClick={() => setActiveTab('routines')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'routines' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Routines</span>
        </button>
      </nav>

      {/* Universal Quick Create Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        initialTab={quickCreateInitialTab}
        lockTab={quickCreateLockTab}
      />

      {/* Universal Instant Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setActiveTab}
      />

      {/* Executive Daily Digest (Morning/Evening) */}
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onNavigateToTab={setActiveTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
