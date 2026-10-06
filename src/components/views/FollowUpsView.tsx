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
} from 'lucide-react';
import { formatDateYMD, formatHumanDate, addDays } from '../../utils/dateUtils';
import { FollowUp } from '../../types';
import { CustomScheduleModal, ScheduleItemTarget } from '../common/CustomScheduleModal';

interface FollowUpsViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({ onOpenQuickCreate }) => {
  const { followUps, effectiveNow, completeFollowUp, deleteFollowUp, users, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [scheduleNextDays, setScheduleNextDays] = useState<number>(3);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleItemTarget | null>(null);

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

          return (
            <div
              key={fu.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-sm transition hover:border-slate-700 ${
                isDueOrPast && fu.status === 'pending'
                  ? 'border-cyan-500/50 bg-cyan-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
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
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      {fu.notes}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1">
                    <span>Last Contact: {formatHumanDate(fu.lastContactDate)}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-medium">
                      Next Follow-up: {formatHumanDate(fu.nextFollowUpDate)} {fu.nextFollowUpTime}
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

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1">
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
                        <span>Complete & Next</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-400 font-semibold text-xs flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </span>
                  )}

                  <button
                    onClick={() => deleteFollowUp(fu.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
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
