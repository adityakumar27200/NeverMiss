import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings as SettingsIcon,
  Volume2,
  Bell,
  Clock,
  Download,
  Upload,
  RotateCcw,
  FastForward,
  CheckCircle,
  AlertTriangle,
  Phone,
  User,
  LogOut,
  KeyRound,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { formatTime12Hour, formatHumanDate } from '../../utils/dateUtils';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllData,
    exportDataJSON,
    importDataJSON,
    setTimeOffset,
    effectiveNow,
    currentUser,
    logout,
    resetPasswordWithPhone,
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<string | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPassword.length < 4) {
      setPasswordChangeStatus('Password must be at least 4 characters.');
      return;
    }
    const res = resetPasswordWithPhone(currentUser.countryCode, currentUser.phoneNumber, newPassword);
    if (res.success) {
      setPasswordChangeStatus('Password successfully updated!');
      setNewPassword('');
    } else {
      setPasswordChangeStatus(res.error || 'Failed to update password.');
    }
    setTimeout(() => setPasswordChangeStatus(null), 4000);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nevermiss_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDataJSON(importJsonText);
    if (ok) {
      setImportStatus('Backup successfully imported! State updated.');
      setImportJsonText('');
    } else {
      setImportStatus('Failed to parse JSON. Please check file formatting.');
    }
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-slate-300" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System Settings & Data Control</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure theme, notification schedules, quiet hours, data backup, and the time-travel testing simulator.
          </p>
        </div>
      </div>

      {/* Theme & Appearance Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>Theme & Display Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose your preferred interface theme. Changes apply instantly across the entire application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              (settings.theme || 'dark') === 'dark'
                ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-slate-900 rounded-lg text-indigo-400 border border-slate-700">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Dark Theme</h4>
                  <span className="text-[11px] text-slate-400">Deep slate tones, high contrast</span>
                </div>
              </div>
              {(settings.theme || 'dark') === 'dark' && (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg flex items-center px-3 space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="w-12 h-2 rounded bg-slate-800" />
              <span className="w-8 h-2 rounded bg-slate-800" />
            </div>
          </button>

          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              settings.theme === 'light'
                ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/30">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Light Theme</h4>
                  <span className="text-[11px] text-slate-400">Crisp white & clean daylight palette</span>
                </div>
              </div>
              {settings.theme === 'light' && (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-bold">
                  Active
                </span>
              )}
            </div>
            <div className="w-full h-8 bg-white border border-slate-300 rounded-lg flex items-center px-3 space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="w-12 h-2 rounded bg-slate-200" />
              <span className="w-8 h-2 rounded bg-slate-200" />
            </div>
          </button>
        </div>
      </div>

      {/* User Account & Phone Authentication Section */}
      {currentUser && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: currentUser.avatarColor || '#6366F1' }}
              >
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>{currentUser.fullName}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    AUTHENTICATED
                  </span>
                </h3>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                  <span className="text-cyan-400 font-mono font-medium flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{currentUser.countryCode} {currentUser.phoneNumber}</span>
                  </span>
                  <span>•</span>
                  <span>Member since {currentUser.createdAt.slice(0, 10)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Change Password Sub-form */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Account Password</span>
              </label>
              {passwordChangeStatus && (
                <span className="text-xs font-medium text-cyan-400">{passwordChangeStatus}</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 4 characters)..."
                className="w-full sm:flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time-Travel Testing Simulator */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-indigo-400">
          <FastForward className="w-5 h-5" />
          <h2 className="font-bold text-base text-white">Time-Travel Simulator (QA & Testing Tool)</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Simulate future dates and times to test overdue alerts, routine triggers, and deadline countdowns without waiting for real-world time to elapse.
        </p>

        <div className="flex items-center flex-wrap gap-2 pt-2">
          <span className="text-xs text-slate-400 font-mono">
            Simulated Clock: <span className="text-cyan-400 font-bold">{effectiveNow.toLocaleString()}</span>
          </span>

          <div className="flex items-center space-x-1.5 ml-auto">
            <button
              onClick={() => setTimeOffset(0)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              Reset to Real Time
            </button>
            <button
              onClick={() => setTimeOffset((settings.timeOffsetMinutes || 0) + 60)}
              className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/40 cursor-pointer"
            >
              +1 Hour
            </button>
            <button
              onClick={() => setTimeOffset((settings.timeOffsetMinutes || 0) + 1440)}
              className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/40 cursor-pointer"
            >
              +1 Day
            </button>
            <button
              onClick={() => setTimeOffset((settings.timeOffsetMinutes || 0) + 4320)}
              className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/40 cursor-pointer"
            >
              +3 Days
            </button>
          </div>
        </div>
      </div>

      {/* Routine & Summary Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Daily Digest Schedule</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-xl space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.morningSummaryEnabled}
                  onChange={e => updateSettings({ morningSummaryEnabled: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600"
                />
                <span className="font-semibold text-slate-200">Morning Plan Briefing</span>
              </label>
              <div className="flex items-center space-x-2 text-slate-400 pl-6">
                <span>Trigger Time:</span>
                <input
                  type="time"
                  value={settings.morningSummaryTime}
                  onChange={e => updateSettings({ morningSummaryTime: e.target.value })}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.eveningSummaryEnabled}
                  onChange={e => updateSettings({ eveningSummaryEnabled: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600"
                />
                <span className="font-semibold text-slate-200">Evening Wrap-up Digest</span>
              </label>
              <div className="flex items-center space-x-2 text-slate-400 pl-6">
                <span>Trigger Time:</span>
                <input
                  type="time"
                  value={settings.eveningSummaryTime}
                  onChange={e => updateSettings({ eveningSummaryTime: e.target.value })}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Hours & Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Alert Discipline & Quiet Hours</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Quiet Start (Sleep)</label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={e => updateSettings({ quietHoursStart: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Quiet End (Wake)</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={e => updateSettings({ quietHoursEnd: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableStreakTracking}
                  onChange={e => updateSettings({ enableStreakTracking: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600"
                />
                <span className="text-slate-200 font-medium">
                  Track streaks and show celebrations for daily routines
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center space-x-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Local Persistence, Export & Import</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Backup (JSON)</span>
          </button>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Initial Sample Data</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2">
              <span className="text-xs text-red-200">Reset everything?</span>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Import JSON */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-300">
            Paste JSON Backup to Restore:
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Paste export JSON string here..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
            />
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold self-end transition cursor-pointer"
            >
              Import
            </button>
          </div>
          {importStatus && (
            <p className="text-xs text-cyan-400 font-medium">{importStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};
