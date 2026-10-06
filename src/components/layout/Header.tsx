import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  LogOut,
  Phone,
  Crown,
  Heart,
  Briefcase,
  Zap,
  Eye,
  ArrowRightLeft,
} from 'lucide-react';
import { formatTime12Hour } from '../../utils/dateUtils';

interface HeaderProps {
  onOpenQuickCreate: () => void;
  onOpenSearch: () => void;
  onOpenSummary: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToSettings: () => void;
  onNavigateToFamily?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickCreate,
  onOpenSearch,
  onOpenSummary,
  onNavigateToNotifications,
  onNavigateToSettings,
  onNavigateToFamily,
}) => {
  const {
    effectiveNow,
    settings,
    updateSettings,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    currentUser,
    users,
    familyMembers,
    logout,
    switchUserDemo,
  } = useApp();

  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const dateDisplay = effectiveNow.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeDisplay = effectiveNow.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 sm:px-6 py-3 shrink-0 z-30 shadow-sm backdrop-blur-md bg-opacity-95 relative">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Branding & Current Time */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">NeverMiss</span>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Never forget a task, deadline or routine
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-slate-200">{dateDisplay}</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-cyan-400 font-semibold">{timeDisplay}</span>
            {settings.timeOffsetMinutes !== 0 && (
              <button
                onClick={onNavigateToSettings}
                className="ml-1 bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 font-medium hover:bg-amber-500/30"
                title="Simulated Time Active. Click to adjust in Settings."
              >
                Simulated ({settings.timeOffsetMinutes > 0 ? `+${settings.timeOffsetMinutes}m` : `${settings.timeOffsetMinutes}m`})
              </button>
            )}
          </div>
        </div>

        {/* Center: Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex-1 max-w-md hidden md:flex items-center justify-between px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700/70 text-xs transition group cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
            <span>Search tasks, deadlines, routines, contacts...</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-600 font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile search */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Daily Summary Modal Trigger */}
          <button
            onClick={onOpenSummary}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Daily Summary Digest"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Daily Digest</span>
          </button>

          {/* Sound audio toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
              settings.soundEnabled
                ? 'bg-slate-800 text-indigo-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-800 text-slate-500 border-slate-700/50 hover:text-slate-300'
            }`}
            title={settings.soundEnabled ? 'Sound Alerts On' : 'Sound Alerts Muted'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notification Center Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700/70 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/70 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-medium">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications yet. You’re all caught up!
                    </div>
                  ) : (
                    notifications.slice(0, 6).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-xs transition cursor-pointer ${
                          n.read ? 'bg-slate-900/60 opacity-75' : 'bg-slate-800/40 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`font-semibold ${
                              n.priority === 'critical'
                                ? 'text-red-400'
                                : n.priority === 'high'
                                ? 'text-amber-400'
                                : 'text-slate-200'
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatTime12Hour(n.timestamp.slice(11, 16))}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-800/40 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotifPopover(false);
                      onNavigateToNotifications();
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 transition w-full"
                  >
                    View All Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Button */}
          <button
            onClick={onOpenQuickCreate}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>

          {/* User Account & Phone Indicator */}
          {currentUser && (
            <div className="relative pl-1 sm:pl-2 border-l border-slate-800">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 transition cursor-pointer"
                title="Account Profile & Phone"
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                  style={{ backgroundColor: currentUser.avatarColor || '#6366F1' }}
                >
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-[11px] font-semibold text-white leading-tight flex items-center space-x-1.5">
                    <span>{currentUser.fullName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {currentUser.countryCode} {currentUser.phoneNumber}
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/60">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0"
                        style={{ backgroundColor: currentUser.avatarColor || '#6366F1' }}
                      >
                        {currentUser.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate flex items-center space-x-1.5">
                          <span>{currentUser.fullName}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            currentUser.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {currentUser.role}
                          </span>
                        </div>
                        <div className="text-xs text-pink-300 font-medium flex items-center space-x-1 mt-0.5">
                          <Heart className="w-3 h-3 text-pink-400" />
                          <span>{currentUser.familyName || 'Family Member'} ({currentUser.relationship || 'Self'})</span>
                        </div>
                        <div className="text-xs text-indigo-400 font-mono flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{currentUser.countryCode} {currentUser.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Family Workspace Quick Access */}
                  <div className="p-2 border-b border-slate-800 bg-indigo-950/20">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onNavigateToFamily) onNavigateToFamily();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:text-pink-200 transition flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span>Manage Family & Members</span>
                      </div>
                      <span className="text-[10px] bg-pink-500/20 px-2 py-0.5 rounded-full font-mono">
                        {familyMembers.length} members
                      </span>
                    </button>
                  </div>

                  {/* Quick Role & User Demo Switcher inside Menu */}
                  <div className="p-2 border-b border-slate-800 bg-slate-950/30 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
                        <span>{currentUser.role === 'admin' ? 'Switch Active User / Family' : 'Switch Family Member'}</span>
                      </span>
                      <span className="text-[10px] text-pink-400 font-mono lowercase">
                        {currentUser.familyName || 'family'}
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {/* Family members (accessible by all family members) */}
                      {familyMembers.map(u => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              switchUserDemo(u.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                              isCurrent
                                ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <div className="truncate">
                              <span className="font-medium">{u.fullName}</span>
                              <span className="text-[10px] text-pink-300/80 ml-1.5">
                                ({u.relationship || 'Member'})
                              </span>
                            </div>
                            <span className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {u.role}
                            </span>
                          </button>
                        );
                      })}

                      {/* Admin-only: Switch to other families */}
                      {currentUser.role === 'admin' && users.filter(u => u.familyId !== currentUser.familyId).length > 0 && (
                        <div className="pt-2 border-t border-slate-800 mt-2">
                          <div className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            Other Families (Admin View Only)
                          </div>
                          {users.filter(u => u.familyId !== currentUser.familyId).map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                switchUserDemo(u.id);
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-between"
                            >
                              <div className="truncate">
                                <span>{u.fullName}</span>
                                <span className="text-[10px] text-slate-500 ml-1.5">
                                  ({u.familyName || 'Other Family'})
                                </span>
                              </div>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-500">
                                {u.role}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-2 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateToSettings();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center space-x-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
