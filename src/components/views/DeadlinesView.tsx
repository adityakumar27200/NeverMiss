import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  ShieldAlert,
  Bell,
  CheckCircle2,
  User,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { parseDateTime, getRelativeTimeText, formatTime12Hour, formatHumanDate } from '../../utils/dateUtils';
import { CustomScheduleModal, ScheduleItemTarget } from '../common/CustomScheduleModal';
import { Deadline } from '../../types';

interface DeadlinesViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({ onOpenQuickCreate }) => {
  const { deadlines, categories, effectiveNow, markDeadlineMet, deleteDeadline, updateDeadline, users, currentUser } = useApp();
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleItemTarget | null>(null);

  // In-card editing state
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'critical' | 'high'>('critical');
  const [editAssignedUserId, setEditAssignedUserId] = useState('');

  const activeDeadlines = deadlines.filter(d => d.status === 'active');
  const metDeadlines = deadlines.filter(d => d.status === 'met');

  const handleStartEdit = (dl: Deadline) => {
    setEditingDeadlineId(dl.id);
    setEditTitle(dl.title);
    setEditNotes(dl.notes || '');
    setEditPriority(dl.priority);
    setEditAssignedUserId(dl.assignedUserId || '');
  };

  const handleCancelEdit = () => {
    setEditingDeadlineId(null);
  };

  const handleSaveEdit = (dlId: string) => {
    if (!editTitle.trim()) return;
    updateDeadline(dlId, {
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
      priority: editPriority,
      assignedUserId: editAssignedUserId || undefined,
    });
    setEditingDeadlineId(null);
  };

  const triggersList = [
    { id: '7d', label: '7 days before' },
    { id: '3d', label: '3 days before' },
    { id: '1d', label: '1 day before' },
    { id: '12h', label: '12 hours before' },
    { id: '2h', label: '2 hours before' },
    { id: '30m', label: '30 minutes before' },
    { id: 'at_deadline', label: 'At deadline' },
    { id: 'after_deadline', label: 'Post-deadline escalation' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Hard Deadlines & Last-Date Alerts</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Zero-tolerance milestone alerts with automatic progressive notification triggers.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickCreate('deadline')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-600/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Hard Deadline</span>
        </button>
      </div>

      {/* Active Deadlines Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Active Monitored Deadlines ({activeDeadlines.length})</span>
        </h2>

        {activeDeadlines.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400">
            No active critical deadlines at this time. All milestones are under control.
          </div>
        ) : (
          activeDeadlines.map(dl => {
            const cat = categories.find(c => c.id === dl.categoryId);
            const targetTime = parseDateTime(dl.deadlineDate, dl.deadlineTime);
            const rel = getRelativeTimeText(targetTime, effectiveNow);
            const isOverdue = rel.isOverdue;
            const isEditing = editingDeadlineId === dl.id;

            if (isEditing) {
              return (
                <div
                  key={dl.id}
                  className="bg-slate-900 border border-amber-500/70 rounded-2xl p-5 shadow-xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center space-x-1.5 text-sm">
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Deadline Details</span>
                    </span>
                    <button
                      onClick={handleCancelEdit}
                      className="text-slate-400 hover:text-white p-1"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Milestone Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Severity / Priority</label>
                        <select
                          value={editPriority}
                          onChange={e => setEditPriority(e.target.value as 'critical' | 'high')}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="critical">🔴 Critical (Zero tolerance)</option>
                          <option value="high">🟠 High</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Assigned Family Member</label>
                        <select
                          value={editAssignedUserId}
                          onChange={e => setEditAssignedUserId(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.fullName} {u.relationship ? `(${u.relationship})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Execution Notes / Consequences</label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        placeholder="Submission portal link, passport physical location, fee penalties..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(dl.id)}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes in Card</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={dl.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition ${
                  isOverdue
                    ? 'border-red-500/60 bg-gradient-to-r from-red-950/20 to-slate-900'
                    : 'border-amber-500/40 bg-gradient-to-r from-amber-950/10 to-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <h3 className="font-bold text-base sm:text-lg text-white">
                        {dl.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        dl.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {dl.priority}
                      </span>
                      {isOverdue ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                          🚨 OVERDUE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⏱ {rel.text}
                        </span>
                      )}
                    </div>

                    {dl.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{dl.description}</p>
                    )}

                    {dl.notes && (
                      <div className="p-3 bg-slate-800/80 rounded-xl text-xs text-slate-300 border border-slate-700/60">
                        <span className="font-semibold text-amber-400">Notes: </span>
                        {dl.notes}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1 pt-1">
                      <span className="flex items-center space-x-1 font-mono text-cyan-400 font-semibold">
                        <Clock className="w-4 h-4" />
                        <span>Cutoff: {dl.deadlineDate} at {formatTime12Hour(dl.deadlineTime)}</span>
                      </span>

                      {cat && (
                        <span className="flex items-center space-x-1" style={{ color: cat.color }}>
                          <span>●</span>
                          <span>{cat.name}</span>
                        </span>
                      )}

                      {/* Family Assignee Badge */}
                      {dl.assignedUserId && (() => {
                        const assigneeUser = users.find(u => u.id === dl.assignedUserId);
                        if (!assigneeUser) return null;
                        const isSelf = assigneeUser.id === currentUser?.id;
                        return (
                          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[10px] font-medium">
                            <span>👤 {isSelf ? 'Assigned to You' : `Assigned to ${assigneeUser.fullName}`}</span>
                            {assigneeUser.relationship && <span className="text-slate-400">({assigneeUser.relationship})</span>}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Progressive Trigger Badges */}
                    <div className="pt-3">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Active Alert Escalation Rules:
                      </span>
                      <div className="flex items-center flex-wrap gap-1.5">
                        {triggersList.map(trigger => {
                          const isActive = dl.reminderTriggers.includes(trigger.id as any);
                          return (
                            <span
                              key={trigger.id}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium flex items-center space-x-1 ${
                                isActive
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800/40 text-slate-600 border-slate-800'
                              }`}
                            >
                              <Bell className="w-2.5 h-2.5" />
                              <span>{trigger.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 flex items-center justify-between sm:justify-end gap-1.5 flex-wrap shrink-0">
                    <button
                      onClick={() => handleStartEdit(dl)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center space-x-1.5"
                      title="Edit deadline details directly in card"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setScheduleTarget({
                        id: dl.id,
                        type: 'deadline',
                        title: dl.title,
                        currentDate: dl.deadlineDate,
                        currentTime: dl.deadlineTime,
                        currentPriority: dl.priority,
                        currentReminders: dl.reminderTriggers,
                      })}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/40 transition cursor-pointer flex items-center space-x-1.5"
                      title="Adjust deadline cutoff date and time"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Adjust Cutoff</span>
                    </button>
                    <button
                      onClick={() => markDeadlineMet(dl.id)}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold border border-emerald-500/40 shadow-sm transition cursor-pointer flex items-center space-x-1.5"
                      title="Mark deadline as met / delivered"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                      <span>Delivered</span>
                    </button>
                    <button
                      onClick={() => deleteDeadline(dl.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="Delete deadline"
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

      {/* Custom Schedule Modal */}
      <CustomScheduleModal
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        item={scheduleTarget}
      />

      {/* Completed Deadlines */}
      {metDeadlines.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Successfully Delivered Deadlines ({metDeadlines.length})
          </h2>
          <div className="space-y-2">
            {metDeadlines.map(dl => (
              <div
                key={dl.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-400"
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-300">{dl.title}</span>
                  <span className="text-slate-500">— {dl.deadlineDate}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-semibold">
                  Met on time
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
