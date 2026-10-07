import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  CheckSquare,
  AlertTriangle,
  Flame,
  CalendarDays,
  PhoneCall,
  ShoppingCart,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const {
    tasks,
    events,
    deadlines,
    routines,
    followUps,
    groceryItems,
    contacts,
    completeTask,
    completeRoutineToday,
    toggleGroceryItem,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredTasks = q
    ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)))
    : [];

  const filteredDeadlines = q
    ? deadlines.filter(d => d.title.toLowerCase().includes(q) || d.notes.toLowerCase().includes(q))
    : [];

  const filteredEvents = q
    ? events.filter(e => e.title.toLowerCase().includes(e.title.toLowerCase()) && (e.title.toLowerCase().includes(q) || (e.location && e.location.toLowerCase().includes(q))))
    : [];

  const filteredRoutines = q
    ? routines.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    : [];

  const filteredFollowUps = q
    ? followUps.filter(f => f.contactName.toLowerCase().includes(q) || f.subject.toLowerCase().includes(q) || f.notes.toLowerCase().includes(q))
    : [];

  const filteredGrocery = q
    ? groceryItems.filter(g => g.name.toLowerCase().includes(q) || (g.store && g.store.toLowerCase().includes(q)))
    : [];

  const filteredContacts = q
    ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company && c.company.toLowerCase().includes(q)))
    : [];

  const totalResults =
    filteredTasks.length +
    filteredDeadlines.length +
    filteredEvents.length +
    filteredRoutines.length +
    filteredFollowUps.length +
    filteredGrocery.length +
    filteredContacts.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search bar */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search tasks, deadlines, routines, follow-ups, AWS, contacts..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded border border-slate-300 dark:border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-300 text-sm mb-1">Universal Search</p>
              <p>Type keywords like &quot;AWS&quot;, &quot;Rahul&quot;, &quot;Payment&quot;, &quot;Exercise&quot;, or &quot;Milk&quot; to locate items across all modules.</p>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No matching records found for &quot;<span className="text-slate-900 dark:text-white font-medium">{query}</span>&quot;.
            </div>
          )}

          {/* Tasks matches */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Tasks ({filteredTasks.length})</span>
                <button
                  onClick={() => { onNavigate('tasks'); onClose(); }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center text-[10px] lowercase"
                >
                  open view <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {filteredTasks.map(t => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <span className={`font-semibold text-white ${t.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                          {t.title}
                        </span>
                        <div className="text-[11px] text-slate-400 truncate">
                          Due: {t.dueDate} {t.dueTime} • Priority: {t.priority}
                        </div>
                      </div>
                    </div>
                    {t.status !== 'completed' && (
                      <button
                        onClick={() => completeTask(t.id)}
                        className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold transition"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadlines matches */}
          {filteredDeadlines.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Deadlines ({filteredDeadlines.length})</span>
                <button
                  onClick={() => { onNavigate('deadlines'); onClose(); }}
                  className="text-amber-400 hover:text-amber-300 flex items-center text-[10px] lowercase"
                >
                  open view <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {filteredDeadlines.map(d => (
                  <div
                    key={d.id}
                    className="p-2.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-white">{d.title}</span>
                        <div className="text-[11px] text-amber-300 truncate">
                          Cutoff: {d.deadlineDate} {d.deadlineTime}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-medium">
                      {d.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routines matches */}
          {filteredRoutines.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Routines ({filteredRoutines.length})</span>
                <button
                  onClick={() => { onNavigate('routines'); onClose(); }}
                  className="text-rose-400 hover:text-rose-300 flex items-center text-[10px] lowercase"
                >
                  open view <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {filteredRoutines.map(r => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-white">{r.name}</span>
                        <div className="text-[11px] text-slate-400 truncate">
                          At {r.time} • Streak: 🔥 {r.streak} days
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => completeRoutineToday(r.id)}
                      className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[10px] font-semibold transition"
                    >
                      Done Today
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-ups matches */}
          {filteredFollowUps.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Follow-ups ({filteredFollowUps.length})</span>
                <button
                  onClick={() => { onNavigate('followups'); onClose(); }}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center text-[10px] lowercase"
                >
                  open view <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {filteredFollowUps.map(f => (
                  <div
                    key={f.id}
                    className="p-2.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-white">{f.contactName} - {f.subject}</span>
                        <div className="text-[11px] text-slate-400 truncate">
                          Scheduled: {f.nextFollowUpDate} {f.nextFollowUpTime}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grocery matches */}
          {filteredGrocery.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Grocery ({filteredGrocery.length})</span>
                <button
                  onClick={() => { onNavigate('grocery'); onClose(); }}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center text-[10px] lowercase"
                >
                  open view <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {filteredGrocery.map(g => (
                  <div
                    key={g.id}
                    onClick={() => toggleGroceryItem(g.id)}
                    className="p-2.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <ShoppingCart className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className={`font-semibold text-white ${g.completed ? 'line-through text-slate-400' : ''}`}>
                        {g.name} ({g.quantity} {g.unit})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{g.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts matches */}
          {filteredContacts.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Contacts ({filteredContacts.length})</span>
                <button
                  onClick={() => { onNavigate('contacts'); onClose(); }}
                  className="text-purple-400 hover:text-purple-300 flex items-center text-[10px] lowercase"
                >
                  open view <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {filteredContacts.map(c => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Users className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-white">{c.name}</span>
                        <div className="text-[11px] text-slate-400 truncate">
                          {c.company ? `${c.company} • ` : ''}{c.email || c.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
