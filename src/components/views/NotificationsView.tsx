import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatTime12Hour, formatHumanDate } from '../../utils/dateUtils';
import { NotificationItem } from '../../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    deleteNotification,
  } = useApp();

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
    if (filterRead === 'unread' && n.read) return false;
    if (filterRead === 'read' && !n.read) return false;
    return true;
  });

  const getPriorityIcon = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'normal':
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'low':
        return <Clock className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notification Center</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical log of all alerts, deadline triggers, routine nudges, and system notices.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear log</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <select
          value={filterRead}
          onChange={e => setFilterRead(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
        >
          <option value="all">All Read Statuses</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>

        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="normal">🔵 Normal</option>
          <option value="low">⚪ Low</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filteredNotifs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
            No notifications matching the selected filter.
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                n.read
                  ? 'bg-slate-900/50 border-slate-800/80 opacity-75'
                  : 'bg-slate-900 border-indigo-500/30 hover:border-indigo-500/50 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className="mt-0.5">{getPriorityIcon(n.priority)}</div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="font-bold text-sm text-white">{n.title}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {n.type}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>

                  <div className="text-[11px] text-slate-400 pt-1">
                    {formatHumanDate(n.timestamp.slice(0, 10))} at {formatTime12Hour(n.timestamp.slice(11, 16))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
