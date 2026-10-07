import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  User,
  Crown,
  Heart,
  ChevronDown,
  ArrowRightLeft,
  UserPlus,
  Filter,
} from 'lucide-react';
import { UserRole } from '../../types';

interface TeamScopeBarProps {
  onOpenFamilyModal?: () => void;
}

export const TeamScopeBar: React.FC<TeamScopeBarProps> = ({ onOpenFamilyModal }) => {
  const {
    currentUser,
    users,
    familyMembers,
    teamScope,
    setTeamScope,
    switchUserDemo,
  } = useApp();

  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="mb-3 sm:mb-6 bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Current Active Identity & Family */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md shrink-0 ring-2 ring-indigo-500/30"
            style={{ backgroundColor: currentUser.avatarColor || '#6366F1' }}
          >
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-0.5">
              <span className="font-bold text-white text-xs sm:text-sm truncate">
                {currentUser.fullName}
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Crown className="w-2.5 h-2.5 text-purple-400" />
                  <span>ADMIN</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <span>USER</span>
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/25 font-medium">
                {currentUser.relationship || 'Family Member'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5 hidden sm:block">
              👨‍👩‍👧‍👦 {currentUser.familyName || `${currentUser.fullName}'s Family`} ({familyMembers.length} members) •{' '}
              {isAdmin ? 'System administrator & family head' : 'Family member account'}
            </p>
          </div>
        </div>

        {/* Right: Data Scope Filtering (My Items vs Family Items vs Member Filter) */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-0.5">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setTeamScope('my')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                teamScope === 'my'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show only my work & personal items"
            >
              <User className="w-3.5 h-3.5" />
              <span>My Items</span>
            </button>

            <button
              type="button"
              onClick={() => setTeamScope('family')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                teamScope === 'family' || teamScope === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show all family items & shared lists"
            >
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>Family ({familyMembers.length})</span>
            </button>
          </div>

          {/* Quick Switch Family User Profile */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-medium transition cursor-pointer"
              title="Switch user to test family collaboration"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Switch User</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showSwitchDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Switch Family Profile</span>
                  <span className="text-indigo-400 font-normal">1-Click Test</span>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40">
                  {familyMembers.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        switchUserDemo(m.id);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                        m.id === currentUser.id
                          ? 'bg-indigo-600/20 text-indigo-200 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: m.avatarColor || '#6366F1' }}
                        >
                          {m.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">{m.fullName}</div>
                          <div className="text-[10px] text-slate-400">{m.relationship || m.role}</div>
                        </div>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-400">
                        {m.role}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Other Families for Admin */}
                {isAdmin && users.filter(u => u.familyId !== currentUser.familyId).length > 0 && (
                  <div className="pt-1 border-t border-slate-800">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase">
                      Other Families (Admin View)
                    </div>
                    {users.filter(u => u.familyId !== currentUser.familyId).map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUserDemo(u.id);
                          setShowSwitchDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-between"
                      >
                        <span>{u.fullName} ({u.familyName || 'Other Family'})</span>
                        <span className="text-[9px] font-mono text-slate-500">{u.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
