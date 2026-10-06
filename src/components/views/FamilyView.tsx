import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Crown,
  UserCheck,
  Shield,
  Phone,
  Lock,
  Heart,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  Search,
  CheckSquare,
  Clock,
  ShoppingCart,
  Flame,
  Key,
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

export const FamilyView: React.FC = () => {
  const {
    currentUser,
    users,
    familyMembers,
    allFamilies,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    updateFamilyName,
    updateUserRole,
    switchUserDemo,
    allTasks,
    allDeadlines,
    allGroceryItems,
    allRoutines,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelationship, setEditRelationship] = useState('Spouse');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState(currentUser?.familyName || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my_family' | 'all_families'>('my_family');

  // Form State for Add Member
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberCountryCode, setMemberCountryCode] = useState('+91');
  const [memberPassword, setMemberPassword] = useState('password123');
  const [memberRelationship, setMemberRelationship] = useState('Spouse');
  const [memberRole, setMemberRole] = useState<UserRole>('user');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const relationshipPresets = [
    'Spouse',
    'Son',
    'Daughter',
    'Parent (Mother)',
    'Parent (Father)',
    'Sibling (Brother)',
    'Sibling (Sister)',
    'Partner',
    'Grandparent',
    'Other Family Member',
  ];

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!memberName.trim()) {
      setFormError('Please enter a full name.');
      return;
    }
    if (!memberPhone.trim()) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    const res = addFamilyMember({
      fullName: memberName.trim(),
      countryCode: memberCountryCode,
      phoneNumber: memberPhone.trim(),
      password: memberPassword.trim() || 'password123',
      relationship: memberRelationship,
      role: memberRole,
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to add family member.');
    } else {
      setFormSuccess(`${memberName} added! They can now log in using ${memberCountryCode} ${memberPhone}.`);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setMemberName('');
        setMemberPhone('');
        setMemberPassword('password123');
        setMemberRelationship('Spouse');
        setMemberRole('user');
        setFormSuccess('');
        setFormError('');
      }, 1200);
    }
  };

  const handleSaveFamilyName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFamilyName.trim()) {
      updateFamilyName(newFamilyName.trim());
      setIsEditingFamilyName(false);
    }
  };

  const filteredFamilyMembers = familyMembers.filter(m =>
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phoneNumber.includes(searchQuery) ||
    (m.relationship && m.relationship.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-900/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/30" />
                <span>Family & Household Workspace</span>
              </span>
              {isAdmin && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Crown className="w-3 h-3 text-purple-400" />
                  <span>Admin Authority</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 flex-wrap">
              {isEditingFamilyName ? (
                <form onSubmit={handleSaveFamilyName} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newFamilyName}
                    onChange={e => setNewFamilyName(e.target.value)}
                    className="bg-slate-800 border border-indigo-500 text-white font-bold text-xl sm:text-2xl rounded-xl px-3 py-1 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingFamilyName(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentUser.familyName || `${currentUser.fullName}'s Family`}
                  </h1>
                  <button
                    onClick={() => {
                      setNewFamilyName(currentUser.familyName || `${currentUser.fullName}'s Family`);
                      setIsEditingFamilyName(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    title="Edit Family Name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Manage family members, create login credentials, and coordinate shared tasks, deadlines, routines, and grocery lists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Family Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Family Isolation Rules & Policy Notice */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-slate-200 flex items-center space-x-1.5">
            <span>Family Assignment Isolation Enforced</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              ACTIVE
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Tasks, deadlines, grocery items, routines, and follow-ups can <strong>only be assigned to members of your family group</strong>. Users outside your family cannot see your household items or assign tasks to your members.
          </p>
        </div>
      </div>

      {/* Admin Family Switcher (if system has multiple families and user is Admin) */}
      {isAdmin && allFamilies.length > 1 && (
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('my_family')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'my_family'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Family ({familyMembers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all_families')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'all_families'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>All System Families ({allFamilies.length})</span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search family members by name, phone, or relation..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{filteredFamilyMembers.length}</span> family member{filteredFamilyMembers.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* My Family Members Grid */}
      {activeTab === 'my_family' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFamilyMembers.map(member => {
            const isSelf = member.id === currentUser.id;
            const assignedTasks = allTasks.filter(t => t.assignedUserId === member.id && t.status !== 'completed').length;
            const assignedDeadlines = allDeadlines.filter(d => d.assignedUserId === member.id && d.status === 'active').length;
            const assignedGroceries = allGroceryItems.filter(g => g.assignedUserId === member.id && !g.completed).length;

            return (
              <div
                key={member.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 transition hover:border-slate-700 shadow-sm relative overflow-hidden ${
                  isSelf ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-slate-800'
                }`}
              >
                {isSelf && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                    You (Active)
                  </div>
                )}

                {/* Top Info */}
                <div className="flex items-start space-x-3.5 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold shadow-md shrink-0"
                    style={{ backgroundColor: member.avatarColor || '#6366F1' }}
                  >
                    {member.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-white text-sm truncate">
                        {member.fullName}
                      </span>
                      {member.role === 'admin' ? (
                        <span className="inline-flex items-center space-x-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                          <Crown className="w-2.5 h-2.5 text-purple-400" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                          <span>User</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 mt-1 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/25 text-[10px] font-medium">
                        {member.relationship || 'Family Member'}
                      </span>
                    </div>

                    <div className="text-[11px] text-indigo-400 font-mono flex items-center space-x-1 mt-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{member.countryCode} {member.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Workload Badges */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-4 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                      <CheckSquare className="w-3 h-3 text-indigo-400" />
                      <span>Tasks</span>
                    </div>
                    <div className="font-bold text-white mt-0.5">{assignedTasks}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Deadlines</span>
                    </div>
                    <div className="font-bold text-white mt-0.5">{assignedDeadlines}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                      <ShoppingCart className="w-3 h-3 text-emerald-400" />
                      <span>Grocery</span>
                    </div>
                    <div className="font-bold text-white mt-0.5">{assignedGroceries}</div>
                  </div>
                </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    {!isSelf ? (
                      <button
                        onClick={() => switchUserDemo(member.id)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        title="Switch active user to test family assignment"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Test as {member.fullName.split(' ')[0]}</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-medium py-1.5">
                        Currently logged in
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setEditName(member.fullName);
                        setEditRelationship(member.relationship || 'Family Member');
                        setEditRole(member.role);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                      title="Edit Member Details & Role"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {!isSelf && (isAdmin || currentUser.role === 'user') && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.fullName} from ${currentUser.familyName || 'your family'}?`)) {
                            removeFamilyMember(member.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Remove from Family"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* All Families Overview (for Admin) */}
      {isAdmin && activeTab === 'all_families' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allFamilies.map(fam => (
            <div
              key={fam.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{fam.name}</h3>
                  <p className="text-xs text-slate-400">Family ID: {fam.id} • {fam.memberCount} members</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {fam.memberCount} Members
                </span>
              </div>

              <div className="space-y-2 divide-y divide-slate-800/60">
                {fam.members.map(m => (
                  <div key={m.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: m.avatarColor || '#6366F1' }}
                      >
                        {m.fullName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-200">{m.fullName}</span>
                      <span className="text-[10px] text-slate-400">({m.relationship || 'Member'})</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-400">
                        {m.role}
                      </span>
                    </div>

                    <button
                      onClick={() => switchUserDemo(m.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
                    >
                      Switch →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Family Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Add New Family Member</h3>
                  <p className="text-xs text-slate-400">Join {currentUser.familyName || 'your family'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  placeholder="e.g. Priya Kumar, Aarav Kumar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number (Used for Login) <span className="text-red-400">*</span>
                </label>
                <div className="flex space-x-2">
                  <select
                    value={memberCountryCode}
                    onChange={e => setMemberCountryCode(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 w-28 shrink-0"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={memberPhone}
                    onChange={e => setMemberPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  This user will be able to log in with this phone number and the password below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={memberPassword}
                    onChange={e => setMemberPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Family Relationship
                  </label>
                  <select
                    value={memberRelationship}
                    onChange={e => setMemberRelationship(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {relationshipPresets.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role Permissions
                  </label>
                  <select
                    value={memberRole}
                    onChange={e => setMemberRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="user">User (Standard Family)</option>
                    {isAdmin && <option value="admin">Admin (Family Head / Admin)</option>}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  Add to Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member & Role Management Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{ backgroundColor: editingMember.avatarColor || '#6366F1' }}
                >
                  {editingMember.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Edit Member Details & Role</h3>
                  <p className="text-xs text-slate-400">{editingMember.countryCode} {editingMember.phoneNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editName.trim()) return;

                updateFamilyMember(editingMember.id, {
                  fullName: editName.trim(),
                  relationship: editRelationship,
                });

                if (isAdmin && editRole !== editingMember.role) {
                  updateUserRole(editingMember.id, editRole);
                }

                setEditingMember(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Family Relationship
                </label>
                <select
                  value={editRelationship}
                  onChange={e => setEditRelationship(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {relationshipPresets.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Role Permissions</span>
                  {!isAdmin && (
                    <span className="text-[10px] text-slate-500">Only Admin can change roles</span>
                  )}
                </label>
                {isAdmin ? (
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="user">User (Standard Family Member)</option>
                    <option value="admin">Admin (Full System & Household Head)</option>
                  </select>
                ) : (
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider text-indigo-300">
                      {editingMember.role}
                    </span>
                    <span className="text-[10px] text-slate-500">🔒 Managed by Admin</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
