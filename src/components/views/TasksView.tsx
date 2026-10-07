import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Square,
  Clock,
  Plus,
  Filter,
  Search,
  Tag,
  Trash2,
  Calendar,
  AlertCircle,
  Repeat,
  Paperclip,
  MoreVertical,
  Check,
  Edit3,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../../types';
import { formatTime12Hour, formatHumanDate, parseDateTime, getRelativeTimeText, addDays, formatDateYMD } from '../../utils/dateUtils';
import { CustomScheduleModal, ScheduleItemTarget } from '../common/CustomScheduleModal';
import { EditTaskModal } from '../common/EditTaskModal';

interface TasksViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenQuickCreate }) => {
  const {
    tasks,
    categories,
    contacts,
    effectiveNow,
    currentUser,
    users,
    completeTask,
    updateTask,
    deleteTask,
    snoozeTask,
    rescheduleTask,
    canEditItem,
    canDeleteItem,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleItemTarget | null>(null);

  const todayStr = formatDateYMD(effectiveNow);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && task.categoryId !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchTags = task.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LOW</span>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'overdue':
        return <span className="text-red-400 font-semibold text-xs">🔴 Overdue</span>;
      case 'pending':
        return <span className="text-amber-400 font-semibold text-xs">Pending</span>;
      case 'in_progress':
        return <span className="text-cyan-400 font-semibold text-xs">In Progress</span>;
      case 'completed':
        return <span className="text-emerald-400 font-semibold text-xs">Completed</span>;
      case 'postponed':
        return <span className="text-purple-400 font-semibold text-xs">Postponed</span>;
      case 'cancelled':
        return <span className="text-slate-500 font-semibold text-xs">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Tasks Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track individual work items, priorities, recurrence, and execution states.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickCreate('task')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description or tag..."
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 border-t border-slate-800/80 scrollbar-none">
          {(['all', 'pending', 'in_progress', 'overdue', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'all' ? `All (${tasks.length})` : `${tab.replace('_', ' ')} (${tasks.filter(t => t.status === tab).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No tasks match the active filters.
          </div>
        ) : (
          filteredTasks.map(task => {
            const cat = categories.find(c => c.id === task.categoryId);
            const assigned = contacts.find(c => c.id === task.assignedContactId);
            const targetTime = parseDateTime(task.dueDate, task.dueTime);
            const relTime = getRelativeTimeText(targetTime, effectiveNow);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition shadow-sm hover:border-slate-700 ${
                  task.status === 'overdue' ? 'border-red-500/40 bg-red-950/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start space-x-3 min-w-0">
                    <button
                      onClick={() => completeTask(task.id)}
                      className={`mt-1 transition cursor-pointer shrink-0 ${
                        isCompleted ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'
                      }`}
                      title={isCompleted ? 'Completed' : 'Mark Complete'}
                    >
                      {isCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className={`font-semibold text-sm sm:text-base ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                        {task.recurrence && task.recurrence.type !== 'none' && (
                          <span className="flex items-center space-x-1 text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                            <Repeat className="w-3 h-3" />
                            <span className="capitalize">{task.recurrence.type}</span>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                      )}

                      {/* Meta badges */}
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 flex-wrap gap-y-1 pt-1">
                        <span className="flex items-center space-x-1 font-mono text-cyan-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.dueDate} {formatTime12Hour(task.dueTime)}</span>
                          <span className="text-slate-500 font-sans">({relTime.text})</span>
                        </span>

                        {cat && (
                          <span className="flex items-center space-x-1" style={{ color: cat.color }}>
                            <span>●</span>
                            <span>{cat.name}</span>
                          </span>
                        )}

                        {assigned && (
                          <span className="text-purple-300 font-medium">
                            👤 {assigned.name}
                          </span>
                        )}

                        {/* Family Assignee Badge */}
                        {task.assignedUserId && (() => {
                          const assigneeUser = users.find(u => u.id === task.assignedUserId);
                          if (!assigneeUser) return null;
                          const isSelf = assigneeUser.id === currentUser?.id;
                          return (
                            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-medium">
                              <span>👤 {isSelf ? 'Assigned to You' : `Assigned to ${assigneeUser.fullName}`}</span>
                              {assigneeUser.relationship && <span className="text-slate-400">({assigneeUser.relationship})</span>}
                            </span>
                          );
                        })()}

                        {/* Visibility Tag */}
                        {task.isShared ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/25 font-medium">
                            👨‍👩‍👧‍👦 Family
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                            🔒 Personal
                          </span>
                        )}

                        {task.attachments && task.attachments.length > 0 && (
                          <span className="flex items-center space-x-1 text-slate-400">
                            <Paperclip className="w-3 h-3" />
                            <span>{task.attachments.length} files</span>
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center space-x-1.5 pt-1">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0 flex-wrap gap-y-1">
                    {!isCompleted && (
                      <>
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
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/30 transition flex items-center space-x-1 cursor-pointer"
                          title="Custom Date & Time"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Custom Date</span>
                        </button>
                        <button
                          onClick={() => snoozeTask(task.id, 30)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                          title="Snooze 30 minutes"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => rescheduleTask(task.id, addDays(todayStr, 1))}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                          title="Reschedule to Tomorrow"
                        >
                          Tomorrow
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setEditingTask(task)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                      title="Edit task details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
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

      {/* Custom Date & Time Modal */}
      <CustomScheduleModal
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        item={scheduleTarget}
      />

      {/* Full Task Edit Modal */}
      <EditTaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />
    </div>
  );
};
