
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, useTheme, useAuth } from '../App';
import { THEMES } from '../constants';
import { 
  Trophy, 
  Download, 
  ArrowLeft, 
  Calendar, 
  Users, 
  Gamepad2, 
  TrendingUp,
  AlertCircle,
  Plus,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { getTournamentStandings, exportToCSV } from '../utils/calculations';
import { Role } from '../types';

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useData();
  const { theme } = useTheme();
  const { user } = useAuth();
  const activeTheme = THEMES[theme];

  const [showTeamModal, setShowTeamModal] = useState(false);

  const tournament = state.tournaments.find(t => t.id === id);
  
  const standings = useMemo(() => {
    if (!id) return [];
    return getTournamentStandings(
      id, 
      state.matches, 
      state.teams, 
      state.settings.scoring
    );
  }, [id, state.matches, state.teams, state.settings.scoring]);

  const handleExportCSV = () => {
    const exportData = standings.map((s, idx) => ({
      Rank: idx + 1,
      Team: s.team.name,
      Tag: s.team.tag,
      Played: s.matchesPlayed,
      Booyahs: s.booyahs,
      'Placement Points': s.placementPoints,
      'Kill Points': s.killPoints,
      Penalty: s.penalty,
      'Total Points': s.totalPoints
    }));
    exportToCSV(exportData, `${tournament?.name}_Standings`);
  };

  const toggleTeamParticipation = (teamId: string) => {
    if (!tournament) return;
    const teamIds = [...tournament.teamIds];
    const index = teamIds.indexOf(teamId);
    if (index > -1) {
      teamIds.splice(index, 1);
    } else {
      teamIds.push(teamId);
    }
    // Fixed: Replaced dispatch.updateTournament with correct action dispatch
    dispatch({ type: 'UPDATE_TOURNAMENT', payload: { ...tournament, teamIds } });
  };

  const handleLogoUpload = () => {
    if (!tournament) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          // Fixed: Replaced dispatch.updateTournament with correct action dispatch
          dispatch({ type: 'UPDATE_TOURNAMENT', payload: { ...tournament, logoUrl: event.target.result } });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!tournament) return <div className="p-20 text-center font-bold uppercase opacity-30">Tournament Not Found</div>;

  return (
    <div className={`space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20 ${activeTheme.text}`}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link to="/tournaments" className="p-3 bg-gray-500/5 hover:bg-gray-500/10 rounded-2xl transition-all shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-4 md:gap-5">
            <button 
              onClick={handleLogoUpload}
              className={`w-16 h-16 md:w-20 md:h-20 shrink-0 bg-indigo-500/10 border ${activeTheme.border} rounded-2xl md:rounded-[1.5rem] flex items-center justify-center overflow-hidden relative group shadow-sm`}
            >
              {tournament.logoUrl ? (
                <img src={tournament.logoUrl} className="w-full h-full object-cover" />
              ) : (
                <Trophy size={28} className="text-indigo-500" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <ImageIcon size={18} />
              </div>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-2xl md:text-4xl font-oswald font-bold tracking-tight uppercase italic truncate">{tournament.name}</h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-1">
                <span className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${activeTheme.textMuted}`}><Calendar size={12}/> {tournament.startDate}</span>
                <span className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${activeTheme.textMuted}`}><Users size={12}/> {tournament.teamIds.length} SQUADS</span>
                <span className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${activeTheme.textMuted}`}><Gamepad2 size={12}/> {tournament.type}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Fix: Role comparison corrected to use Role.PLAYER */}
          {user?.role !== Role.PLAYER && (
            <button 
              onClick={() => setShowTeamModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all"
            >
              <Users size={18} /> Manage
            </button>
          )}
          <button 
            onClick={handleExportCSV}
            className={`flex-1 md:flex-none ${activeTheme.primary} text-white flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl shadow-black/20 transition-all active:scale-95`}
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className={`${activeTheme.card} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border ${activeTheme.border} flex items-center gap-5 shadow-sm`}>
          <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-[1.2rem] md:rounded-[1.5rem] bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
            <Trophy size={28} />
          </div>
          <div className="overflow-hidden">
            <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 truncate ${activeTheme.textMuted}`}>Current Leader</p>
            <p className="font-oswald font-bold text-xl md:text-2xl italic uppercase truncate">{standings[0]?.team.name || '---'}</p>
          </div>
        </div>
        <div className={`${activeTheme.card} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border ${activeTheme.border} flex items-center gap-5 shadow-sm`}>
          <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-[1.2rem] md:rounded-[1.5rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner">
            <TrendingUp size={28} />
          </div>
          <div className="overflow-hidden">
            <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 truncate ${activeTheme.textMuted}`}>Circuit Kills</p>
            <p className="font-oswald font-bold text-xl md:text-2xl italic uppercase truncate">{standings.reduce((acc, s) => acc + s.killPoints, 0)}</p>
          </div>
        </div>
        <div className={`${activeTheme.card} p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border ${activeTheme.border} flex items-center gap-5 shadow-sm sm:col-span-2 lg:col-span-1`}>
          <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-[1.2rem] md:rounded-[1.5rem] bg-red-500/10 text-red-500 flex items-center justify-center shadow-inner">
            <AlertCircle size={28} />
          </div>
          <div className="overflow-hidden">
            <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 truncate ${activeTheme.textMuted}`}>Total Penalties</p>
            <p className="font-oswald font-bold text-xl md:text-2xl italic uppercase truncate">{standings.reduce((acc, s) => acc + s.penalty, 0)} <span className="text-xs font-bold">PTS</span></p>
          </div>
        </div>
      </div>

      <div className={`${activeTheme.card} rounded-[2rem] md:rounded-[3rem] border ${activeTheme.border} overflow-hidden shadow-sm`}>
        <div className={`p-6 md:p-8 border-b ${activeTheme.border} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-500/5`}>
          <h2 className="text-xl md:text-2xl font-oswald font-bold uppercase italic tracking-tighter">Season Leaderboard</h2>
          <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ${activeTheme.textMuted}`}>Official Garena Metrics</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[9px] md:text-[10px] font-black uppercase border-b ${activeTheme.border} bg-gray-500/5`}>
                <th className={`px-4 md:px-8 py-4 md:py-5 ${activeTheme.textMuted} tracking-widest sticky left-0 z-10 bg-inherit`}>Rank</th>
                <th className={`px-4 md:px-8 py-4 md:py-5 ${activeTheme.textMuted} tracking-widest sticky left-[64px] md:left-[96px] z-10 bg-inherit border-r ${activeTheme.border}`}>Elite Squad</th>
                <th className={`px-4 md:px-8 py-4 md:py-5 text-center ${activeTheme.textMuted} tracking-widest min-w-[80px]`}>Matches</th>
                <th className={`px-4 md:px-8 py-4 md:py-5 text-center ${activeTheme.textMuted} tracking-widest min-w-[80px]`}>Booyah</th>
                <th className={`px-4 md:px-8 py-4 md:py-5 text-center ${activeTheme.textMuted} tracking-widest min-w-[80px]`}>Placement</th>
                <th className={`px-4 md:px-8 py-4 md:py-5 text-center ${activeTheme.textMuted} tracking-widest min-w-[80px]`}>Kills</th>
                <th className={`px-4 md:px-8 py-4 md:py-5 text-center ${activeTheme.textMuted} tracking-widest min-w-[80px]`}>Penalty</th>
                <th className={`px-4 md:px-8 py-4 md:py-5 text-right ${activeTheme.textMuted} tracking-widest min-w-[80px]`}>Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${activeTheme.border}`}>
              {standings.map((s, idx) => (
                <tr key={s.team.id} className="hover:bg-gray-500/5 transition-all group">
                  <td className="px-4 md:px-8 py-4 md:py-6 sticky left-0 z-10 bg-inherit group-hover:bg-gray-500/5 transition-colors">
                    <span className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center font-oswald font-bold text-xs md:text-sm ${idx === 0 ? 'bg-amber-500 text-white shadow-lg' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-orange-400 text-white' : activeTheme.tableRank + ' bg-gray-500/10'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6 sticky left-[64px] md:left-[96px] z-10 bg-inherit group-hover:bg-gray-500/5 transition-colors border-r ${activeTheme.border}">
                    <div className="flex items-center gap-3 md:gap-4 min-w-[140px] md:min-w-0">
                      <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-[9px] overflow-hidden border ${activeTheme.border} shadow-sm ${activeTheme.bg}`}>
                        {s.team.logoUrl ? <img src={s.team.logoUrl} className="w-full h-full object-cover" /> : s.team.tag}
                      </div>
                      <div className="overflow-hidden">
                        <span className={`font-bold text-sm md:text-base tracking-tight truncate block ${activeTheme.tableTeam}`}>{s.team.name}</span>
                        <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-50 truncate ${activeTheme.tableTeam}`}>{s.team.tag}</p>
                      </div>
                    </div>
                  </td>
                  {/* Fixed: Replaced non-existent tablePlayed and tableBooyah with valid ThemeColors properties */}
                  <td className={`px-4 md:px-8 py-4 md:py-6 text-center font-bold text-xs md:text-sm ${activeTheme.text}`}>{s.matchesPlayed}</td>
                  <td className={`px-4 md:px-8 py-4 md:py-6 text-center font-black text-base md:text-lg ${activeTheme.accent}`}>{s.booyahs}</td>
                  <td className={`px-4 md:px-8 py-4 md:py-6 text-center text-xs md:text-sm font-medium ${activeTheme.textMuted}`}>{s.placementPoints}</td>
                  <td className={`px-4 md:px-8 py-4 md:py-6 text-center text-xs md:text-sm font-medium ${activeTheme.tableKills}`}>{s.killPoints}</td>
                  <td className="px-4 md:px-8 py-4 md:py-6 text-center text-xs md:text-sm font-bold text-red-500">{s.penalty}</td>
                  <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                    <span className={`font-oswald font-bold text-xl md:text-2xl italic ${activeTheme.tablePoints}`}>{s.totalPoints}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showTeamModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className={`${activeTheme.card} ${activeTheme.text} w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[3rem] p-8 md:p-10 shadow-2xl border-t sm:border ${activeTheme.border} max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h2 className="text-2xl md:text-3xl font-oswald font-bold uppercase italic tracking-tighter">Event Roster</h2>
              <button onClick={() => setShowTeamModal(false)} className="p-3 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar flex-1 pb-6">
              {state.teams.map(team => (
                <div 
                  key={team.id} 
                  onClick={() => toggleTeamParticipation(team.id)}
                  className={`flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] cursor-pointer border-2 transition-all ${
                    tournament.teamIds.includes(team.id) 
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' 
                      : `border-transparent bg-gray-500/5 hover:border-gray-500/20`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-gray-500/10 flex items-center justify-center font-black text-[9px] border ${activeTheme.border}`}>
                      {team.tag}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold tracking-tight text-sm md:text-base truncate">{team.name}</p>
                      <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${activeTheme.textMuted}`}>Verified Squad</p>
                    </div>
                  </div>
                  {tournament.teamIds.includes(team.id) ? (
                    <div className="bg-indigo-500 text-white rounded-full p-1.5 shadow-md shrink-0"><Plus className="rotate-45" size={18} /></div>
                  ) : (
                    <div className="bg-gray-500/20 text-gray-500 rounded-full p-1.5 shrink-0"><Plus size={18} /></div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowTeamModal(false)}
              className={`w-full shrink-0 ${activeTheme.primary} text-white font-black uppercase text-xs tracking-[0.3em] py-5 rounded-2xl md:rounded-[1.5rem] shadow-2xl shadow-black/30 mt-4 transition-all active:scale-95`}
            >
              Update Competition
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
