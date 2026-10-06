import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Repeat,
  Plus,
  Calendar,
  CheckSquare,
  Square,
  Clock,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { formatTime12Hour, formatHumanDate, parseDateTime } from '../../utils/dateUtils';

interface RecurringTasksViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const RecurringTasksView: React.FC<RecurringTasksViewProps> = ({ onOpenQuickCreate }) => {
  const { tasks, completeTask, deleteTask, categories } = useApp();

  const recurringTasks = tasks.filter(t => t.recurrence && t.recurrence.type !== 'none');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Repeat className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Recurring Tasks Engine</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated recurrence management for cyclical duties (bills, reports, backups, audits).
          </p>
        </div>
        <button
          onClick={() => onOpenQuickCreate('task')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Task</span>
        </button>
      </div>

      {/* Info card */}
      <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-indigo-200">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Autonomous Cycle Renewal:</span> When you complete any recurring task, Chronos automatically calculates the next period and spawns a fresh instance with active reminders intact.
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {recurringTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
            No recurring tasks configured. When creating a task, select recurrence (Daily, Weekly, Monthly).
          </div>
        ) : (
          recurringTasks.map(task => {
            const cat = categories.find(c => c.id === task.categoryId);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 min-w-0">
                    <button
                      onClick={() => completeTask(task.id)}
                      className={`mt-1 transition cursor-pointer ${
                        isCompleted ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'
                      }`}
                      title="Complete & Auto-Renew"
                    >
                      {isCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className={`font-bold text-base ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize flex items-center space-x-1">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>Repeats {task.recurrence?.type}</span>
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-300 mt-1">{task.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2 flex-wrap gap-y-1">
                        <span className="flex items-center space-x-1 font-mono text-cyan-400 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due: {task.dueDate} at {formatTime12Hour(task.dueTime)}</span>
                        </span>

                        {cat && (
                          <span className="flex items-center space-x-1" style={{ color: cat.color }}>
                            <span>●</span>
                            <span>{cat.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {!isCompleted && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                      >
                        Complete & Renew
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
