import React, { useState } from 'react';
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

  const sortedBlocks = [...plannerBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedCount = sortedBlocks.filter(b => b.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
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

        <div className="flex items-center space-x-3 text-xs bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-slate-300">
          <span>Today&apos;s Progress:</span>
          <span className="font-bold text-cyan-400">
            {completedCount} of {sortedBlocks.length} blocks ({Math.round((completedCount / Math.max(sortedBlocks.length, 1)) * 100)}%)
          </span>
        </div>
      </div>

      {/* Quick Add Block Bar */}
      <form onSubmit={handleAddBlock} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3">
        <input
          type="text"
          required
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New timeblock (e.g. Deep Work: Code Review, Lunch with team)..."
          className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="time"
            value={newStart}
            onChange={e => setNewStart(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
          />
          <span className="text-slate-500 text-xs">to</span>
          <input
            type="time"
            value={newEnd}
            onChange={e => setNewEnd(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
          />

          <select
            value={newType}
            onChange={e => setNewType(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
          >
            <option value="custom">Custom</option>
            <option value="routine">Routine</option>
            <option value="task">Task</option>
            <option value="event">Event</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
          >
            Add Block
          </button>
        </div>
      </form>

      {/* Hourly Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="divide-y divide-slate-800/70">
          {sortedBlocks.map(block => (
            <div
              key={block.id}
              className={`py-3.5 flex items-center justify-between gap-4 transition ${
                block.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <button
                  onClick={() => togglePlannerBlock(block.id)}
                  className={`transition cursor-pointer ${
                    block.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-indigo-400'
                  }`}
                >
                  {block.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>

                <div className="w-28 shrink-0">
                  <span className="font-mono text-cyan-400 text-xs font-semibold block">
                    {formatTime12Hour(block.startTime)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    to {formatTime12Hour(block.endTime)}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className={`text-sm font-semibold ${block.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {block.title}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 capitalize inline-block mt-0.5">
                    {block.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => deletePlannerBlock(block.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                  title="Remove block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
