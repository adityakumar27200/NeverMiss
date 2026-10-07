import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Timer,
  Plus,
  CheckCircle,
  Square,
  CheckSquare,
  Clock,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { formatTime12Hour, formatDateYMD } from '../../utils/dateUtils';
import { PlannerBlock } from '../../types';

export const DailyPlannerView: React.FC = () => {
  const {
    plannerBlocks,
    togglePlannerBlock,
    deletePlannerBlock,
    addPlannerBlock,
    effectiveNow,
  } = useApp();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newType, setNewType] = useState<'task' | 'routine' | 'event' | 'custom'>('custom');

  const todayStr = formatDateYMD(effectiveNow);

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addPlannerBlock({
      title: newTitle.trim(),
      startTime: newStart,
      endTime: newEnd,
      type: newType,
      completed: false,
    });
    setNewTitle('');
  };

  const handleFocusAdd = () => {
    titleInputRef.current?.focus();
    titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const sortedBlocks = [...plannerBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedCount = sortedBlocks.filter(b => b.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with prominent Add Block button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Timer className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Daily Time-Blocked Planner</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured hour-by-hour day schedule from morning wake-up to evening wrap-up.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 text-xs bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-slate-300">
            <span>Progress:</span>
            <span className="font-bold text-cyan-400">
              {completedCount} / {sortedBlocks.length} ({Math.round((completedCount / Math.max(sortedBlocks.length, 1)) * 100)}%)
            </span>
          </div>

          <button
            type="button"
            onClick={handleFocusAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block</span>
          </button>
        </div>
      </div>

      {/* Quick Add Block Bar - Fully Responsive with Guaranteed Visible Add Button */}
      <form
        onSubmit={handleAddBlock}
        className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3.5"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-bold text-xs sm:text-sm text-indigo-400 flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Create New Time Block</span>
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Hour-by-hour schedule</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              Time Block Title *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Deep Work: Code Review, Team Standup, Exercise, Lunch..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                Start Time
              </label>
              <input
                type="time"
                value={newStart}
                onChange={e => setNewStart(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                End Time
              </label>
              <input
                type="time"
                value={newEnd}
                onChange={e => setNewEnd(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                Block Category
              </label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="custom">Custom Block</option>
                <option value="routine">Routine</option>
                <option value="task">Task / Work</option>
                <option value="event">Meeting / Event</option>
              </select>
            </div>
          </div>

          {/* Dedicated, prominent Add Block button row */}
          <div className="pt-1 flex items-center justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Time Block</span>
            </button>
          </div>
        </div>
      </form>

      {/* Hourly Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Scheduled Blocks ({sortedBlocks.length})
          </h3>
          <button
            type="button"
            onClick={handleFocusAdd}
            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/30 transition cursor-pointer flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>
        </div>

        {sortedBlocks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-3">
            <p>No timeblocks created for today. Use the form above to plan your schedule.</p>
            <button
              type="button"
              onClick={handleFocusAdd}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Time Block</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {sortedBlocks.map(block => (
              <div
                key={block.id}
                className={`py-3.5 flex items-center justify-between gap-3 sm:gap-4 transition ${
                  block.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => togglePlannerBlock(block.id)}
                    className={`transition cursor-pointer shrink-0 ${
                      block.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-indigo-400'
                    }`}
                  >
                    {block.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>

                  <div className="w-20 sm:w-28 shrink-0">
                    <span className="font-mono text-cyan-500 dark:text-cyan-400 text-xs font-semibold block">
                      {formatTime12Hour(block.startTime)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      to {formatTime12Hour(block.endTime)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs sm:text-sm font-semibold break-words ${block.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {block.title}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 capitalize inline-block mt-0.5">
                      {block.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => deletePlannerBlock(block.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Remove block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (Always accessible anywhere on the page, never hidden) */}
      <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-40">
        <button
          type="button"
          onClick={handleFocusAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-full shadow-xl shadow-indigo-600/40 border border-indigo-400/30 font-semibold text-xs sm:text-sm cursor-pointer transition hover:shadow-2xl"
          title="Add Time Block"
          aria-label="Add Time Block"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span>Add Block</span>
        </button>
      </div>
    </div>
  );
};
