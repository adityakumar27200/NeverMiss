import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Clock, X, CheckCircle } from 'lucide-react';

export const ActiveAlarmBanner: React.FC = () => {
  const { activeAlarm, dismissActiveAlarm, markDeadlineMet, snoozeTask, snoozeRoutine } = useApp();

  if (!activeAlarm) return null;

  const handleAction = () => {
    if (activeAlarm.type === 'deadline') {
      markDeadlineMet(activeAlarm.id);
    }
    dismissActiveAlarm();
  };

  const handleSnooze = () => {
    if (activeAlarm.type === 'deadline' || activeAlarm.type === 'task') {
      snoozeTask(activeAlarm.id, 15);
    } else {
      snoozeRoutine(activeAlarm.id, 15);
    }
    dismissActiveAlarm();
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 py-3 shadow-lg flex items-center justify-between flex-wrap gap-3 animate-pulse border-b border-red-500 z-50">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white/20 rounded-full">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm sm:text-base flex items-center gap-2">
            <span>{activeAlarm.title}</span>
            <span className="bg-red-950 text-red-200 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              Action Required
            </span>
          </div>
          <p className="text-xs sm:text-sm text-red-100 mt-0.5">{activeAlarm.message}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleAction}
          className="bg-white text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Mark Completed</span>
        </button>
        <button
          onClick={handleSnooze}
          className="bg-red-800/80 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Snooze 15m</span>
        </button>
        <button
          onClick={dismissActiveAlarm}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          title="Dismiss Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
