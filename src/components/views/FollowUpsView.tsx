import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PhoneCall,
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  User,
  Trash2,
  ArrowRight,
  Sparkles,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { formatDateYMD, formatHumanDate, addDays } from '../../utils/dateUtils';
import { FollowUp } from '../../types';
import { CustomScheduleModal, ScheduleItemTarget } from '../common/CustomScheduleModal';

interface FollowUpsViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({ onOpenQuickCreate }) => {
  const { followUps, effectiveNow, completeFollowUp, deleteFollowUp, updateFollowUp, users, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [scheduleNextDays, setScheduleNextDays] = useState<number>(3);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleItemTarget | null>(null);

  // In-card editing state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editNextDate, setEditNextDate] = useState('');
  const [editNextTime, setEditNextTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAssignedUserId, setEditAssignedUserId] = useState('');

  const handleStartEdit = (fu: FollowUp) => {
    setEditingCardId(fu.id);
    setEditContactName(fu.contactName);
    setEditSubject(fu.subject);
    setEditNextDate(fu.nextFollowUpDate);
    setEditNextTime(fu.nextFollowUpTime || '10:00');
    setEditNotes(fu.notes || '');
    setEditAssignedUserId(fu.assignedUserId || '');
  };

  const handleSaveEdit = (fuId: string) => {
    if (!editContactName.trim()) return;
    updateFollowUp(fuId, {
      contactName: editContactName.trim(),
      subject: editSubject.trim() || undefined,
      nextFollowUpDate: editNextDate,
      nextFollowUpTime: editNextTime,
      notes: editNotes.trim() || undefined,
      assignedUserId: editAssignedUserId || undefined,
    });
    setEditingCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };

  const todayStr = formatDateYMD(effectiveNow);

  const pendingList = followUps.filter(f => f.status === 'pending');
  const completedList = followUps.filter(f => f.status === 'completed');

  const handleOpenComplete = (fu: FollowUp) => {
    setSelectedFollowUp(fu);
    setScheduleNextDays(3);
    setShowScheduleModal(true);
  };

  const handleConfirmComplete = () => {
    if (!selectedFollowUp) return;
    completeFollowUp(selectedFollowUp.id, scheduleNextDays);
    setShowScheduleModal(false);
    setSelectedFollowUp(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <PhoneCall className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Follow-ups & Client Touchpoints</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Never lose contact momentum with automated follow-up cadence scheduling.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickCreate('followup')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-up</span>
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Active Follow-ups ({pendingList.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Completed History ({completedList.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {(activeTab === 'pending' ? pendingList : completedList).map(fu => {
          const isDueOrPast = fu.nextFollowUpDate <= todayStr;
          const isEditing = editingCardId === fu.id;

          if (isEditing) {
            return (
              <div
                key={fu.id}
                className="bg-slate-900 border-2 border-cyan-500/70 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 transition"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-sm text-cyan-400 flex items-center space-x-1.5">
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Follow-up in Card</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Cancel edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={editContactName}
                        onChange={e => setEditContactName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="Person or organization..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                        Topic / Subject *
                      </label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={e => setEditSubject(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="e.g. Contract review, medical checkup..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                        Next Date
                      </label>
                      <input
                        type="date"
                        value={editNextDate}
                        onChange={e => setEditNextDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                        Next Time
                      </label>
                      <input
                        type="time"
                        value={editNextTime}
                        onChange={e => setEditNextTime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                        Assigned Member
                      </label>
                      <select
                        value={editAssignedUserId}
                        onChange={e => setEditAssignedUserId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
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
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Notes & Context
                    </label>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Follow-up history or notes..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2.5 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(fu.id)}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition shadow-md shadow-cyan-600/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save in Card</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={fu.id}
              className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition hover:border-slate-700 ${
                isDueOrPast && fu.status === 'pending'
                  ? 'border-cyan-500/50 bg-cyan-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="font-bold text-base text-white">{fu.contactName}</span>
                    <span className="text-slate-500 text-sm">—</span>
                    <span className="font-semibold text-cyan-300 text-sm">{fu.subject}</span>
                    {isDueOrPast && fu.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        DUE FOR OUTREACH
                      </span>
                    )}
                  </div>

                  {fu.notes && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-2.5 sm:p-3 rounded-xl border border-slate-700/60 break-words">
                      {fu.notes}
                    </p>
                  )}

                  <div className="flex items-center space-x-3 text-xs text-slate-400 flex-wrap gap-y-1 pt-1">
                    <span>Last Contact: {formatHumanDate(fu.lastContactDate)}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-medium">
                      Next: {formatHumanDate(fu.nextFollowUpDate)} {fu.nextFollowUpTime}
                    </span>
                    {fu.assignedUserId && (() => {
                      const assigneeUser = users.find(u => u.id === fu.assignedUserId);
                      if (!assigneeUser) return null;
                      const isSelf = assigneeUser.id === currentUser?.id;
                      return (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10px] font-medium">
                          👤 {isSelf ? 'Assigned to You' : `Assigned to ${assigneeUser.fullName}`}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 flex items-center justify-between sm:justify-end gap-1.5 flex-wrap shrink-0">
                  <button
                    onClick={() => handleStartEdit(fu)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                    title="Edit follow-up in card"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit</span>
                  </button>

                  {fu.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => setScheduleTarget({
                          id: fu.id,
                          type: 'followup',
                          title: `${fu.contactName} (${fu.subject})`,
                          currentDate: fu.nextFollowUpDate,
                          currentTime: fu.nextFollowUpTime,
                        })}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                        title="Custom Date & Time"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => handleOpenComplete(fu)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20 transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Done & Next</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-400 font-semibold text-xs flex items-center space-x-1 px-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </span>
                  )}

                  <button
                    onClick={() => deleteFollowUp(fu.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                    title="Delete follow-up"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto follow-up scheduling modal (Section 16) */}
      {showScheduleModal && selectedFollowUp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Schedule Next Follow-up Cadence</h3>
            </div>
            <p className="text-xs text-slate-300">
              You contacted <span className="text-white font-semibold">{selectedFollowUp.contactName}</span> about &quot;{selectedFollowUp.subject}&quot;. When should the system remind you next?
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { days: 1, label: 'Tomorrow (+1d)' },
                { days: 3, label: 'In 3 days (+3d)' },
                { days: 7, label: 'In 1 week (+7d)' },
                { days: 14, label: 'In 2 weeks (+14d)' },
                { days: 30, label: 'Next month (+30d)' },
                { days: 0, label: 'No future follow-up' },
              ].map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setScheduleNextDays(opt.days)}
                  className={`p-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                    scheduleNextDays === opt.days
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-cyan-600/25"
              >
                Confirm & Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Schedule Modal */}
      <CustomScheduleModal
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        item={scheduleTarget}
      />
    </div>
  );
};
