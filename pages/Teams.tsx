
import React, { useState } from 'react';
import { useData, useTheme, useAuth } from '../App';
import { THEMES } from '../constants';
import { 
  Plus, Search, Users, Lock, Unlock, X, Image as ImageIcon,
  QrCode, Clipboard, CheckCircle2, ArrowRight, ShieldAlert, Edit2, Trash2
} from 'lucide-react';
import { Team, Player, Role, TeamRegistration } from '../types';

export default function Teams() {
  const { state, dispatch } = useData();
  const { theme } = useTheme();
  const { user } = useAuth();
  const activeTheme = THEMES[theme];

  const [search, setSearch] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [regForm, setRegForm] = useState({
    tournamentId: state.tournaments[0]?.id || '',
    teamName: '',
    teamTag: '',
    transactionId: '',
    screenshotUrl: '',
    players: [] as Player[]
  });
  const [tempPlayer, setTempPlayer] = useState({ ign: '', name: '' });

  const filteredTeams = state.teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.tag.toLowerCase().includes(search.toLowerCase())
  );

  const isAdminOrSuper = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;
  const isManager = user?.role === Role.TEAM_MANAGER;

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.screenshotUrl || !regForm.transactionId || regForm.players.length < 4) {
      alert("Validation Failed: Roster must have at least 4 players, and payment proof is mandatory.");
      return;
    }

    const reg: TeamRegistration = {
      id: `reg_${Date.now()}`,
      tournamentId: regForm.tournamentId,
      teamName: regForm.teamName,
      teamTag: regForm.teamTag,
      players: regForm.players,
      substitutes: [],
      transactionId: regForm.transactionId,
      screenshotUrl: regForm.screenshotUrl,
      status: 'PENDING',
      submittedBy: user?.secureId || 'Manager',
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'ADD_REGISTRATION', payload: reg });
    dispatch({ type: 'ADD_LOG', payload: { user: user?.username || 'Guest', role: user?.role || Role.PLAYER, action: 'Reg Submitted', details: `Team ${reg.teamName} registration queued.`, type: 'info' } });
    setShowRegModal(false);
    alert("Protocol Success: Registration submitted to Central Command for verification.");
  };

  const handleAddRegPlayer = () => {
    if (!tempPlayer.ign) return;
    setRegForm({
      ...regForm,
      players: [...regForm.players, { ...tempPlayer, id: `p_${Date.now()}` }]
    });
    setTempPlayer({ ign: '', name: '' });
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setRegForm({ ...regForm, screenshotUrl: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 pb-20 ${activeTheme.text}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className={`text-4xl font-oswald font-bold uppercase italic tracking-tighter ${activeTheme.text}`}>ROSTER COMMAND</h1>
          <p className={`${activeTheme.textMuted} text-[10px] font-black uppercase tracking-[0.4em] mt-1`}>AUTHORIZED ELITE SQUAD REGISTRY</p>
        </div>
        {isManager && (
          <button 
            onClick={() => setShowRegModal(true)}
            className={`${activeTheme.primary} text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all`}
          >
            <Plus size={18} /> REGISTER SQUAD
          </button>
        )}
      </div>

      <div className="relative group">
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity`} size={20} />
        <input 
          type="text" 
          placeholder="SEARCH VERIFIED ROSTERS..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-14 pr-6 py-5 rounded-2xl bg-gray-500/5 border ${activeTheme.border} outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-black text-[10px] tracking-widest ${activeTheme.text} placeholder:opacity-20`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((t) => (
          <div key={t.id} className={`${activeTheme.card} rounded-[2.5rem] border ${activeTheme.border} overflow-hidden hover:shadow-2xl transition-all group relative`}>
            {isAdminOrSuper && (
              <div className="absolute top-6 right-6 flex gap-2">
                 <button 
                    onClick={() => dispatch({ type: 'TOGGLE_TEAM_LOCK', payload: t.id })}
                    className={`p-2.5 rounded-xl transition-all ${t.rosterLocked ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-500/10 text-gray-500 hover:text-emerald-500'}`}
                    title={t.rosterLocked ? "Unlock Roster" : "Lock Roster"}
                 >
                    {t.rosterLocked ? <Lock size={16} /> : <Unlock size={16} />}
                 </button>
                 <button onClick={() => dispatch({ type: 'DELETE_TEAM', payload: t.id })} className="p-2.5 bg-gray-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all">
                    <Trash2 size={16} />
                 </button>
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-gray-500/5 rounded-[1.5rem] flex items-center justify-center font-oswald font-bold text-3xl text-indigo-500 border border-white/5 shadow-inner">
                  {t.logoUrl ? <img src={t.logoUrl} className="w-full h-full object-cover" /> : t.tag}
                </div>
                <div>
                   <h3 className={`text-2xl font-oswald font-bold uppercase tracking-tight italic truncate max-w-[150px] ${activeTheme.text}`}>{t.name}</h3>
                   <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.accent}`}>{t.tag}</span>
                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${t.rosterLocked ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                        {t.rosterLocked ? 'LOCKED' : 'VERIFIED'}
                      </span>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-2 mb-4`}>Tactical Personnel</p>
                {t.players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-gray-500/5 rounded-2xl border border-transparent group-hover:border-indigo-500/10 transition-all">
                    <span className={`font-bold text-xs tracking-tight uppercase ${activeTheme.tableTeam}`}>{p.ign}</span>
                    <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">ACTIVE MEMBER</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showRegModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in zoom-in-95 duration-300">
           <div className={`${activeTheme.card} w-full max-w-4xl rounded-[3.5rem] border ${activeTheme.border} p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar`}>
             <div className="flex justify-between items-start mb-12">
               <div>
                 <h2 className={`text-4xl font-oswald font-bold uppercase tracking-tighter ${activeTheme.text}`}>SQUAD INITIALIZATION</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">GARENA ESPORTS LOGISTICS PROTOCOL V.2025</p>
               </div>
               <button onClick={() => setShowRegModal(false)} className="p-4 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"><X size={32}/></button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> SQUAD IDENTITY
                    </h3>
                    <div className="grid grid-cols-1 gap-5">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Full Identity</label>
                         <input 
                           placeholder="Official Team Name" 
                           className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 ${activeTheme.text}`}
                           value={regForm.teamName}
                           onChange={e => setRegForm({...regForm, teamName: e.target.value})}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Combat Tag</label>
                         <input 
                           placeholder="4 CHARS" 
                           maxLength={4}
                           className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-oswald font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500/40 uppercase tracking-[0.3em] ${activeTheme.text}`}
                           value={regForm.teamTag}
                           onChange={e => setRegForm({...regForm, teamTag: e.target.value.toUpperCase()})}
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Deployment Zone</label>
                         <select 
                           className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none ${activeTheme.text}`}
                           value={regForm.tournamentId}
                           onChange={e => setRegForm({...regForm, tournamentId: e.target.value})}
                         >
                           {state.tournaments.map(t => <option key={t.id} value={t.id} className={`${activeTheme.card} ${activeTheme.text}`}>{t.name}</option>)}
                         </select>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> PERSONNEL LOADOUT
                    </h3>
                    <div className="flex gap-3">
                       <input 
                         placeholder="IN-GAME NAME (IGN)" 
                         className={`flex-1 bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-black text-[10px] tracking-widest outline-none ${activeTheme.text}`}
                         value={tempPlayer.ign}
                         onChange={e => setTempPlayer({...tempPlayer, ign: e.target.value})}
                         onKeyPress={(e) => e.key === 'Enter' && handleAddRegPlayer()}
                       />
                       <button onClick={handleAddRegPlayer} className={`${activeTheme.primary} text-white px-8 rounded-2xl shadow-lg transition-transform active:scale-95`}><Plus size={24}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       {regForm.players.map(p => (
                         <div key={p.id} className="p-4 bg-gray-500/5 border border-white/5 rounded-2xl flex justify-between items-center animate-in slide-in-from-left-2">
                           <span className={`text-xs font-bold truncate tracking-tight uppercase ${activeTheme.text}`}>{p.ign}</span>
                           <button onClick={() => setRegForm({...regForm, players: regForm.players.filter(px => px.id !== p.id)})} className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-colors">
                             <X size={16}/>
                           </button>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                   <div className="space-y-6">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> PAYMENT AUTHENTICATION
                     </h3>
                     <div className="bg-[#05070a] rounded-[3rem] p-10 border border-emerald-500/10 flex flex-col items-center gap-8 shadow-2xl">
                       <div className="w-64 h-64 bg-white p-5 rounded-[2.5rem] shadow-2xl relative">
                          <img src={state.settings.paymentQrUrl} className="w-full h-full object-contain" alt="Payment QR" />
                          <div className="absolute -bottom-4 right-4 bg-emerald-500 text-white p-4 rounded-2xl shadow-xl">
                            <QrCode size={24} />
                          </div>
                       </div>
                       <div className="w-full space-y-4">
                         <p className="text-[10px] font-black uppercase text-center text-emerald-500 tracking-[0.4em]">ENTRY FEE: {state.settings.entryFee}</p>
                         <div className="flex items-center gap-3 bg-white/5 p-5 rounded-2xl w-full border border-white/5 group">
                            <p className="flex-1 font-mono text-[11px] truncate tracking-tight text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity">{state.settings.upiHandle}</p>
                            <button onClick={() => navigator.clipboard.writeText(state.settings.upiHandle)} className="p-3 bg-indigo-500 rounded-xl text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                              <Clipboard size={18}/>
                            </button>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">UPI Reference Identity</label>
                         <input 
                           placeholder="Enter 12-digit reference"
                           className={`w-full bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-6 py-5 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${activeTheme.text}`}
                           value={regForm.transactionId}
                           onChange={e => setRegForm({...regForm, transactionId: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-4">Combat Proof Image</label>
                         <div className="relative group">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleScreenshotUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`w-full py-16 rounded-[2.5rem] border-2 border-dashed transition-all ${regForm.screenshotUrl ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-gray-500/5 group-hover:bg-gray-500/10'} flex flex-col items-center gap-4`}>
                               {regForm.screenshotUrl ? (
                                 <><CheckCircle2 size={48} className="text-emerald-500"/><span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">PROOF VALIDATED</span></>
                               ) : (
                                 <><ImageIcon size={48} className="opacity-10"/><span className="text-[10px] font-black uppercase opacity-30 tracking-widest">UPLOAD SUCCESS RECEIPT</span></>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="mt-16 pt-10 border-t border-white/5">
                <button 
                  onClick={handleSubmitRegistration}
                  className={`w-full ${activeTheme.primary} text-white font-black uppercase text-xs tracking-[0.5em] py-8 rounded-[2rem] shadow-2xl flex items-center justify-center gap-5 transition-all active:scale-[0.98] hover:shadow-indigo-500/30 group`}
                >
                   AUTHORIZE & SUBMIT SQUAD <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <p className={`text-center text-[10px] font-bold opacity-20 mt-10 tracking-[0.2em] uppercase italic`}>
                  PRO-LEVEL COMPLIANCE: SYSTEM FRAUD DETECTION IS OPERATIONAL.
                </p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
