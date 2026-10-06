import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  History as HistoryIcon,
  CheckCircle2,
  Trophy,
  Flame,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatTime12Hour, formatHumanDate } from '../../utils/dateUtils';

export const HistoryView: React.FC = () => {
  const { tasks, routines, followUps } = useApp();

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completedFollowUps = followUps.filter(f => f.status === 'completed');

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Best routines streaks
  const topStreaks = [...routines].sort((a, b) => b.streak - a.streak);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <HistoryIcon className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Productivity Analytics & History</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical audit log of delivered tasks, routine consistency, and habit endurance.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{completionRate}%</div>
          <p className="text-[11px] text-slate-400">{completedTasks.length} out of {totalTasks} tasks closed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Habit Consistency</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {routines.reduce((sum, r) => sum + r.streak, 0)} <span className="text-sm font-normal text-slate-400">total streak days</span>
          </div>
          <p className="text-[11px] text-slate-400">Across {routines.length} recurring routines</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Client Touchpoints Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">{completedFollowUps.length}</div>
          <p className="text-[11px] text-slate-400">Follow-ups logged and closed</p>
        </div>
      </div>

      {/* Routine Streaks Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Routine Streak Hall of Fame</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topStreaks.map(r => (
            <div key={r.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">{r.name}</span>
                <span className="text-[10px] text-slate-400">Best Record: {r.bestStreak} days</span>
              </div>
              <div className="flex items-center space-x-1 font-bold text-rose-400">
                <Flame className="w-4 h-4 fill-rose-500" />
                <span>{r.streak} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tasks Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Completed Tasks Audit Trail ({completedTasks.length})</span>
        </h3>

        {completedTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No completed tasks in history yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/80 space-y-2">
            {completedTasks.map(t => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 line-through truncate block">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Original due date: {t.dueDate} {formatTime12Hour(t.dueTime)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  {t.completedAt ? `${t.completedAt.slice(0, 10)} ${t.completedAt.slice(11, 16)}` : 'Closed'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
