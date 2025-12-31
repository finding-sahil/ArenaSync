
import React, { useState } from 'react';
import { useData, useTheme } from '../App';
import { THEMES } from '../constants';
import { 
  Building, Tag, MapPin, Instagram, Youtube, MessageSquare, 
  Save, AlertCircle, Info, Trophy, Layout
} from 'lucide-react';
import { Tournament } from '../types';

export default function PdfSettings() {
  const { state, dispatch } = useData();
  const { theme } = useTheme();
  const activeTheme = THEMES[theme];

  const [selectedTournament, setSelectedTournament] = useState(state.tournaments[0]?.id || '');
  const tournament = state.tournaments.find(t => t.id === selectedTournament);

  const handleUpdate = (field: keyof Tournament, value: string) => {
    if (!tournament) return;
    dispatch({
      type: 'UPDATE_TOURNAMENT',
      payload: { ...tournament, [field]: value }
    });
  };

  if (!tournament) {
    return (
      <div className="p-12 text-center opacity-30 font-black uppercase tracking-widest italic">
        No active circuits found for logistics configuration.
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-lg shadow-indigo-500/10"><Layout size={28} /></div>
           <div>
              <h2 className="text-2xl font-oswald font-bold uppercase italic tracking-wider">Logistics & Metadata</h2>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Configure reporting and social parameters</p>
           </div>
        </div>
        <select 
          value={selectedTournament} 
          onChange={e => setSelectedTournament(e.target.value)}
          className={`bg-gray-500/10 border ${activeTheme.border} rounded-2xl px-6 py-3 font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/40 ${activeTheme.text}`}
        >
          {state.tournaments.map(t => <option key={t.id} value={t.id} className="bg-[#0b0f1a]">{t.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
           <div className="space-y-4">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
               <Building size={16} className="text-indigo-500" /> Circuit Branding
             </h3>
             <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase opacity-30 ml-2 tracking-widest">Event Tagline</label>
                 <input 
                   value={tournament.tagline || ''} 
                   onChange={e => handleUpdate('tagline', e.target.value)}
                   className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/40 ${activeTheme.text}`}
                   placeholder="e.g. Battle for Glory"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase opacity-30 ml-2 tracking-widest">Organizer Identity</label>
                 <input 
                   value={tournament.organizer || ''} 
                   onChange={e => handleUpdate('organizer', e.target.value)}
                   className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/40 ${activeTheme.text}`}
                   placeholder="e.g. ArenaSync Pro Ops"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black uppercase opacity-30 ml-2 tracking-widest">Host Venue</label>
                 <input 
                   value={tournament.venue || ''} 
                   onChange={e => handleUpdate('venue', e.target.value)}
                   className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/40 ${activeTheme.text}`}
                   placeholder="e.g. Online / Global"
                 />
               </div>
             </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="space-y-4">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
               <MessageSquare size={16} className="text-indigo-500" /> Communication Hubs
             </h3>
             <div className="grid grid-cols-1 gap-4">
               <div className="relative">
                 <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                 <input 
                   value={tournament.instagram || ''} 
                   onChange={e => handleUpdate('instagram', e.target.value)}
                   className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl py-4 pl-16 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500/40 ${activeTheme.text}`}
                   placeholder="Instagram Handle"
                 />
               </div>
               <div className="relative">
                 <Youtube className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                 <input 
                   value={tournament.youtube || ''} 
                   onChange={e => handleUpdate('youtube', e.target.value)}
                   className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl py-4 pl-16 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/40 ${activeTheme.text}`}
                   placeholder="YouTube Channel"
                 />
               </div>
               <div className="relative">
                 <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                 <input 
                   value={tournament.discord || ''} 
                   onChange={e => handleUpdate('discord', e.target.value)}
                   className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl py-4 pl-16 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/40 ${activeTheme.text}`}
                   placeholder="Discord Invite Link"
                 />
               </div>
             </div>
           </div>

           <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex gap-4">
              <AlertCircle size={24} className="text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 leading-relaxed italic">
                 Information entered here will be utilized for official match reports and PDF exports. Ensure all handles are verified.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
