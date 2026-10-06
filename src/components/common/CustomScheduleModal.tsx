import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  Bell,
  Sparkles,
  Repeat,
  AlertTriangle,
} from 'lucide-react';
import { formatDateYMD, formatTimeHM, formatTime12Hour, addDays } from '../../utils/dateUtils';
import { Priority, ReminderTiming } from '../../types';

export interface ScheduleItemTarget {
  id: string;
  type: 'task' | 'deadline' | 'event' | 'routine' | 'followup';
  title: string;
  currentDate?: string; // YYYY-MM-DD
  currentTime?: string; // HH:mm
  currentPriority?: Priority | 'critical' | 'high';
  currentReminders?: string[];
}

interface CustomScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ScheduleItemTarget | null;
}

export const CustomScheduleModal: React.FC<CustomScheduleModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const {
    updateTask,
    updateDeadline,
    updateEvent,
    updateRoutine,
    updateFollowUp,
    effectiveNow,
    addNotification,
  } = useApp();

  const todayStr = formatDateYMD(effectiveNow);
  const currentTimeStr = formatTimeHM(effectiveNow);

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('17:00');
  const [selectedReminders, setSelectedReminders] = useState<ReminderTiming[]>(['1h_before', 'at_due']);
  const [customNotes, setCustomNotes] = useState('');

  useEffect(() => {
    if (item) {
      setDate(item.currentDate || todayStr);
      setTime(item.currentTime || (item.type === 'routine' ? '07:00' : '17:00'));
      if (item.currentReminders) {
        setSelectedReminders(item.currentReminders as ReminderTiming[]);
      }
    }
  }, [item, todayStr]);

  if (!isOpen || !item) return null;

  // Preset Date Options
  const datePresets = [
    { label: 'Today', getValue: () => todayStr },
    { label: 'Tomorrow', getValue: () => addDays(todayStr, 1) },
    { label: 'In 2 Days', getValue: () => addDays(todayStr, 2) },
    { label: 'In 3 Days', getValue: () => addDays(todayStr, 3) },
    { label: 'In 1 Week', getValue: () => addDays(todayStr, 7) },
    { label: 'In 2 Weeks', getValue: () => addDays(todayStr, 14) },
    { label: 'Next Month', getValue: () => addDays(todayStr, 30) },
  ];

  // Preset Time Options
  const timePresets = [
    { label: '09:00 AM (Morning)', value: '09:00' },
    { label: '12:00 PM (Noon)', value: '12:00' },
    { label: '02:30 PM (Afternoon)', value: '14:30' },
    { label: '05:00 PM (EOD)', value: '17:00' },
    { label: '08:00 PM (Evening)', value: '20:00' },
    { label: '11:59 PM (Midnight)', value: '23:59' },
  ];

  const reminderOptions: { id: ReminderTiming; label: string }[] = [
    { id: 'at_due', label: 'At scheduled time' },
    { id: '10m_before', label: '10 minutes before' },
    { id: '30m_before', label: '30 minutes before' },
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (item.type === 'task') {
      updateTask(item.id, {
        dueDate: date,
        dueTime: time,
        status: 'pending', // reset from overdue if moved to future
        reminderRules: selectedReminders,
      });
      addNotification({
        title: 'Task Rescheduled',
        message: `"${item.title}" rescheduled to ${date} at ${formatTime12Hour(time)}.`,
        type: 'task',
        priority: 'normal',
      });
    } else if (item.type === 'deadline') {
      updateDeadline(item.id, {
        deadlineDate: date,
        deadlineTime: time,
        status: 'active',
      });
      addNotification({
        title: 'Hard Deadline Updated',
        message: `Cutoff for "${item.title}" adjusted to ${date} ${formatTime12Hour(time)}.`,
        type: 'deadline',
        priority: 'high',
      });
    } else if (item.type === 'event') {
      updateEvent(item.id, {
        date,
        time,
      });
      addNotification({
        title: 'Event Rescheduled',
        message: `"${item.title}" moved to ${date} at ${formatTime12Hour(time)}.`,
        type: 'event',
        priority: 'normal',
      });
    } else if (item.type === 'routine') {
      updateRoutine(item.id, {
        time,
      });
      addNotification({
        title: 'Routine Schedule Updated',
        message: `"${item.title}" scheduled time updated to ${formatTime12Hour(time)}.`,
        type: 'routine',
        priority: 'normal',
      });
    } else if (item.type === 'followup') {
      updateFollowUp(item.id, {
        nextFollowUpDate: date,
        nextFollowUpTime: time,
        status: 'pending',
      });
      addNotification({
        title: 'Follow-up Cadence Updated',
        message: `Follow-up with "${item.title}" set to ${date} at ${formatTime12Hour(time)}.`,
        type: 'followup',
        priority: 'normal',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Custom Date & Time Scheduler</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                Target: <span className="text-slate-200 font-medium">{item.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Target Date Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Choose Target Date
            </label>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {datePresets.map(preset => {
                const val = preset.getValue();
                const isSelected = date === val;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDate(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Exact Date Picker Input */}
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Target Time Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Choose Target Time
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {timePresets.map(preset => {
                const isSelected = time === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setTime(preset.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Exact Time Picker Input */}
            <div className="flex items-center space-x-2">
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
              <span className="text-xs text-cyan-400 font-mono font-semibold px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
                {formatTime12Hour(time)}
              </span>
            </div>
          </div>

          {/* Reminder Alert Triggers (for tasks, deadlines, events) */}
          {item.type !== 'routine' && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Notification Alerts Prior to Due Time</span>
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
                          ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                          : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isChecked ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'border-slate-600'
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
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Scheduled for: <span className="text-white font-semibold">{date} at {formatTime12Hour(time)}</span>
            </span>

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
                Apply Custom Date & Time
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
