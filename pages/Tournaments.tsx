
import React, { useState } from 'react';
import { useData, useTheme, useAuth } from '../App';
import { THEMES } from '../constants';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit2, Trash2, Calendar, Users, Target, X } from 'lucide-react';
import { Tournament, TournamentType, Role } from '../types';
import { Link } from 'react-router-dom';

export default function Tournaments() {
  const { state, dispatch } = useData();
  const { theme } = useTheme();
  const { user } = useAuth();
  const activeTheme = THEMES[theme];

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTourney, setNewTourney] = useState<Partial<Tournament>>({
    name: '',
    type: TournamentType.SQUAD,
    startDate: '',
    endDate: '',
    teamIds: [],
    scoringSystem: 'STANDARD_GARENA',
    status: 'UPCOMING'
  });

  const filteredTournaments = state.tournaments.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourney.name) return;
    const t: Tournament = {
      ...newTourney as Tournament,
      id: Math.random().toString(36).substr(2, 9),
      announcements: []
    };
    dispatch({ type: 'ADD_TOURNAMENT', payload: t });
    setShowAddModal(false);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      UPCOMING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      ONGOING: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      FINISHED: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${(colors as any)[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-oswald font-bold tracking-tighter uppercase italic">CIRCUITS</h1>
          <p className={`${activeTheme.textMuted} text-[10px] font-black uppercase tracking-[0.4em] mt-1`}>MANAGE PRO-LEVEL AND COMMUNITY COMPETITIONS</p>
        </div>
        {user?.role !== Role.PLAYER && (
          <button 
            onClick={() => setShowAddModal(true)}
            className={`${activeTheme.primary} text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all`}
          >
            <Plus size={20} /> INITIALIZE CIRCUIT
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={20} />
          <input 
            type="text" 
            placeholder="SEARCH COMPETITIVE CIRCUITS..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-500/5 border ${activeTheme.border} outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-black text-[10px] tracking-widest placeholder:opacity-20`}
          />
        </div>
        <button className={`p-5 rounded-2xl border ${activeTheme.border} bg-gray-500/5 hover:bg-gray-500/10 transition-colors`}>
          <Filter size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((t) => (
          <div key={t.id} className={`${activeTheme.card} p-8 rounded-[2.5rem] border ${activeTheme.border} hover:shadow-2xl transition-all group relative`}>
            <div className="flex justify-between items-center mb-8">
              <StatusBadge status={t.status} />
              <div className="flex gap-2">
                {user?.role === Role.SUPER_ADMIN && (
                  <button 
                    onClick={() => dispatch({ type: 'DELETE_TOURNAMENT', payload: t.id })}
                    className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <Link to={`/tournaments/${t.id}`} className="block space-y-4">
              <h3 className="text-2xl font-oswald font-bold uppercase tracking-tight group-hover:text-indigo-500 transition-colors truncate">{t.name}</h3>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40">
                <Target size={14} className="text-indigo-500" />
                {t.type} OPERATIONAL MODE
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-black/10 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">ENLISTED</p>
                  <p className="font-oswald font-bold text-xl tracking-tight">{t.teamIds.length} SQUADS</p>
                </div>
                <div className="bg-black/10 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">DATES</p>
                  <p className="font-bold text-[11px] uppercase tracking-tighter">
                    {new Date(t.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} — {new Date(t.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </Link>

            <div className="pt-8 mt-4 border-t border-white/5 flex gap-4">
              <Link 
                to={`/tournaments/${t.id}`} 
                className="flex-1 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white text-center py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-indigo-500/20"
              >
                ACCESS HUB
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
          <div className={`${activeTheme.card} w-full max-w-xl rounded-[3rem] p-12 shadow-2xl border ${activeTheme.border}`}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-oswald font-bold uppercase tracking-tighter">INITIALIZE CIRCUIT</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">NEW OPERATIONAL DEPLOYMENT</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-4 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Tournament Designation</label>
                <input 
                  autoFocus
                  required
                  className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                  value={newTourney.name}
                  onChange={e => setNewTourney({...newTourney, name: e.target.value})}
                  placeholder="e.g. MASTER SERIES S1"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Deployment Mode</label>
                  <select 
                    className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-bold text-sm outline-none appearance-none`}
                    value={newTourney.type}
                    onChange={e => setNewTourney({...newTourney, type: e.target.value as TournamentType})}
                  >
                    <option value={TournamentType.SQUAD}>SQUAD OPS</option>
                    <option value={TournamentType.DUO}>DUO OPS</option>
                    <option value={TournamentType.SOLO}>SOLO OPS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Operational Status</label>
                  <select 
                    className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-bold text-sm outline-none appearance-none`}
                    value={newTourney.status}
                    onChange={e => setNewTourney({...newTourney, status: e.target.value as any})}
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="FINISHED">FINISHED</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Commence Date</label>
                  <input 
                    type="date"
                    required
                    className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-bold text-sm outline-none`}
                    value={newTourney.startDate}
                    onChange={e => setNewTourney({...newTourney, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Termination Date</label>
                  <input 
                    type="date"
                    required
                    className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-bold text-sm outline-none`}
                    value={newTourney.endDate}
                    onChange={e => setNewTourney({...newTourney, endDate: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className={`w-full ${activeTheme.primary} text-white font-black uppercase text-xs tracking-[0.5em] py-7 rounded-[2rem] shadow-2xl mt-10 transition-all active:scale-95`}
              >
                INITIALIZE BATTLESPACE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
