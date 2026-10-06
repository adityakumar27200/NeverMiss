import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Building,
  Briefcase,
  PhoneCall,
  CheckSquare,
  Trash2,
} from 'lucide-react';
import { Contact } from '../../types';

interface ContactsViewProps {
  onOpenQuickCreate: (tab?: any) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onOpenQuickCreate }) => {
  const { contacts, deleteContact, followUps, tasks } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Contacts & Stakeholders</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Integrated directory linked to client follow-ups and assigned task delegations.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickCreate('contact')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter contacts by name, email or company..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContacts.map(contact => {
          const linkedFollowUps = followUps.filter(f => f.contactId === contact.id || f.contactName.toLowerCase().includes(contact.name.toLowerCase()));
          const assignedTasks = tasks.filter(t => t.assignedContactId === contact.id);

          return (
            <div
              key={contact.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: contact.avatarColor || '#8B5CF6' }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-white truncate">{contact.name}</h3>
                    {contact.role && (
                      <p className="text-xs text-slate-400 truncate">{contact.role}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {contact.company && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>

              {contact.notes && (
                <p className="text-xs text-slate-400 italic bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  &quot;{contact.notes}&quot;
                </p>
              )}

              {/* Linked stats */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <PhoneCall className="w-3 h-3 text-cyan-400" />
                  <span>{linkedFollowUps.length} follow-ups</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckSquare className="w-3 h-3 text-indigo-400" />
                  <span>{assignedTasks.length} tasks</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
