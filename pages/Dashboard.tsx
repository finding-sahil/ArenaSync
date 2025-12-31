
import React, { useState } from 'react';
import { useData, useTheme, useAuth } from '../App';
import { THEMES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Trophy, Users, Gamepad2, Clock, ShieldAlert, History, Megaphone, Radio, DollarSign, ClipboardCheck, Eye, Zap, UserCircle, ArrowRight, Calendar, AlertTriangle
} from 'lucide-react';
import { getTournamentStandings } from '../utils/calculations';
import { Link } from 'react-router-dom';
import { Role, TeamRegistration, Announcement } from '../types';

export default function Dashboard() {
  const { state, dispatch } = useData();
  const { theme } = useTheme();
  const { user } = useAuth();
  const activeTheme = THEMES[theme];
  const [metric, setMetric] = useState<'points' | 'kills'>('points');
  const [reviewReg, setReviewReg] = useState<TeamRegistration | null>(null);

  const stats = {
    tournaments: state.tournaments.length,
    ongoing: state.tournaments.filter(t => t.status === 'ONGOING').length,
    teams: state.teams.length,
    matches: state.matches.filter(m => m.status === 'COMPLETED').length
  };

  const selectedTournament = state.tournaments.find(t => t.status === 'ONGOING') || state.tournaments[0];
  const standings = selectedTournament 
    ? getTournamentStandings(selectedTournament.id, state.matches, state.teams, state.settings.scoring).slice(0, 5) 
    : [];

  const announcements = state.tournaments
    .flatMap(t => t.announcements)
    .filter(a => a.targetRoles.includes(user?.role!))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  const chartData = standings.length > 0 
    ? standings.map(s => ({
        name: s.team.tag,
        points: s.totalPoints,
        kills: s.killPoints
      }))
    : [{ name: 'N/A', points: 0, kills: 0 }];

  const isAdminOrSuper = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;
  const isManager = user?.role === Role.TEAM_MANAGER;
  const isPlayer = user?.role === Role.PLAYER;

  const StatsCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className={`${activeTheme.card} p-5 md:p-6 rounded-3xl border ${activeTheme.border} shadow-sm flex items-center gap-4 hover:translate-y-[-2px] transition-transform`}>
      <div className={`${color} p-3 md:p-4 rounded-2xl text-white shadow-lg shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 truncate ${activeTheme.text}`}>{title}</p>
        <p className={`text-2xl font-oswald font-bold tracking-tight ${activeTheme.text}`}>{value}</p>
        <p className={`text-[8px] font-bold opacity-30 uppercase tracking-tighter ${activeTheme.textMuted}`}>{subText}</p>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 ${activeTheme.text}`}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-4xl font-oswald font-bold tracking-tighter uppercase italic ${activeTheme.text}`}>OPS HUB</h1>
          <p className={`${activeTheme.textMuted} text-[10px] font-black uppercase tracking-[0.4em] mt-1`}>
            OPERATOR: {user?.username} <span className="opacity-20 mx-2">|</span> <span className="text-emerald-500">SESSION AUTHORIZED</span>
          </p>
        </div>
        <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-gray-500/5 border ${activeTheme.border}`}>
          <ShieldAlert size={14} className={activeTheme.accent} />
          <span className="opacity-60">FINGERPRINT:</span>
          <span>{user?.secureId.slice(-6)}</span>
        </div>
      </header>

      {/* Broadcasts Section */}
      {announcements.length > 0 && (
        <section className="grid grid-cols-1 gap-4">
           {announcements.map(a => (
             <div key={a.id} className={`p-6 rounded-[2rem] border-2 flex items-center justify-between gap-6 transition-all ${a.type === 'URGENT' ? 'border-red-500/40 bg-red-500/5' : 'border-indigo-500/20 bg-indigo-500/5'}`}>
               <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-xl ${a.type === 'URGENT' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'}`}>
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="font-oswald font-bold text-sm uppercase tracking-tight">{a.title}</h3>
                    <p className="text-xs opacity-60 font-medium leading-relaxed">{a.content}</p>
                  </div>
               </div>
               <span className="text-[9px] font-black opacity-30 uppercase whitespace-nowrap tracking-widest">{new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
           ))}
        </section>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard title="Circuits" value={stats.tournaments} icon={Trophy} color="bg-amber-500" subText="ACTIVE EVENTS" />
        <StatsCard title="Live" value={stats.ongoing} icon={Zap} color="bg-emerald-500" subText="IN PROGRESS" />
        <StatsCard title="Elite Squads" value={stats.teams} icon={Users} color="bg-sky-500" subText="VERIFIED ROSTERS" />
        <StatsCard title="Matches" value={stats.matches} icon={Gamepad2} color="bg-indigo-500" subText="VALIDATED DATA" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {(isPlayer || isManager) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className={`${activeTheme.card} p-8 rounded-[2.5rem] border ${activeTheme.border} shadow-sm`}>
                <div className="flex items-center gap-4 mb-8">
                  <UserCircle size={24} className="text-indigo-500" />
                  <h2 className="text-xl font-oswald font-bold uppercase tracking-tight">Profile Intel</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-black/10 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">OPERATIONAL IDENTITY</p>
                    <p className="font-mono text-sm text-indigo-400 font-bold">{user?.secureId}</p>
                  </div>
                  <div className="p-5 bg-black/10 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">CLEARANCE LEVEL</p>
                    <p className="font-bold text-sm uppercase">{user?.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </section>

              <section className={`${activeTheme.card} p-8 rounded-[2.5rem] border ${activeTheme.border} shadow-sm`}>
                <div className="flex items-center gap-4 mb-8">
                  <Calendar size={24} className="text-emerald-500" />
                  <h2 className="text-xl font-oswald font-bold uppercase tracking-tight">Active Orders</h2>
                </div>
                {state.matches.find(m => m.status === 'SCHEDULED') ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-2">NEXT DEPLOYMENT</p>
                      <h3 className="font-oswald text-3xl font-bold uppercase italic tracking-tighter text-emerald-500">{state.matches.find(m => m.status === 'SCHEDULED')?.map}</h3>
                    </div>
                    <div className="flex justify-between items-center bg-black/10 p-5 rounded-2xl">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">ROUND {state.matches.find(m => m.status === 'SCHEDULED')?.roundNumber}</span>
                       <span className="font-mono text-sm font-bold">{new Date(state.matches.find(m => m.status === 'SCHEDULED')?.scheduledTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-20 italic font-bold text-xs uppercase tracking-widest space-y-4">
                    <Gamepad2 size={40} />
                    <span>No active match orders</span>
                  </div>
                )}
              </section>
            </div>
          )}

          {isAdminOrSuper && state.registrations.some(r => r.status === 'PENDING') && (
            <section className={`${activeTheme.card} p-8 rounded-[2.5rem] border-2 border-indigo-500/30 bg-indigo-500/5`}>
              <div className="flex items-center gap-3 mb-6">
                <ClipboardCheck size={24} className="text-indigo-500" />
                <h2 className={`text-xl font-oswald font-bold uppercase tracking-tight ${activeTheme.text}`}>Payment Clearance</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.registrations.filter(r => r.status === 'PENDING').map(reg => (
                  <div key={reg.id} className="p-4 bg-gray-500/5 border border-gray-500/10 rounded-2xl flex items-center justify-between group">
                    <div><p className={`font-bold text-sm ${activeTheme.text}`}>{reg.teamName}</p><p className="text-[10px] opacity-40 font-mono tracking-tighter">TXID: {reg.transactionId.slice(0, 10)}...</p></div>
                    <button onClick={() => setReviewReg(reg)} className="p-2 bg-indigo-500 text-white rounded-lg group-hover:scale-105 transition-transform"><Eye size={18} /></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className={`${activeTheme.card} p-8 rounded-[2.5rem] border ${activeTheme.border} shadow-sm overflow-hidden`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-xl font-oswald font-bold uppercase tracking-tight ${activeTheme.text}`}>Analysis Grid</h2>
              <div className="flex gap-2">
                <button onClick={() => setMetric('points')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${metric === 'points' ? activeTheme.primary + ' text-white shadow-lg' : 'bg-gray-500/10 opacity-50'}`}>POINTS</button>
                <button onClick={() => setMetric('kills')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${metric === 'kills' ? activeTheme.primary + ' text-white shadow-lg' : 'bg-gray-500/10 opacity-50'}`}>KILLS</button>
              </div>
            </div>
            <div className="h-[300px] w-full min-w-0" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} key={metric}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={activeTheme.chartGrid} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 900 }} />
                  <Tooltip cursor={{ fill: 'rgba(100,100,100,0.1)' }} contentStyle={{ borderRadius: '16px', backgroundColor: '#000', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey={metric} barSize={40} radius={[8, 8, 0, 0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={i === 0 ? '#F59E0B' : activeTheme.primaryHex} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {isAdminOrSuper && (
            <div className={`${activeTheme.card} p-8 rounded-[3rem] border ${activeTheme.border} flex flex-col max-h-[600px] shadow-sm`}>
              <div className="flex items-center gap-3 mb-8 shrink-0">
                <History size={20} className={activeTheme.accent} />
                <h2 className={`text-xl font-oswald font-bold uppercase tracking-tight ${activeTheme.text}`}>Audit Trail</h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {state.logs.map((log) => (
                  <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-gray-500/5 border border-transparent hover:border-indigo-500/10 transition-all">
                    <div className={`w-1 h-8 rounded-full shrink-0 ${log.type === 'danger' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.4)]'}`} />
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-tight truncate ${activeTheme.text}`}>{log.action}</p>
                      <p className={`text-[9px] opacity-40 uppercase truncate font-medium ${activeTheme.textMuted}`}>{log.details}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[8px] opacity-30 font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         <span className={`text-[8px] font-black uppercase tracking-widest ${activeTheme.accent}`}>{log.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAdminOrSuper && (
            <div className="space-y-4">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-6 ${activeTheme.text}`}>System Core</h3>
              <div className={`${activeTheme.card} p-6 rounded-3xl border ${activeTheme.border} opacity-50 relative overflow-hidden group grayscale`}>
                <div className="flex items-center gap-4">
                  <Radio size={20} className="text-fuchsia-500" />
                  <div><p className={`font-oswald font-bold text-sm uppercase tracking-tight ${activeTheme.text}`}>Broadcast Engine</p><p className="text-[9px] font-black opacity-30 uppercase tracking-widest">ENCRYPTED CHANNEL</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
