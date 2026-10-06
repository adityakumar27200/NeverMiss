import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Volume2,
  Bell,
  AlertTriangle,
  ShieldCheck,
  Radio,
  Sliders,
  CheckCircle,
  Play,
  VolumeX,
} from 'lucide-react';
import { playChimeTone, playUrgentTone, playCelebrationTone } from '../../utils/audio';

export const RemindersView: React.FC = () => {
  const { settings, updateSettings, tasks, deadlines, routines, effectiveNow } = useApp();
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleTestAudio = (type: 'chime' | 'urgent' | 'celebration') => {
    if (type === 'chime') {
      playChimeTone();
      setTestStatus('Played Standard Notification Chime 🔔');
    } else if (type === 'urgent') {
      playUrgentTone();
      setTestStatus('Played Critical Urgent Alert Pulse 🚨');
    } else {
      playCelebrationTone();
      setTestStatus('Played Completion Fanfare 🏆');
    }
    setTimeout(() => setTestStatus(null), 3000);
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        updateSettings({ browserNotificationsEnabled: true });
        new Notification('Chronos Reminder Engine', {
          body: 'Browser push notifications successfully connected!',
        });
      } else {
        updateSettings({ browserNotificationsEnabled: false });
      }
    }
  };

  const activeMonitorsCount =
    tasks.filter(t => t.status !== 'completed').length +
    deadlines.filter(d => d.status === 'active').length +
    routines.filter(r => r.active).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/15 rounded-2xl border border-indigo-500/30 text-indigo-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Active Reminder Engine</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                ACTIVE MONITOR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Continuously evaluating {activeMonitorsCount} pending milestones, deadlines, and routines against the timeline clock.
            </p>
          </div>
        </div>
      </div>

      {testStatus && (
        <div className="p-3 bg-indigo-900/50 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 text-center animate-fade-in">
          {testStatus}
        </div>
      )}

      {/* Grid: Engine Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio Synthesizer Test Bench */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Synthesized Audio Engine</h3>
            </div>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                settings.soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Web Audio API generates crisp harmonic tones directly in the browser—guaranteeing zero network lag and no missing audio file errors.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleTestAudio('chime')}
              className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-xs text-slate-200 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span className="font-semibold">Gentle Standard Chime</span>
              </div>
              <span className="text-[10px] text-slate-400">For daily routines & tasks</span>
            </button>

            <button
              onClick={() => handleTestAudio('urgent')}
              className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-red-500/30 text-xs text-red-300 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-red-400 fill-red-400" />
                <span className="font-semibold">Urgent Critical Alarm Pulse</span>
              </div>
              <span className="text-[10px] text-red-400">For hard deadlines & overdue work</span>
            </button>

            <button
              onClick={() => handleTestAudio('celebration')}
              className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="font-semibold">Triumph Celebration Fanfare</span>
              </div>
              <span className="text-[10px] text-emerald-400">For task completions & streaks</span>
            </button>
          </div>
        </div>

        {/* Global Reminder Frequency & Escalation (Section 22 & 23) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Cadence & Escalation Frequency</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Persistent Overdue Re-reminder Interval:
              </label>
              <select
                value={settings.reminderFrequency}
                onChange={e => updateSettings({ reminderFrequency: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="once">Once (Do not repeat notification)</option>
                <option value="15min">Every 15 minutes (High urgency)</option>
                <option value="30min">Every 30 minutes</option>
                <option value="1hour">Every 1 hour</option>
                <option value="1day">Once daily each morning</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quiet Hours Start</label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={e => updateSettings({ quietHoursStart: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quiet Hours End</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={e => updateSettings({ quietHoursEnd: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoOverdueEscalation}
                  onChange={e => updateSettings({ autoOverdueEscalation: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-300 font-medium">
                  Auto-escalate pending tasks to Overdue status the instant due time lapses
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-channel Delivery Overview (Section 24) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center space-x-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span>Notification Channels & Delivery Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>In-App Center & Banners</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Always live. Sticky alarms, top notification drawer, sound effects and visual badges.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <div className="font-semibold text-cyan-400 flex items-center justify-between">
              <span>Web & OS Push</span>
              <button
                onClick={requestBrowserPermission}
                className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-0.5 rounded cursor-pointer"
              >
                {settings.browserNotificationsEnabled ? 'Active' : 'Enable'}
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Desktop and mobile web push alerts even when the browser tab is minimized.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <div className="font-semibold text-amber-400 flex items-center space-x-1.5">
              <span>📱 Native Android Alarms</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              See our dedicated Android App Plan tab for exact AlarmManager and WorkManager implementation!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
