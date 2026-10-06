import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckSquare,
  CalendarDays,
  AlertTriangle,
  Flame,
  PhoneCall,
  ShoppingCart,
  UserPlus,
} from 'lucide-react';
import { formatDateYMD, formatTimeHM } from '../../utils/dateUtils';
import { Priority, RoutineRepeatType, GroceryCategory } from '../../types';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'task' | 'event' | 'deadline' | 'routine' | 'followup' | 'grocery' | 'contact';
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'task',
}) => {
  const {
    addTask,
    addEvent,
    addDeadline,
    addRoutine,
    addFollowUp,
    addGroceryItem,
    addContact,
    categories,
    contacts,
    effectiveNow,
    currentUser,
    users,
    canCreate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'task' | 'event' | 'deadline' | 'routine' | 'followup' | 'grocery' | 'contact'>(initialTab);

  const todayStr = formatDateYMD(effectiveNow);
  const timeStr = formatTimeHM(effectiveNow);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState(categories[0]?.id || 'cat-work');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(todayStr);
  const [taskDueTime, setTaskDueTime] = useState('17:00');
  const [taskContactId, setTaskContactId] = useState('');
  const [taskTags, setTaskTags] = useState('');
  const [taskRecurrence, setTaskRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [taskAssignedUserId, setTaskAssignedUserId] = useState(currentUser?.id || '');
  const [taskIsShared, setTaskIsShared] = useState(false);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventCategory, setEventCategory] = useState(categories[0]?.id || 'cat-meetings');
  const [eventDate, setEventDate] = useState(todayStr);
  const [eventTime, setEventTime] = useState('15:00');
  const [eventDuration, setEventDuration] = useState(60);
  const [eventLocation, setEventLocation] = useState('');

  // Deadline form state
  const [dlTitle, setDlTitle] = useState('');
  const [dlDesc, setDlDesc] = useState('');
  const [dlCategory, setDlCategory] = useState(categories[0]?.id || 'cat-work');
  const [dlPriority, setDlPriority] = useState<'critical' | 'high'>('critical');
  const [dlDate, setDlDate] = useState(todayStr);
  const [dlTime, setDlTime] = useState('17:00');
  const [dlNotes, setDlNotes] = useState('');

  // Routine form state
  const [rtnName, setRtnName] = useState('');
  const [rtnDesc, setRtnDesc] = useState('');
  const [rtnCategory, setRtnCategory] = useState(categories[0]?.id || 'cat-health');
  const [rtnPriority, setRtnPriority] = useState<Priority>('high');
  const [rtnTime, setRtnTime] = useState('07:00');
  const [rtnDuration, setRtnDuration] = useState(30);
  const [rtnRepeat, setRtnRepeat] = useState<RoutineRepeatType>('daily');
  const [rtnStepsText, setRtnStepsText] = useState('');

  // Follow-up form state
  const [fuContactName, setFuContactName] = useState('');
  const [fuSubject, setFuSubject] = useState('');
  const [fuLastContact, setFuLastContact] = useState(todayStr);
  const [fuNextDate, setFuNextDate] = useState(todayStr);
  const [fuNextTime, setFuNextTime] = useState('11:00');
  const [fuNotes, setFuNotes] = useState('');

  // Grocery form state
  const [grocName, setGrocName] = useState('');
  const [grocQty, setGrocQty] = useState(1);
  const [grocUnit, setGrocUnit] = useState('pcs');
  const [grocCat, setGrocCat] = useState<GroceryCategory>('Vegetables');
  const [grocStore, setGrocStore] = useState('');
  const [grocPrice, setGrocPrice] = useState<number | undefined>(undefined);

  // Contact form state
  const [cntName, setCntName] = useState('');
  const [cntEmail, setCntEmail] = useState('');
  const [cntPhone, setCntPhone] = useState('');
  const [cntCompany, setCntCompany] = useState('');
  const [cntRole, setCntRole] = useState('');
  const [cntNotes, setCntNotes] = useState('');

  if (!isOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !canCreate) return;

    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      categoryId: taskCategory,
      priority: taskPriority,
      status: 'pending',
      dueDate: taskDueDate,
      dueTime: taskDueTime,
      userId: currentUser?.id,
      assignedUserId: taskAssignedUserId || currentUser?.id,
      isShared: taskIsShared,
      assignedContactId: taskContactId || undefined,
      tags: taskTags ? taskTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      attachments: [],
      notes: '',
      recurrence: taskRecurrence !== 'none' ? { type: taskRecurrence, interval: 1 } : undefined,
      reminderRules: ['1d_before', '2h_before', 'at_due'],
    });
    onClose();
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addEvent({
      title: eventTitle.trim(),
      description: eventDesc.trim(),
      categoryId: eventCategory,
      date: eventDate,
      time: eventTime,
      durationMinutes: Number(eventDuration) || 60,
      location: eventLocation.trim() || undefined,
      attendees: [],
      reminders: ['1d_before', '2h_before', '30m_before', '10m_before'],
    });
    onClose();
  };

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlTitle.trim()) return;

    addDeadline({
      title: dlTitle.trim(),
      description: dlDesc.trim(),
      categoryId: dlCategory,
      priority: dlPriority,
      deadlineDate: dlDate,
      deadlineTime: dlTime,
      notes: dlNotes.trim(),
      reminderTriggers: ['7d', '3d', '1d', '12h', '2h', '30m', 'at_deadline', 'after_deadline'],
      status: 'active',
    });
    onClose();
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtnName.trim()) return;

    const steps = rtnStepsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((st, i) => ({ id: `st-${i}`, title: st, done: false }));

    addRoutine({
      name: rtnName.trim(),
      description: rtnDesc.trim(),
      categoryId: rtnCategory,
      priority: rtnPriority,
      time: rtnTime,
      durationMinutes: Number(rtnDuration) || 30,
      repeatType: rtnRepeat,
      active: true,
      reminderRules: ['15m_before', 'at_time'],
      completionRequirement: steps.length > 0 ? 'all_steps' : 'checkbox',
      snoozeRule: '10m',
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      skippedDates: [],
      steps: steps.length > 0 ? steps : undefined,
    });
    onClose();
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuContactName.trim() || !fuSubject.trim()) return;

    addFollowUp({
      contactName: fuContactName.trim(),
      subject: fuSubject.trim(),
      lastContactDate: fuLastContact,
      nextFollowUpDate: fuNextDate,
      nextFollowUpTime: fuNextTime,
      status: 'pending',
      notes: fuNotes.trim(),
    });
    onClose();
  };

  const handleCreateGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grocName.trim()) return;

    addGroceryItem({
      name: grocName.trim(),
      quantity: Number(grocQty) || 1,
      unit: grocUnit.trim() || 'pcs',
      category: grocCat,
      store: grocStore.trim() || undefined,
      price: grocPrice ? Number(grocPrice) : undefined,
      completed: false,
    });
    onClose();
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cntName.trim()) return;

    const colors = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addContact({
      name: cntName.trim(),
      email: cntEmail.trim(),
      phone: cntPhone.trim(),
      company: cntCompany.trim() || undefined,
      role: cntRole.trim() || undefined,
      notes: cntNotes.trim() || undefined,
      avatarColor: randomColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-base">Create New Entry</span>
            <span className="text-xs text-slate-400">Chronos Productivity Suite</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 overflow-x-auto px-4 py-2 gap-1.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'task' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deadline')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'deadline' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Deadline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('routine')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'routine' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Routine</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('event')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'event' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Event</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('followup')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'followup' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Follow-up</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grocery')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'grocery' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Grocery</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'contact' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 max-h-[72vh] overflow-y-auto">
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Send invoice to client, Submit report..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Additional details, scope, or action items..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as Priority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={e => setTaskDueTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned / Related Contact</label>
                  <select
                    value={taskContactId}
                    onChange={e => setTaskContactId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (Personal)</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company || 'Direct'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recurrence</label>
                  <select
                    value={taskRecurrence}
                    onChange={e => setTaskRecurrence(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="none">One-time Task</option>
                    <option value="daily">Repeats Daily</option>
                    <option value="weekly">Repeats Weekly</option>
                    <option value="monthly">Repeats Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Team Member</label>
                  <select
                    value={taskAssignedUserId}
                    onChange={e => setTaskAssignedUserId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={currentUser?.id || ''}>Myself ({currentUser?.fullName})</option>
                    {users.filter(u => u.id !== currentUser?.id).map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.role.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Visibility Scope</label>
                  <select
                    value={taskIsShared ? 'shared' : 'private'}
                    onChange={e => setTaskIsShared(e.target.value === 'shared')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="private">🔒 Private (Only Assignee & Creator)</option>
                    <option value="shared">🌐 Team / Shared (Visible to Workspace)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={taskTags}
                  onChange={e => setTaskTags(e.target.value)}
                  placeholder="e.g. Urgent, Work, Review"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          )}

          {activeTab === 'deadline' && (
            <form onSubmit={handleCreateDeadline} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hard Deadline Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dlTitle}
                  onChange={e => setDlTitle(e.target.value)}
                  placeholder="e.g. AWS payment, Final project submission..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={dlDate}
                    onChange={e => setDlDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline Time</label>
                  <input
                    type="time"
                    required
                    value={dlTime}
                    onChange={e => setDlTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={dlCategory}
                    onChange={e => setDlCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={dlPriority}
                    onChange={e => setDlPriority(e.target.value as 'critical' | 'high')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="critical">🚨 Critical (Hard Cutoff)</option>
                    <option value="high">⚠️ High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes & Requirements</label>
                <textarea
                  rows={2}
                  value={dlNotes}
                  onChange={e => setDlNotes(e.target.value)}
                  placeholder="Crucial instructions, deliverables or consequences..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <span className="font-semibold">Automatic Multi-tier Alert Triggers:</span> Reminders will automatically trigger at 7d, 3d, 1d, 12h, 2h, 30m before deadline and post-deadline escalation.
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-600/25 transition cursor-pointer"
                >
                  Create Deadline
                </button>
              </div>
            </form>
          )}

          {activeTab === 'routine' && (
            <form onSubmit={handleCreateRoutine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Routine Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rtnName}
                  onChange={e => setRtnName(e.target.value)}
                  placeholder="e.g. Morning Exercise, Review Expenses, Read 30 mins..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    required
                    value={rtnTime}
                    onChange={e => setRtnTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={rtnDuration}
                    onChange={e => setRtnDuration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Repeat Type</label>
                  <select
                    value={rtnRepeat}
                    onChange={e => setRtnRepeat(e.target.value as RoutineRepeatType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="interval">Interval (e.g. every 2h)</option>
                    <option value="custom">Custom (e.g. 15 days)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sub-steps / Grouped Activities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={rtnStepsText}
                  onChange={e => setRtnStepsText(e.target.value)}
                  placeholder="Optional grouped routine steps:&#10;Drink 500ml water&#10;Exercise & stretching&#10;Shower&#10;Daily planning"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/25 transition cursor-pointer"
                >
                  Create Routine
                </button>
              </div>
            </form>
          )}

          {activeTab === 'event' && (
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. Client Meeting, Doctor appointment, Conference..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="480"
                    value={eventDuration}
                    onChange={e => setEventDuration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Video Link</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={e => setEventLocation(e.target.value)}
                  placeholder="e.g. Google Meet, Room 402, Dental Care..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 transition cursor-pointer"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          )}

          {activeTab === 'followup' && (
            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fuContactName}
                    onChange={e => setFuContactName(e.target.value)}
                    placeholder="e.g. Rahul Sharma, ABC Client..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject / Discussion Topic <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fuSubject}
                    onChange={e => setFuSubject(e.target.value)}
                    placeholder="e.g. Milestone Payment, Contract Sign..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Contact Date</label>
                  <input
                    type="date"
                    value={fuLastContact}
                    onChange={e => setFuLastContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    required
                    value={fuNextDate}
                    onChange={e => setFuNextDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={fuNextTime}
                    onChange={e => setFuNextTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Context & Notes</label>
                <textarea
                  rows={2}
                  value={fuNotes}
                  onChange={e => setFuNotes(e.target.value)}
                  placeholder="What was agreed? What to ask next?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/25 transition cursor-pointer"
                >
                  Create Follow-up
                </button>
              </div>
            </form>
          )}

          {activeTab === 'grocery' && (
            <form onSubmit={handleCreateGrocery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={grocName}
                  onChange={e => setGrocName(e.target.value)}
                  placeholder="e.g. Milk, Rice, Fresh Spinach, Coffee Beans..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={grocQty}
                    onChange={e => setGrocQty(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={grocUnit}
                    onChange={e => setGrocUnit(e.target.value)}
                    placeholder="pcs, kg, gallons, loaf"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={grocCat}
                    onChange={e => setGrocCat(e.target.value as GroceryCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Household">Household</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Store (optional)</label>
                  <input
                    type="text"
                    value={grocStore}
                    onChange={e => setGrocStore(e.target.value)}
                    placeholder="e.g. Trader Joe's, Costco, Local Bakery"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={grocPrice !== undefined ? grocPrice : ''}
                    onChange={e => setGrocPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 5.99"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/25 transition cursor-pointer"
                >
                  Add to List
                </button>
              </div>
            </form>
          )}

          {activeTab === 'contact' && (
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cntName}
                  onChange={e => setCntName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={cntEmail}
                    onChange={e => setCntEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={cntPhone}
                    onChange={e => setCntPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={cntCompany}
                    onChange={e => setCntCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={cntRole}
                    onChange={e => setCntRole(e.target.value)}
                    placeholder="Lead Architect, Director..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
