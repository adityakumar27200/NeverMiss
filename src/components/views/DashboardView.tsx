import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Clock,
  Flame,
  Calendar,
  PhoneCall,
  ShoppingCart,
  CheckCircle,
  CheckSquare,
  Square,
  ArrowRight,
  MoreVertical,
  Plus,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { formatDateYMD, formatTime12Hour, getRelativeTimeText, parseDateTime, addDays } from '../../utils/dateUtils';
import { ActiveTab } from '../layout/Sidebar';
import { CustomScheduleModal, ScheduleItemTarget } from '../common/CustomScheduleModal';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuickCreate: (tab?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickCreate,
}) => {
  const {
    tasks,
    deadlines,
    routines,
    followUps,
    groceryItems,
    events,
    effectiveNow,
    completeTask,
    snoozeTask,
    rescheduleTask,
    completeRoutineToday,
    toggleRoutineStep,
    skipRoutineToday,
    snoozeRoutine,
    completeFollowUp,
    toggleGroceryItem,
  } = useApp();

  const [selectedTaskMenu, setSelectedTaskMenu] = useState<string | null>(null);
  const [selectedRoutineMenu, setSelectedRoutineMenu] = useState<string | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleItemTarget | null>(null);

  const todayStr = formatDateYMD(effectiveNow);

  // Categorize Tasks
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const dueTodayTasks = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed' && t.status !== 'overdue');
  const upcomingTasks = tasks.filter(t => t.dueDate > todayStr && t.status !== 'completed').slice(0, 4);

  // Active Deadlines
  const activeDeadlines = deadlines.filter(d => d.status === 'active');

  // Routines for today
  const todayRoutines = routines.filter(r => r.active);

  // Pending Follow-ups
  const pendingFollowUps = followUps.filter(f => f.status === 'pending');

  // Unchecked Grocery
  const pendingGrocery = groceryItems.filter(g => !g.completed);

  // Smart Prioritization: "DO THIS FIRST" (Section 30)
  // 1. Critical overdue tasks
  // 2. Today's deadlines
  // 3. Important events
  // 4. High-priority tasks
  // 5. Missed routines
  // 6. Follow-ups
  const doThisFirstItems = [
    ...overdueTasks.filter(t => t.priority === 'critical').map(t => ({
      id: t.id,
      title: t.title,
      type: 'Critical Overdue Task',
      color: 'text-red-400 bg-red-500/10 border-red-500/30',
      action: () => completeTask(t.id),
    })),
    ...activeDeadlines.filter(d => d.deadlineDate <= todayStr || d.priority === 'critical').map(d => ({
      id: d.id,
      title: d.title,
      type: `Deadline: ${d.deadlineDate}`,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      action: () => onNavigate('deadlines'),
    })),
    ...dueTodayTasks.filter(t => t.priority === 'high' || t.priority === 'critical').map(t => ({
      id: t.id,
      title: t.title,
      type: 'High Priority Today',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      action: () => completeTask(t.id),
    })),
    ...pendingFollowUps.slice(0, 2).map(f => ({
      id: f.id,
      title: `Follow up with ${f.contactName} (${f.subject})`,
      type: 'Follow-up',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      action: () => completeFollowUp(f.id, 3),
    })),
  ].slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Today&apos;s Command Center</h1>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30 font-medium">
              {todayStr}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of deadlines, routines, follow-ups, and active priorities.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onOpenQuickCreate('task')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => onOpenQuickCreate('deadline')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>New Deadline</span>
          </button>
        </div>
      </div>

      {/* Smart Daily Prioritization: "DO THIS FIRST" (Section 30) */}
      {doThisFirstItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                <Zap className="w-4 h-4 fill-amber-400" />
              </div>
              <h2 className="font-bold text-sm sm:text-base text-amber-200 uppercase tracking-wide">
                🔥 Do This First (Smart Priority)
              </h2>
            </div>
            <span className="text-[11px] text-amber-300/80 font-medium hidden sm:inline">
              Engineered high-impact sequence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {doThisFirstItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-slate-100 block truncate">{item.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium inline-block mt-0.5 ${item.color}`}>
                      {item.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={item.action}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold transition shrink-0 cursor-pointer"
                >
                  Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Overdue & Due Today & Routines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Overdue & Due Today */}
        <div className="space-y-6">
          {/* 🔴 OVERDUE Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-bold text-sm text-red-400 uppercase tracking-wider">
                  🔴 Overdue ({overdueTasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {overdueTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  🎉 Fantastic! No overdue tasks at the moment.
                </div>
              ) : (
                overdueTasks.map(task => {
                  const targetTime = parseDateTime(task.dueDate, task.dueTime);
                  const rel = getRelativeTimeText(targetTime, effectiveNow);

                  return (
                    <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group">
                      <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => completeTask(task.id)}
                          className="mt-0.5 text-slate-500 hover:text-emerald-400 transition cursor-pointer shrink-0"
                          title="Mark complete"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-300 transition break-words">
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                            <span className="text-red-400 font-medium">{rel.text}</span>
                            <span>•</span>
                            <span>Was due: {task.dueDate} {formatTime12Hour(task.dueTime)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 flex-wrap gap-y-1 self-end sm:self-auto">
                        <button
                          onClick={() => setScheduleTarget({
                            id: task.id,
                            type: 'task',
                            title: task.title,
                            currentDate: task.dueDate,
                            currentTime: task.dueTime,
                            currentPriority: task.priority,
                            currentReminders: task.reminderRules,
                          })}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold border border-indigo-500/30 transition cursor-pointer flex items-center space-x-1"
                          title="Custom Date & Time"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Custom Date</span>
                        </button>
                        <button
                          onClick={() => snoozeTask(task.id, 60)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-medium border border-slate-700 transition cursor-pointer"
                          title="Snooze 1 hour"
                        >
                          Snooze 1h
                        </button>
                        <button
                          onClick={() => rescheduleTask(task.id, addDays(todayStr, 1))}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-medium border border-slate-700 transition cursor-pointer"
                          title="Reschedule to Tomorrow"
                        >
                          Tomorrow
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 🟠 DUE TODAY Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider">
                  🟠 Due Today ({dueTodayTasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {dueTodayTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No further tasks due today! Keep planning ahead.
                </div>
              ) : (
                dueTodayTasks.map(task => (
                  <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group">
                    <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => completeTask(task.id)}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 transition cursor-pointer shrink-0"
                        title="Mark complete"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition break-words">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                          <span className="text-cyan-400 font-mono font-medium">{formatTime12Hour(task.dueTime)}</span>
                          <span>•</span>
                          <span className="capitalize">{task.priority} priority</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 flex-wrap gap-y-1 self-end sm:self-auto">
                      <button
                        onClick={() => setScheduleTarget({
                          id: task.id,
                          type: 'task',
                          title: task.title,
                          currentDate: task.dueDate,
                          currentTime: task.dueTime,
                          currentPriority: task.priority,
                          currentReminders: task.reminderRules,
                        })}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-medium border border-slate-700 transition cursor-pointer flex items-center space-x-1"
                        title="Reschedule / Custom Date & Time"
                      >
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-semibold border border-emerald-500/30 transition cursor-pointer"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Routines & Follow-ups */}
        <div className="space-y-6">
          {/* 🔵 ROUTINES Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-bold text-sm text-blue-400 uppercase tracking-wider">
                  🔵 Daily Routines ({todayRoutines.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('routines')}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>Manage habits</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {todayRoutines.map(routine => {
                const isCompletedToday = routine.completedDates.includes(todayStr);
                const isSkippedToday = routine.skippedDates.includes(todayStr);

                return (
                  <div key={routine.id} className="py-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5 min-w-0">
                        <button
                          onClick={() => completeRoutineToday(routine.id)}
                          className={`mt-0.5 transition cursor-pointer ${
                            isCompletedToday ? 'text-emerald-400' : 'text-slate-500 hover:text-indigo-400'
                          }`}
                        >
                          {isCompletedToday ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                        <div className="min-w-0">
                          <h4 className={`text-xs sm:text-sm font-semibold ${isCompletedToday ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {routine.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono text-indigo-400">{formatTime12Hour(routine.time)}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold flex items-center">
                              🔥 {routine.streak} days streak
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {!isCompletedToday && !isSkippedToday && (
                          <>
                            <button
                              onClick={() => snoozeRoutine(routine.id, 15)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium border border-slate-700 transition"
                            >
                              Snooze
                            </button>
                            <button
                              onClick={() => skipRoutineToday(routine.id)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px] font-medium border border-slate-700 transition"
                            >
                              Skip
                            </button>
                          </>
                        )}
                        {isSkippedToday && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            Skipped today
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sub-steps checklist if present */}
                    {routine.steps && routine.steps.length > 0 && (
                      <div className="ml-7 pl-3 border-l-2 border-slate-800 space-y-1.5 py-1">
                        {routine.steps.map(step => (
                          <div
                            key={step.id}
                            onClick={() => toggleRoutineStep(routine.id, step.id)}
                            className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                          >
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                              step.done ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'
                            }`}>
                              {step.done ? '✓' : ''}
                            </span>
                            <span className={step.done ? 'line-through text-slate-500' : ''}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 📞 FOLLOW-UPS Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider">
                  📞 Active Follow-ups ({pendingFollowUps.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('followups')}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 mt-2">
              {pendingFollowUps.slice(0, 3).map(item => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{item.contactName}</span>
                      <span className="text-slate-500 text-xs">—</span>
                      <span className="text-xs text-cyan-300 truncate">{item.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.notes}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      Next contact: {item.nextFollowUpDate} {item.nextFollowUpTime}
                    </span>
                  </div>

                  <button
                    onClick={() => completeFollowUp(item.id, 3)}
                    className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg text-[10px] font-semibold border border-cyan-500/30 transition shrink-0 cursor-pointer"
                    title="Mark Done & Auto schedule next in 3 days"
                  >
                    Done (+3d)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Upcoming Work & Grocery Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🟡 UPCOMING DEADLINES & WORK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <h3 className="font-bold text-sm text-yellow-400 uppercase tracking-wider">
                🟡 Upcoming Milestones & Deadlines
              </h3>
            </div>
            <button
              onClick={() => onNavigate('deadlines')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>Deadlines</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 mt-2">
            {activeDeadlines.slice(0, 4).map(dl => (
              <div key={dl.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/30 font-mono text-[11px] font-bold shrink-0">
                    {dl.deadlineDate.slice(5)}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-white block truncate">{dl.title}</span>
                    <span className="text-[10px] text-slate-400">{dl.priority} priority</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {formatTime12Hour(dl.deadlineTime)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 🛒 GROCERY QUICK LIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                🛒 Grocery & Supplies ({pendingGrocery.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('grocery')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>Full list</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5 mt-3">
            {pendingGrocery.slice(0, 5).map(item => (
              <div
                key={item.id}
                onClick={() => toggleGroceryItem(item.id)}
                className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs cursor-pointer transition select-none"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <Square className="w-4 h-4 text-slate-500 hover:text-emerald-400" />
                  <span className="font-medium text-slate-200 truncate">
                    {item.name} ({item.quantity} {item.unit})
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date & Time Modal */}
      <CustomScheduleModal
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        item={scheduleTarget}
      />
    </div>
  );
};
