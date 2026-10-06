import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
  Clock,
  CheckCircle2,
  PhoneCall,
  CalendarDays,
  ShoppingCart,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { formatDateYMD, formatTime12Hour, addDays } from '../../utils/dateUtils';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const {
    tasks,
    routines,
    followUps,
    events,
    groceryItems,
    deadlines,
    effectiveNow,
  } = useApp();

  const [activeDigest, setActiveDigest] = useState<'morning' | 'evening'>('morning');

  if (!isOpen) return null;

  const todayStr = formatDateYMD(effectiveNow);
  const tomorrowStr = addDays(todayStr, 1);

  // Computations
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const dueTodayTasks = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed' && t.status !== 'overdue');
  const completedTodayTasks = tasks.filter(t => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(todayStr));
  const activeRoutines = routines.filter(r => r.active);
  const completedRoutinesCount = routines.filter(r => r.completedDates.includes(todayStr)).length;
  const pendingFollowUps = followUps.filter(f => f.status === 'pending' && f.nextFollowUpDate <= todayStr);
  const completedFollowUpsToday = followUps.filter(f => f.status === 'completed' && f.completedAt && f.completedAt.startsWith(todayStr));
  const todayEvents = events.filter(e => e.date === todayStr);
  const pendingGroceries = groceryItems.filter(g => !g.completed);

  // Next activity finder
  const upcomingToday = [
    ...dueTodayTasks.map(t => ({ title: t.title, time: t.dueTime || '17:00', type: 'Task' })),
    ...todayEvents.map(e => ({ title: e.title, time: e.time, type: 'Event' })),
    ...activeRoutines.map(r => ({ title: r.name, time: r.time, type: 'Routine' })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const nextActivity = upcomingToday[0];

  // Tomorrow forecast
  const tomorrowTasks = tasks.filter(t => t.dueDate === tomorrowStr);
  const tomorrowEvents = events.filter(e => e.date === tomorrowStr);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Executive Daily Digest</h3>
              <p className="text-xs text-slate-400">Automated intelligence & daily workload review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 p-2 gap-2">
          <button
            onClick={() => setActiveDigest('morning')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeDigest === 'morning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Morning Plan Brief</span>
          </button>
          <button
            onClick={() => setActiveDigest('evening')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeDigest === 'evening'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Evening Wrap-up & Tomorrow</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          {activeDigest === 'morning' ? (
            <>
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 p-4 rounded-xl border border-amber-500/20">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>Good Morning 👋</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Here is your orchestrated game-plan for today. Target overdue and critical deadlines first before routines!
                </p>
              </div>

              {/* Status List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div
                  onClick={() => { onNavigateToTab('tasks'); onClose(); }}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-red-500/30 p-3 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-red-400 text-xs font-semibold mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                    <span>Overdue</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{overdueTasks.length}</div>
                  <div className="text-[11px] text-slate-400">Needs immediate triage</div>
                </div>

                <div
                  onClick={() => { onNavigateToTab('tasks'); onClose(); }}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-amber-500/30 p-3 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due Today</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{dueTodayTasks.length}</div>
                  <div className="text-[11px] text-slate-400">Scheduled for today</div>
                </div>

                <div
                  onClick={() => { onNavigateToTab('routines'); onClose(); }}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-blue-500/30 p-3 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Routines</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{activeRoutines.length}</div>
                  <div className="text-[11px] text-slate-400">Keep streaks alive</div>
                </div>

                <div
                  onClick={() => { onNavigateToTab('followups'); onClose(); }}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-cyan-500/30 p-3 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Follow-ups</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{pendingFollowUps.length}</div>
                  <div className="text-[11px] text-slate-400">Client contacts</div>
                </div>

                <div
                  onClick={() => { onNavigateToTab('events'); onClose(); }}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-purple-500/30 p-3 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold mb-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Events</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{todayEvents.length}</div>
                  <div className="text-[11px] text-slate-400">Scheduled calendar</div>
                </div>

                <div
                  onClick={() => { onNavigateToTab('grocery'); onClose(); }}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-emerald-500/30 p-3 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Grocery</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{pendingGroceries.length}</div>
                  <div className="text-[11px] text-slate-400">Shopping items</div>
                </div>
              </div>

              {/* Next Activity */}
              {nextActivity && (
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Upcoming Next Today
                    </span>
                    <div className="font-semibold text-white text-sm mt-0.5">{nextActivity.title}</div>
                    <span className="text-slate-400 text-[11px]">{nextActivity.type}</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-mono font-bold rounded-lg border border-indigo-500/30">
                    {formatTime12Hour(nextActivity.time)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Evening Digest */}
              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 rounded-xl border border-indigo-500/30">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Daily Accomplishments & Status</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  You accomplished significant progress today. Take a moment to review pending tasks before turning in!
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-emerald-300 font-medium">✓ Completed Tasks</span>
                  <span className="text-emerald-300 font-bold text-sm">{completedTodayTasks.length}</span>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-blue-300 font-medium">✓ Routines Performed</span>
                  <span className="text-blue-300 font-bold text-sm">{completedRoutinesCount}</span>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-purple-300 font-medium">✓ Follow-ups Addressed</span>
                  <span className="text-purple-300 font-bold text-sm">{completedFollowUpsToday.length}</span>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-amber-300 font-medium">⚠️ Remaining Pending Tasks</span>
                  <span className="text-amber-300 font-bold text-sm">{dueTodayTasks.length}</span>
                </div>
              </div>

              {/* Tomorrow Forecast */}
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/70 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Tomorrow&apos;s Outlook ({tomorrowStr})
                </span>
                <div className="mt-2 space-y-1 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Scheduled Tasks:</span>
                    <span className="font-semibold text-white">{tomorrowTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Events & Meetings:</span>
                    <span className="font-semibold text-white">{tomorrowEvents.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recurring Routines:</span>
                    <span className="font-semibold text-white">{activeRoutines.length}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close Digest
          </button>
        </div>
      </div>
    </div>
  );
};
