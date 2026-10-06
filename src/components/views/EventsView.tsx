import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Users,
  Bell,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';
import { formatTime12Hour, formatHumanDate, parseDateTime } from '../../utils/dateUtils';
import { CustomScheduleModal, ScheduleItemTarget } from '../common/CustomScheduleModal';

interface EventsViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onOpenQuickCreate }) => {
  const { events, categories, deleteEvent, effectiveNow, users, currentUser } = useApp();
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleItemTarget | null>(null);

  const sortedEvents = [...events].sort((a, b) => {
    return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Events & Appointments</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Time-bound meetings, interviews, healthcare appointments, and conferences.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickCreate('event')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
            No events scheduled. Click &quot;Schedule Event&quot; to plan a meeting or appointment.
          </div>
        ) : (
          sortedEvents.map(evt => {
            const cat = categories.find(c => c.id === evt.categoryId);
            const evtDateTime = parseDateTime(evt.date, evt.time);
            const isPast = effectiveNow.getTime() > evtDateTime.getTime();

            return (
              <div
                key={evt.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-sm transition hover:border-slate-700 ${
                  isPast ? 'border-slate-800/80 opacity-70' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <h3 className="font-bold text-base sm:text-lg text-white">
                        {evt.title}
                      </h3>
                      {isPast ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                          Past Event
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {evt.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1 pt-1">
                      <span className="flex items-center space-x-1 font-mono text-cyan-400 font-semibold">
                        <Calendar className="w-4 h-4" />
                        <span>{formatHumanDate(evt.date)} at {formatTime12Hour(evt.time)}</span>
                      </span>

                      <span className="flex items-center space-x-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.durationMinutes} minutes</span>
                      </span>

                      {evt.location && (
                        <span className="flex items-center space-x-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{evt.location}</span>
                        </span>
                      )}

                      {cat && (
                        <span className="flex items-center space-x-1" style={{ color: cat.color }}>
                          <span>●</span>
                          <span>{cat.name}</span>
                        </span>
                      )}

                      {/* Family Assignee Badge */}
                      {evt.assignedUserId && (() => {
                        const assigneeUser = users.find(u => u.id === evt.assignedUserId);
                        if (!assigneeUser) return null;
                        const isSelf = assigneeUser.id === currentUser?.id;
                        return (
                          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 text-[10px] font-medium">
                            <span>👤 {isSelf ? 'Assigned to You' : `Assigned to ${assigneeUser.fullName}`}</span>
                            {assigneeUser.relationship && <span className="text-slate-400">({assigneeUser.relationship})</span>}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Reminders configured */}
                    <div className="flex items-center space-x-1.5 pt-2">
                      <span className="text-[10px] text-slate-500 font-medium">Reminders:</span>
                      {evt.reminders.map(rem => (
                        <span key={rem} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 flex items-center space-x-1">
                          <Bell className="w-2.5 h-2.5 text-blue-400" />
                          <span>{rem.replace('_', ' ')}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setScheduleTarget({
                        id: evt.id,
                        type: 'event',
                        title: evt.title,
                        currentDate: evt.date,
                        currentTime: evt.time,
                        currentReminders: evt.reminders,
                      })}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                      title="Custom Date & Time"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => deleteEvent(evt.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete event"
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
    </div>
  );
};
