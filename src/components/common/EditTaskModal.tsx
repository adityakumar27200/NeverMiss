import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckSquare,
  Clock,
  Calendar,
  Tag,
  Repeat,
  AlertTriangle,
  User,
  Trash2,
} from 'lucide-react';
import { Task, Priority, TaskStatus, ReminderTiming } from '../../types';
import { formatTime12Hour } from '../../utils/dateUtils';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const {
    updateTask,
    deleteTask,
    categories,
    contacts,
    addNotification,
    users,
    familyMembers,
    currentUser,
    canEditItem,
    canDeleteItem,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [assignedContactId, setAssignedContactId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [selectedReminders, setSelectedReminders] = useState<ReminderTiming[]>(['at_due']);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategoryId(task.categoryId);
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime);
      setAssignedContactId(task.assignedContactId || '');
      setAssignedUserId(task.assignedUserId || task.userId || '');
      setIsShared(task.isShared || false);
      setTagsInput(task.tags ? task.tags.join(', ') : '');
      setRecurrenceType((task.recurrence?.type as any) || 'none');
      setSelectedReminders(task.reminderRules || ['at_due']);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const reminderOptions: { id: ReminderTiming; label: string }[] = [
    { id: 'at_due', label: 'At due time' },
    { id: '10m_before', label: '10 mins before' },
    { id: '30m_before', label: '30 mins before' },
    { id: '1h_before', label: '1 hour before' },
    { id: '2h_before', label: '2 hours before' },
    { id: '1d_before', label: '1 day before' },
    { id: '3d_before', label: '3 days before' },
  ];

  const toggleReminder = (rId: ReminderTiming) => {
    setSelectedReminders(prev =>
      prev.includes(rId) ? prev.filter(r => r !== rId) : [...prev, rId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priority,
      status,
      dueDate,
      dueTime,
      assignedUserId: assignedUserId || currentUser?.id,
      isShared,
      assignedContactId: assignedContactId || undefined,
      tags: parsedTags,
      recurrence: recurrenceType !== 'none' ? { type: recurrenceType, interval: 1 } : undefined,
      reminderRules: selectedReminders,
    });

    addNotification({
      title: 'Task Updated',
      message: `"${title}" schedule and details updated.`,
      type: 'task',
      priority: 'normal',
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Edit Task & Custom Schedule</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Due Time
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  required
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-xs text-cyan-400 font-mono font-medium px-2 py-2 bg-slate-800 rounded-lg">
                  {formatTime12Hour(dueTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assign to Family Member 👨‍👩‍👧‍👦
              </label>
              <select
                value={assignedUserId}
                onChange={e => setAssignedUserId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={currentUser?.id || ''}>Myself ({currentUser?.fullName} - {currentUser?.relationship || 'Self'})</option>
                {familyMembers.filter(m => m.id !== currentUser?.id).map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.relationship || m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Visibility Scope</label>
              <select
                value={isShared ? 'shared' : 'private'}
                onChange={e => setIsShared(e.target.value === 'shared')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="shared">👨‍👩‍👧‍👦 Family / Shared</option>
                <option value="private">🔒 Private (Only Assignee & Creator)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Contact</label>
              <select
                value={assignedContactId}
                onChange={e => setAssignedContactId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">None (Personal)</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Recurrence</label>
              <select
                value={recurrenceType}
                onChange={e => setRecurrenceType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. Finance, Urgent, Work"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Reminder Rules */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300">
              Active Reminder Triggers Prior to Due Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {reminderOptions.map(opt => {
                const isChecked = selectedReminders.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleReminder(opt.id)}
                    className={`p-2 rounded-xl text-xs text-left border transition cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                        isChecked ? 'bg-indigo-500 text-white font-bold border-indigo-400' : 'border-slate-600'
                      }`}>
                        {isChecked ? '✓' : ''}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center space-x-1 p-1.5 rounded-lg hover:bg-red-500/10 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
