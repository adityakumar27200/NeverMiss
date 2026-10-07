import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Flame,
  Repeat,
  PhoneCall,
  ShoppingCart,
  Clock,
  Bell,
  Calendar,
  Tags,
  Users,
  Timer,
  History,
  Settings,
  Smartphone,
  AlertTriangle,
  Heart,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'family'
  | 'tasks'
  | 'events'
  | 'deadlines'
  | 'routines'
  | 'followups'
  | 'grocery'
  | 'recurring'
  | 'reminders'
  | 'notifications'
  | 'calendar'
  | 'categories'
  | 'contacts'
  | 'planner'
  | 'history'
  | 'settings'
  | 'android_plan';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { tasks, deadlines, followUps, groceryItems, notifications, familyMembers } = useApp();

  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const activeDeadlinesCount = deadlines.filter(d => d.status === 'active').length;
  const pendingFollowUps = followUps.filter(f => f.status === 'pending').length;
  const uncheckedGrocery = groceryItems.filter(g => !g.completed).length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: overdueCount > 0 ? `${overdueCount} overdue` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'family' as ActiveTab,
      label: 'Family & Members',
      icon: Heart,
      badge: `${familyMembers.length} members`,
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: overdueCount > 0 ? `${overdueCount}` : `${tasks.filter(t => t.status !== 'completed').length}`,
      badgeColor: overdueCount > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'events' as ActiveTab,
      label: 'Events & Meetings',
      icon: CalendarDays,
    },
    {
      id: 'deadlines' as ActiveTab,
      label: 'Deadlines',
      icon: AlertTriangle,
      badge: activeDeadlinesCount > 0 ? `${activeDeadlinesCount}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'routines' as ActiveTab,
      label: 'Routines & Habits',
      icon: Flame,
    },
    {
      id: 'followups' as ActiveTab,
      label: 'Follow-ups',
      icon: PhoneCall,
      badge: pendingFollowUps > 0 ? `${pendingFollowUps}` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'grocery' as ActiveTab,
      label: 'Grocery Lists',
      icon: ShoppingCart,
      badge: uncheckedGrocery > 0 ? `${uncheckedGrocery}` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'recurring' as ActiveTab,
      label: 'Recurring Tasks',
      icon: Repeat,
    },
    {
      id: 'reminders' as ActiveTab,
      label: 'Reminder Engine',
      icon: Clock,
    },
    {
      id: 'notifications' as ActiveTab,
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'planner' as ActiveTab,
      label: 'Daily Planner',
      icon: Timer,
    },
    {
      id: 'contacts' as ActiveTab,
      label: 'Contacts',
      icon: Users,
    },
    {
      id: 'categories' as ActiveTab,
      label: 'Categories',
      icon: Tags,
    },
    {
      id: 'history' as ActiveTab,
      label: 'History & Analytics',
      icon: History,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-10 w-72 sm:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-transform duration-200 ease-in-out shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between lg:hidden">
          <span className="font-bold text-white text-sm">Navigation Menu</span>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Productivity Suite
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-md border shrink-0 ${
                      isActive ? 'bg-indigo-700 text-indigo-100 border-indigo-400/40' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Mobile Roadmap
          </div>

          {/* Android App Plan Tab */}
          <button
            onClick={() => handleSelect('android_plan')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer group ${
              activeTab === 'android_plan'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
              <span className="truncate font-semibold">Android App Plan</span>
            </div>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              ROADMAP
            </span>
          </button>
        </div>

        {/* Bottom summary card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="font-medium">Work Pipeline</span>
              <span className="text-[11px] text-indigo-400 font-semibold">
                {Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {tasks.filter(t => t.status === 'completed').length} of {tasks.length} tasks completed
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
