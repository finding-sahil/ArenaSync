
import React, { useState, useMemo } from 'react';
import { useData, useTheme } from '../App';
import { THEMES } from '../constants';
import { Trophy, Clock, Filter, MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import { getTournamentStandings } from '../utils/calculations';

export default function Standings({ type }: { type: 'match-wise' | 'overall' }) {
  const { state } = useData();
  const { theme } = useTheme();
  const activeTheme = THEMES[theme];
  
  const [selectedTournament, setSelectedTournament] = useState(state.tournaments[0]?.id || '');
  const tournament = state.tournaments.find(t => t.id === selectedTournament);
  
  const standings = useMemo(() => tournament ? getTournamentStandings(tournament.id, state.matches, state.teams, state.settings.scoring) : [], [tournament, state]);
  const matches = useMemo(() => state.matches.filter(m => m.tournamentId === selectedTournament && m.status === 'COMPLETED').sort((a,b) => a.roundNumber - b.roundNumber), [selectedTournament, state.matches]);

  return (
    <div className={`space-y-10 animate-in fade-in duration-700 pb-20 ${activeTheme.text}`}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-oswald font-bold tracking-tight uppercase italic flex items-center gap-4">
            {type === 'overall' ? <Trophy className={activeTheme.accent} /> : <Clock className={activeTheme.accent} />}
            {type === 'overall' ? 'Circuit Standings' : 'Match Timeline'}
          </h1>
          <p className={`${activeTheme.textMuted} text-[10px] font-black uppercase tracking-[0.3em]`}>Validated Garena Esports Metrics</p>
        </div>
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className={`bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-8 py-4 font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/40`}>
          {state.tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          {state.tournaments.length === 0 && <option>No Active Events</option>}
        </select>
      </header>

      {type === 'overall' ? (
        <div className={`${activeTheme.card} rounded-[3rem] border ${activeTheme.border} overflow-hidden shadow-2xl`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-black uppercase border-b ${activeTheme.border} bg-gray-500/5`}>
                <th className="px-10 py-6 tracking-widest opacity-40">Rank</th>
                <th className="px-10 py-6 tracking-widest opacity-40">Squad Identity</th>
                <th className="px-10 py-6 text-center tracking-widest opacity-40">Matches</th>
                <th className="px-10 py-6 text-center tracking-widest opacity-40">Booyah</th>
                <th className="px-10 py-6 text-center tracking-widest opacity-40">Kills</th>
                <th className="px-10 py-6 text-right tracking-widest opacity-40">Points</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${activeTheme.border}`}>
              {standings.map((s, idx) => (
                <tr key={s.team.id} className="hover:bg-gray-500/5 transition-all group">
                  <td className={`px-10 py-6 font-oswald font-bold text-2xl ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : activeTheme.tableRank}`}>{idx + 1}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border ${activeTheme.border} text-[10px]`}>{s.team.tag}</div>
                      <div>
                        <p className="font-black text-base uppercase italic tracking-tight">{s.team.name}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest opacity-30`}>{s.team.tag}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center font-bold text-base">{s.matchesPlayed}</td>
                  <td className={`px-10 py-6 text-center font-black text-2xl ${idx === 0 ? 'text-amber-500' : ''}`}>{s.booyahs}</td>
                  <td className="px-10 py-6 text-center font-bold text-base">{s.killPoints}</td>
                  <td className={`px-10 py-6 text-right font-oswald font-bold text-3xl ${activeTheme.tablePoints}`}>{s.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {matches.map(m => (
            <div key={m.id} className={`${activeTheme.card} rounded-[3.5rem] border ${activeTheme.border} p-12 shadow-xl`}>
              <div className="flex items-center justify-between mb-10 pb-10 border-b border-white/5">
                <div className="flex items-center gap-8">
                  <div className={`${activeTheme.primary} text-white w-24 h-24 rounded-[2rem] flex items-center justify-center font-oswald font-bold text-5xl shadow-2xl`}>{m.roundNumber}</div>
                  <div>
                    <h3 className="font-oswald font-bold text-4xl uppercase tracking-tighter italic flex items-center gap-4"><MapPin className="text-emerald-500" /> {m.map}</h3>
                    <p className={`text-[10px] uppercase font-black tracking-[0.3em] opacity-40 mt-2`}>{new Date(m.scheduledTime).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                  <TrendingUp size={20} /> Scoreboard Validated
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {m.results.sort((a,b) => a.placement - b.placement).map(res => (
                  <div key={res.teamId} className="bg-gray-500/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center relative group hover:border-indigo-500/40 transition-all">
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-xl ${res.placement === 1 ? 'bg-amber-500' : 'bg-slate-700'}`}>{res.placement}</div>
                    <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center font-black text-xs mb-4 mt-2">{state.teams.find(t => t.id === res.teamId)?.tag}</div>
                    <p className="font-black text-xs uppercase tracking-tight truncate w-full">{state.teams.find(t => t.id === res.teamId)?.name}</p>
                    <span className="text-[9px] font-black uppercase text-indigo-500 mt-2">+{res.kills} KILLS</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
