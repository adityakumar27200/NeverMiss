import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Flame,
  PhoneCall,
  CheckSquare,
  CalendarDays,
} from 'lucide-react';
import { formatDateYMD, formatTime12Hour, formatHumanDate, addDays } from '../../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { tasks, events, deadlines, routines, followUps, effectiveNow } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(effectiveNow));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [selectedDayYMD, setSelectedDayYMD] = useState<string>(() => formatDateYMD(effectiveNow));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
      setSelectedDayYMD(formatDateYMD(d));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
      setSelectedDayYMD(formatDateYMD(d));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(effectiveNow));
    setSelectedDayYMD(formatDateYMD(effectiveNow));
  };

  // Build items for a specific date
  const getItemsForDate = (dateYMD: string) => {
    const tList = tasks.filter(t => t.dueDate === dateYMD);
    const eList = events.filter(e => e.date === dateYMD);
    const dList = deadlines.filter(d => d.deadlineDate === dateYMD);
    const fList = followUps.filter(f => f.nextFollowUpDate === dateYMD);
    const rList = routines.filter(r => r.active && r.repeatType === 'daily'); // shows daily routines

    return { tList, eList, dList, fList, rList };
  };

  // Month grid calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Padding from prev month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const dObj = new Date(year, month - 1, dayNum);
    calendarCells.push({ date: dObj, isCurrentMonth: false, ymd: formatDateYMD(dObj) });
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dObj = new Date(year, month, i);
    calendarCells.push({ date: dObj, isCurrentMonth: true, ymd: formatDateYMD(dObj) });
  }

  // Padding to complete grid
  const remaining = 35 - calendarCells.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      const dObj = new Date(year, month + 1, i);
      calendarCells.push({ date: dObj, isCurrentMonth: false, ymd: formatDateYMD(dObj) });
    }
  }

  const selectedDayItems = getItemsForDate(selectedDayYMD);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/15 rounded-2xl border border-indigo-500/30 text-indigo-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Synchronized visual overview of tasks, meetings, deadlines & follow-ups.
            </p>
          </div>
        </div>

        {/* View Switcher & Navigation */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60 text-xs">
            {(['month', 'agenda', 'day'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition cursor-pointer ${
                  viewMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-4 text-xs px-2 text-slate-300">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Task</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Event / Meeting</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Deadline</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Routine</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span>Follow-up</span>
        </span>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-2 border-b border-slate-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 pt-2">
              {calendarCells.map(cell => {
                const isSelected = cell.ymd === selectedDayYMD;
                const isToday = cell.ymd === formatDateYMD(effectiveNow);
                const items = getItemsForDate(cell.ymd);
                const hasDeadlines = items.dList.length > 0;
                const hasEvents = items.eList.length > 0;
                const hasTasks = items.tList.length > 0;

                return (
                  <div
                    key={cell.ymd}
                    onClick={() => setSelectedDayYMD(cell.ymd)}
                    className={`min-h-[75px] sm:min-h-[90px] p-1.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : isToday
                        ? 'border-cyan-500/50 bg-slate-800/80'
                        : cell.isCurrentMonth
                        ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/40'
                        : 'border-slate-800/40 bg-slate-950/40 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-xs ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                        {cell.date.getDate()}
                      </span>
                      {hasDeadlines && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" title="Has Deadline" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden mt-1">
                      {items.dList.slice(0, 1).map(d => (
                        <div key={d.id} className="text-[10px] truncate bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-medium">
                          ⚠️ {d.title}
                        </div>
                      ))}
                      {items.eList.slice(0, 1).map(e => (
                        <div key={e.id} className="text-[10px] truncate bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded font-medium">
                          📅 {e.title}
                        </div>
                      ))}
                      {items.tList.slice(0, 1).map(t => (
                        <div key={t.id} className="text-[10px] truncate bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded">
                          ✓ {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block">
                Selected Day Schedule
              </span>
              <h3 className="font-bold text-lg text-white mt-0.5">
                {formatHumanDate(selectedDayYMD)}
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDayItems.dList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Deadlines ({selectedDayItems.dList.length})</span>
                  </span>
                  {selectedDayItems.dList.map(d => (
                    <div key={d.id} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs">
                      <div className="font-semibold text-amber-200">{d.title}</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">At {formatTime12Hour(d.deadlineTime)}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayItems.eList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Events & Meetings ({selectedDayItems.eList.length})</span>
                  </span>
                  {selectedDayItems.eList.map(e => (
                    <div key={e.id} className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs">
                      <div className="font-semibold text-blue-200">{e.title}</div>
                      <div className="text-[10px] text-blue-400 mt-0.5">{formatTime12Hour(e.time)} ({e.durationMinutes} mins)</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayItems.tList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Tasks ({selectedDayItems.tList.length})</span>
                  </span>
                  {selectedDayItems.tList.map(t => (
                    <div key={t.id} className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs">
                      <div className="font-semibold text-indigo-200">{t.title}</div>
                      <div className="text-[10px] text-indigo-400 mt-0.5">Due: {formatTime12Hour(t.dueTime)} • {t.priority}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayItems.fList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Follow-ups ({selectedDayItems.fList.length})</span>
                  </span>
                  {selectedDayItems.fList.map(f => (
                    <div key={f.id} className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs">
                      <div className="font-semibold text-cyan-200">{f.contactName} - {f.subject}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayItems.dList.length === 0 &&
                selectedDayItems.eList.length === 0 &&
                selectedDayItems.tList.length === 0 &&
                selectedDayItems.fList.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Nothing scheduled on this day.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-white">Upcoming Chronological Agenda</h3>
          <div className="divide-y divide-slate-800/80 space-y-2">
            {[0, 1, 2, 3, 4, 5, 6].map(daysAhead => {
              const dObj = new Date(effectiveNow);
              dObj.setDate(dObj.getDate() + daysAhead);
              const ymd = formatDateYMD(dObj);
              const items = getItemsForDate(ymd);

              const allItemsCount =
                items.dList.length + items.eList.length + items.tList.length + items.fList.length;

              return (
                <div key={ymd} className="py-3 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-32 shrink-0">
                    <span className="font-bold text-sm text-white block">
                      {dObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {daysAhead === 0 ? 'Today' : daysAhead === 1 ? 'Tomorrow' : `In ${daysAhead} days`}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    {allItemsCount === 0 ? (
                      <span className="text-xs text-slate-500 italic">No scheduled activities</span>
                    ) : (
                      <>
                        {items.dList.map(d => (
                          <div key={d.id} className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs flex items-center justify-between">
                            <span className="font-semibold text-amber-200">⚠️ {d.title}</span>
                            <span className="font-mono text-[10px] text-amber-400">{formatTime12Hour(d.deadlineTime)}</span>
                          </div>
                        ))}
                        {items.eList.map(e => (
                          <div key={e.id} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs flex items-center justify-between">
                            <span className="font-semibold text-blue-200">📅 {e.title}</span>
                            <span className="font-mono text-[10px] text-blue-400">{formatTime12Hour(e.time)}</span>
                          </div>
                        ))}
                        {items.tList.map(t => (
                          <div key={t.id} className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs flex items-center justify-between">
                            <span className="font-semibold text-indigo-200">✓ {t.title}</span>
                            <span className="font-mono text-[10px] text-indigo-400">{formatTime12Hour(t.dueTime)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-white">
            Daily Detail: {formatHumanDate(selectedDayYMD)}
          </h3>
          <div className="space-y-2">
            {selectedDayItems.dList.map(d => (
              <div key={d.id} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
                <span className="font-bold text-amber-200">⚠️ Hard Deadline: {d.title}</span>
                <p className="text-slate-300 mt-1">{d.notes}</p>
              </div>
            ))}
            {selectedDayItems.eList.map(e => (
              <div key={e.id} className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs">
                <span className="font-bold text-blue-200">📅 Event: {e.title}</span>
                <p className="text-slate-300 mt-1">{e.description} • Location: {e.location || 'Online'}</p>
              </div>
            ))}
            {selectedDayItems.tList.map(t => (
              <div key={t.id} className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs">
                <span className="font-bold text-indigo-200">✓ Task: {t.title}</span>
                <p className="text-slate-300 mt-1">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
