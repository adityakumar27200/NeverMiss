import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Plus,
  Clock,
  CheckSquare,
  Square,
  Trophy,
  RotateCcw,
  Calendar,
  AlertCircle,
  Trash2,
  ListChecks,
  Repeat,
  Pause,
  Play,
  User,
} from 'lucide-react';
import { formatTime12Hour, formatDateYMD } from '../../utils/dateUtils';
import { Routine, RoutineRepeatType } from '../../types';
import { CustomScheduleModal, ScheduleItemTarget } from '../common/CustomScheduleModal';

interface RoutinesViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({ onOpenQuickCreate }) => {
  const {
    routines,
    categories,
    effectiveNow,
    completeRoutineToday,
    skipRoutineToday,
    snoozeRoutine,
    toggleRoutineStep,
    deleteRoutine,
    updateRoutine,
    users,
    currentUser,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly' | 'interval'>('all');
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleItemTarget | null>(null);
  const todayStr = formatDateYMD(effectiveNow);

  const filteredRoutines = routines.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'daily') return r.repeatType === 'daily';
    if (activeFilter === 'weekly') return r.repeatType === 'weekly' || r.repeatType === 'specific_days';
    if (activeFilter === 'interval') return r.repeatType === 'interval' || r.repeatType === 'custom';
    return true;
  });

  const getDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Routines, Habits & Streaks</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build sustainable daily rhythms with streak tracking and exception recovery.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickCreate('routine')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {(['all', 'daily', 'weekly', 'interval'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              activeFilter === tab
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Routines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRoutines.map(routine => {
          const isCompletedToday = routine.completedDates.includes(todayStr);
          const isSkippedToday = routine.skippedDates.includes(todayStr);
          const cat = categories.find(c => c.id === routine.categoryId);

          return (
            <div
              key={routine.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 transition hover:border-slate-700 ${
                isCompletedToday ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 min-w-0">
                  <button
                    onClick={() => completeRoutineToday(routine.id)}
                    className={`mt-1 transition cursor-pointer shrink-0 ${
                      isCompletedToday ? 'text-emerald-400' : 'text-slate-500 hover:text-rose-400'
                    }`}
                    title={isCompletedToday ? 'Completed today' : 'Mark done today'}
                  >
                    {isCompletedToday ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>

                  <div className="min-w-0">
                    <h3 className={`font-bold text-base ${isCompletedToday ? 'text-slate-300 line-through' : 'text-white'}`}>
                      {routine.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5 flex-wrap gap-1">
                      <span className="font-mono text-cyan-400 font-semibold">{formatTime12Hour(routine.time)}</span>
                      <span>•</span>
                      <span className="capitalize">{routine.repeatType}</span>
                      <span>•</span>
                      <span>{routine.durationMinutes} mins</span>
                      {routine.assignedUserId && (() => {
                        const assigneeUser = users.find(u => u.id === routine.assignedUserId);
                        if (!assigneeUser) return null;
                        const isSelf = assigneeUser.id === currentUser?.id;
                        return (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/25 text-[10px] font-medium">
                            👤 {isSelf ? 'You' : assigneeUser.fullName}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => updateRoutine(routine.id, { active: !routine.active })}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      routine.active ? 'text-slate-400 hover:text-amber-400' : 'text-amber-400 hover:text-emerald-400'
                    }`}
                    title={routine.active ? 'Pause routine' : 'Resume routine'}
                  >
                    {routine.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition"
                    title="Delete routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {routine.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{routine.description}</p>
              )}

              {/* Sub-steps if grouped (e.g. morning routine) */}
              {routine.steps && routine.steps.length > 0 && (
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <ListChecks className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Grouped Steps Checklist:</span>
                    </span>
                    <span>
                      {routine.steps.filter(s => s.done).length}/{routine.steps.length} done
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {routine.steps.map(step => (
                      <div
                        key={step.id}
                        onClick={() => toggleRoutineStep(routine.id, step.id)}
                        className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none p-1 rounded hover:bg-slate-700/40"
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
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
                </div>
              )}

              {/* Streak Tracker & Best Record */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <div className="text-xs font-bold text-white">Current Streak: {routine.streak} days</div>
                    <div className="text-[10px] text-slate-400">Best Record: 🏆 {routine.bestStreak} days</div>
                  </div>
                </div>

                {/* 7-day indicator dots */}
                <div className="flex items-center space-x-1">
                  {[6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
                    const d = new Date(effectiveNow);
                    d.setDate(d.getDate() - daysAgo);
                    const dStr = formatDateYMD(d);
                    const isDone = routine.completedDates.includes(dStr);
                    const isToday = daysAgo === 0;

                    return (
                      <div
                        key={daysAgo}
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isToday
                            ? 'bg-slate-800 text-slate-400 border border-indigo-500/40'
                            : 'bg-slate-800/50 text-slate-600 border border-slate-800'
                        }`}
                        title={`${dStr}: ${isDone ? 'Completed' : 'Missed / Pending'}`}
                      >
                        {isDone ? '✓' : getDayNames[d.getDay()][0]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missed Routine Handling Actions (Section 12 & 14) */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <button
                    onClick={() => setScheduleTarget({
                      id: routine.id,
                      type: 'routine',
                      title: routine.name,
                      currentTime: routine.time,
                    })}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                    title="Change Scheduled Time"
                  >
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Change Time</span>
                  </button>

                  {!isCompletedToday && !isSkippedToday ? (
                    <>
                      <button
                        onClick={() => snoozeRoutine(routine.id, 15)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                      >
                        Snooze 15m
                      </button>
                      <button
                        onClick={() => skipRoutineToday(routine.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-medium border border-slate-700 transition"
                      >
                        Skip Today
                      </button>
                    </>
                  ) : isSkippedToday ? (
                    <span className="text-slate-400 text-xs italic">Skipped today (streak preserved)</span>
                  ) : (
                    <span className="text-emerald-400 font-medium text-xs">Completed for today!</span>
                  )}
                </div>

                {cat && (
                  <span className="text-[11px] font-medium" style={{ color: cat.color }}>
                    ● {cat.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Schedule Modal */}
      <CustomScheduleModal
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        item={scheduleTarget}
      />
    </div>
  );
};
