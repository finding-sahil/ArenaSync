
import React, { useState } from 'react';
import { useData, useTheme, useAuth } from '../App';
import { THEMES } from '../constants';
import { Gamepad2, Search, Clock, Map as MapIcon, Plus, ChevronRight, X, CheckCircle2, Save, Trophy, AlertTriangle, ArrowRight, UserPlus, Trash2, Pause, Play, ShieldAlert, History } from 'lucide-react';
import { Match, Team, MatchResult, Role, MatchIncident } from '../types';
import { Link } from 'react-router-dom';

export default function Matches() {
  const { state, dispatch } = useData();
  const { theme } = useTheme();
  const { user } = useAuth();
  const activeTheme = THEMES[theme];

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState<Match | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  
  const [newMatch, setNewMatch] = useState<Partial<Match>>({
    roundNumber: 1,
    map: state.settings.maps[0] || 'Bermuda',
    scheduledTime: '',
    durationMinutes: 20,
    status: 'SCHEDULED',
    results: [],
    incidents: []
  });

  const filteredMatches = state.matches.filter(m => {
    const tourney = state.tournaments.find(t => t.id === m.tournamentId);
    return (tourney?.name.toLowerCase().includes(search.toLowerCase()) || m.map.toLowerCase().includes(search.toLowerCase()));
  });

  const handleStatusChange = (match: Match, status: Match['status']) => {
    const reason = status === 'PAUSED' ? 'Tactical Pause Issued' : status === 'VOIDED' ? 'Admin Void Order' : 'State Transition';
    const incident: MatchIncident = {
      id: `inc-${Date.now()}`,
      type: status === 'PAUSED' ? 'PAUSE' : 'RESUME',
      message: `${status} state triggered.`,
      author: user?.username || 'Admin',
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_MATCH', payload: { match: { ...match, status }, reason, author: user?.username || 'Admin' } });
    dispatch({ type: 'ADD_INCIDENT', payload: { matchId: match.id, incident } });
    dispatch({ type: 'ADD_LOG', payload: { user: user?.username || 'Host', role: user?.role || Role.HOST, action: 'Match State Change', details: `Match ${match.id} set to ${status}`, type: 'warning' } });
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResultsModal) return;
    if (showResultsModal.status === 'COMPLETED' && !overrideReason) {
      alert("Operational Requirement: Justification reason mandatory for score override.");
      return;
    }

    dispatch({ 
      type: 'UPDATE_MATCH', 
      payload: { 
        match: { ...showResultsModal, status: 'COMPLETED' }, 
        reason: overrideReason || 'Initial Score Submission', 
        author: user?.username || 'Host' 
      } 
    });
    
    setShowResultsModal(null);
    setOverrideReason('');
  };

  const updateResult = (teamId: string, field: keyof MatchResult, value: number) => {
    if (!showResultsModal) return;
    const results = [...showResultsModal.results];
    const index = results.findIndex(r => r.teamId === teamId);
    
    // Anomaly detection: flag if kills > threshold
    const isAnomaly = field === 'kills' && value > state.settings.scoring.maxKillThreshold;

    if (index > -1) {
      results[index] = { ...results[index], [field]: value, anomalyFlag: isAnomaly };
    } else {
      results.push({ teamId, placement: 1, kills: 0, penalty: 0, [field]: value, playersPresent: [], anomalyFlag: isAnomaly });
    }
    setShowResultsModal({ ...showResultsModal, results });
  };

  const getTournamentTeams = (tournamentId: string) => {
    const tournament = state.tournaments.find(t => t.id === tournamentId);
    return state.teams.filter(t => tournament?.teamIds.includes(t.id));
  };

  const canEdit = user?.role === Role.HOST || user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 pb-20 ${activeTheme.text}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-oswald font-bold uppercase italic tracking-tighter">COMBAT OPS</h1>
          <p className={`${activeTheme.textMuted} text-[10px] font-black uppercase tracking-[0.4em] mt-1`}>REAL-TIME MATCH CONTROL & FORENSIC SCORE ENTRY</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowAddModal(true)} className={`${activeTheme.primary} text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95`}>
            <Plus size={18} /> INITIALIZE BATTLE
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredMatches.map((m) => (
          <div key={m.id} className={`${activeTheme.card} rounded-[2.5rem] border ${activeTheme.border} overflow-hidden hover:border-indigo-500/30 transition-all group`}>
            <div className="p-8 flex flex-col md:flex-row items-center gap-8">
               <div className="flex items-center gap-8 flex-1 w-full">
                  <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center font-oswald text-4xl font-bold ${m.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{m.roundNumber}</div>
                  <div className="min-w-0">
                    <h3 className="font-oswald font-bold text-2xl uppercase tracking-tight truncate">{state.tournaments.find(t => t.id === m.tournamentId)?.name}</h3>
                    <div className="flex flex-wrap items-center gap-6 mt-3">
                       <span className="flex items-center gap-2 opacity-40 text-[10px] font-black uppercase tracking-widest"><MapIcon size={14} /> {m.map}</span>
                       <span className="flex items-center gap-2 opacity-40 text-[10px] font-black uppercase tracking-widest"><Clock size={14} /> {new Date(m.scheduledTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                       {m.modifiedBy && <span className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20"><ShieldAlert size={12}/> OVERRIDE: {m.modifiedBy}</span>}
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                  <div className="flex gap-2">
                    {m.status === 'LIVE' && <button onClick={() => handleStatusChange(m, 'PAUSED')} className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform"><Pause size={20}/></button>}
                    {m.status === 'PAUSED' && <button onClick={() => handleStatusChange(m, 'LIVE')} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform"><Play size={20}/></button>}
                  </div>
                  <button onClick={() => setShowResultsModal(m)} className="flex-1 md:flex-none px-10 py-5 bg-gray-500/5 hover:bg-gray-500/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5">
                    {m.status === 'COMPLETED' ? 'FORENSICS' : 'SUBMIT INTEL'}
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {showResultsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in zoom-in-95 duration-300">
          <div className={`${activeTheme.card} w-full max-w-3xl rounded-[3.5rem] p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border ${activeTheme.border}`}>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-oswald font-bold uppercase tracking-tighter">COMBAT RESULT ENTRY</h2>
                <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mt-1">AUTH LEVEL: {user?.role.replace('_', ' ')} <span className="mx-2">|</span> ENCRYPTION ACTIVE</p>
              </div>
              <button onClick={() => setShowResultsModal(null)} className="p-4 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"><X size={32}/></button>
            </div>

            {showResultsModal.status === 'COMPLETED' && (
              <div className="mb-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-4">
                 <div className="flex items-center gap-3 text-amber-500">
                   <AlertTriangle size={20} />
                   <span className="text-[11px] font-black uppercase tracking-widest">Score Override Protocol</span>
                 </div>
                 <textarea 
                   placeholder="Enter formal justification for score modification..."
                   className="w-full bg-black/40 border border-amber-500/30 rounded-2xl p-5 text-sm font-medium text-amber-500 outline-none focus:ring-1 focus:ring-amber-500 placeholder:opacity-30"
                   value={overrideReason}
                   onChange={e => setOverrideReason(e.target.value)}
                 />
              </div>
            )}

            <form onSubmit={handleSaveResults} className="space-y-6">
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-30">
                  <div className="col-span-5">Elite Squad</div>
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-2 text-center">Kills</div>
                  <div className="col-span-3 text-center">Penalty</div>
                </div>
                {getTournamentTeams(showResultsModal.tournamentId).map(team => {
                  const res = showResultsModal.results.find(r => r.teamId === team.id) || { placement: 0, kills: 0, penalty: 0, anomalyFlag: false };
                  return (
                    <div key={team.id} className={`grid grid-cols-12 gap-4 items-center p-5 rounded-2xl border transition-all ${res.anomalyFlag ? 'border-red-500/50 bg-red-500/5' : 'bg-gray-500/5 border-white/5'}`}>
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center font-black text-[9px] border border-white/5 tracking-tighter">{team.tag}</div>
                        <span className="font-bold text-sm truncate uppercase tracking-tight">{team.name}</span>
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="1" max="12" placeholder="00" value={res.placement || ''} onChange={e => updateResult(team.id, 'placement', parseInt(e.target.value) || 0)} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 text-center font-oswald font-bold text-lg outline-none focus:border-indigo-500/50 transition-colors" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" placeholder="00" value={res.kills || ''} onChange={e => updateResult(team.id, 'kills', parseInt(e.target.value) || 0)} className={`w-full bg-black/30 border border-white/10 rounded-xl py-3 text-center font-oswald font-bold text-lg outline-none focus:border-indigo-500/50 transition-colors ${res.anomalyFlag ? 'text-red-500' : ''}`} />
                      </div>
                      <div className="col-span-3">
                        <input type="number" min="0" placeholder="00" value={res.penalty || ''} onChange={e => updateResult(team.id, 'penalty', parseInt(e.target.value) || 0)} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 text-center font-oswald font-bold text-lg outline-none focus:border-red-500/50 transition-colors text-red-500" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button type="submit" className={`w-full ${activeTheme.primary} text-white font-black uppercase text-xs tracking-[0.5em] py-7 rounded-[2rem] shadow-2xl mt-10 transition-all active:scale-95 flex items-center justify-center gap-4 hover:shadow-indigo-500/20`}>
                 <CheckCircle2 size={24} /> AUTHORIZE INTEL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
