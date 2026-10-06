import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Users,
  User,
  Eye,
  Crown,
  Briefcase,
  Zap,
  ChevronDown,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import { UserRole } from '../../types';

export const TeamScopeBar: React.FC = () => {
  const {
    currentUser,
    users,
    teamScope,
    setTeamScope,
    switchUserDemo,
  } = useApp();

  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role || 'member';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isMember = role === 'member';
  const isViewer = role === 'viewer';

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Crown className="w-3 h-3 text-purple-400" />
            <span>ADMIN</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Briefcase className="w-3 h-3 text-blue-400" />
            <span>MANAGER</span>
          </span>
        );
      case 'member':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>MEMBER</span>
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Eye className="w-3 h-3 text-amber-400" />
            <span>VIEWER</span>
          </span>
        );
    }
  };

  return (
    <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Current Active Identity & Role */}
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0"
            style={{ backgroundColor: currentUser.avatarColor || '#6366F1' }}
          >
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-bold text-white text-xs sm:text-sm">
                {currentUser.fullName}
              </span>
              {getRoleBadge(role)}
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                {currentUser.countryCode} {currentUser.phoneNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser.department || 'Personal Workspace'} •{' '}
              {isAdmin && 'Full organization oversight & team management'}
              {isManager && 'Team workload supervision & task delegation'}
              {isMember && 'Personal tasks, routines & assigned team deliverables'}
              {isViewer && 'Read-only access to team schedules & events'}
            </p>
          </div>
        </div>

        {/* Right: Data Scope Filtering (Admins & Managers) or Role Switcher */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Admin/Manager Scope Buttons */}
          {(isAdmin || isManager) && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTeamScope('my')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                  teamScope === 'my'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Show only my work & personal routines"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Work</span>
              </button>

              <button
                type="button"
                onClick={() => setTeamScope('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                  teamScope === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Show all team data across all roles"
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Team</span>
              </button>

              {/* User filter selector */}
              <div className="relative pl-1 border-l border-slate-800 ml-1">
                <select
                  value={teamScope !== 'my' && teamScope !== 'all' ? teamScope : ''}
                  onChange={e => {
                    if (e.target.value) setTeamScope(e.target.value);
                  }}
                  className="bg-transparent text-slate-300 text-[11px] py-1 px-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    Filter by User...
                  </option>
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Quick Role & User Demo Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Quickly test how the app looks for other roles"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Test Roles</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSwitchDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Active Role Profile
                </div>
                {users.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUserDemo(u.id);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition cursor-pointer flex items-center justify-between text-xs ${
                        isCurrent
                          ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                          style={{ backgroundColor: u.avatarColor || '#6366F1' }}
                        >
                          {u.fullName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-white truncate flex items-center space-x-1.5">
                            <span>{u.fullName}</span>
                            {isCurrent && (
                              <span className="text-[9px] text-indigo-400 font-bold">• ACTIVE</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {u.department}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
                        {getRoleBadge(u.role)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View-Only Banner Notification for Viewers */}
      {isViewer && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-xs text-amber-300">
          <Eye className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>View-Only Mode:</strong> You are logged in with the <em>Viewer</em> role. You can explore tasks, events, and calendar schedules, but modifications are restricted.
          </span>
        </div>
      )}
    </div>
  );
};
