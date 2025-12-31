
import React, { useState } from 'react';
import { useData, useTheme, useAuth } from '../App';
import { THEMES } from '../constants';
import { 
  Settings as SettingsIcon, Palette, Trash2, ShieldAlert, 
  Check, Target, Plus, Lock, Eye, EyeOff, MapPin, X, 
  ChevronRight, Award, Zap, Database, Users as UsersIcon, Ban, Unlock, FileText
} from 'lucide-react';
import { ThemeType, Role, AppSettings } from '../types';
import PdfSettings from './PdfSettings';

export default function Settings() {
  const { state, dispatch } = useData();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const activeTheme = THEMES[theme];

  const tabs = [
    { id: 'visuals', name: 'Aesthetics', roles: [Role.PLAYER, Role.TEAM_MANAGER, Role.HOST, Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'scoring', name: 'Scoring Protocol', roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'maps', name: 'Combat Maps', roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'reports', name: 'PDF Reports', roles: [Role.ADMIN, Role.SUPER_ADMIN] },
    { id: 'members', name: 'Member Registry', roles: [Role.SUPER_ADMIN] },
    { id: 'security', name: 'Identity Core', roles: [Role.SUPER_ADMIN] },
    { id: 'system', name: 'Maintenance', roles: [Role.SUPER_ADMIN] },
  ].filter(t => t.roles.includes(user?.role!));

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'visuals');
  const [newMap, setNewMap] = useState('');
  const [showIds, setShowIds] = useState(false);
  const [editSystemIds, setEditSystemIds] = useState(state.settings.systemIds);

  const updateSettings = (updates: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, ...updates } });
  };

  const handleUpdateScoring = (place: number, points: number) => {
    const newScoring = { ...state.settings.scoring };
    newScoring.placementPoints[place] = points;
    updateSettings({ scoring: newScoring });
  };

  const handleUpdateKillPoints = (points: number) => {
    const newScoring = { ...state.settings.scoring, pointsPerKill: points };
    updateSettings({ scoring: newScoring });
  };

  const handleSaveSystemIds = () => {
    updateSettings({ systemIds: editSystemIds });
    dispatch({ type: 'ADD_LOG', payload: { user: user?.username || 'Root', role: Role.SUPER_ADMIN, action: 'Security Protocol Change', details: 'System access keys updated.', type: 'danger' } });
    alert('Security Protocols Updated: New access keys are now operational.');
  };

  return (
    <div className={`space-y-10 animate-in fade-in duration-500 pb-20 ${activeTheme.text}`}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-oswald font-bold tracking-tight uppercase italic flex items-center gap-4">
            <SettingsIcon size={36} className={activeTheme.accent} /> CENTRAL HUB
          </h1>
          <p className={`${activeTheme.textMuted} text-[10px] font-black uppercase tracking-[0.4em] mt-2`}>System Configuration & Security</p>
        </div>
        <div className="flex bg-gray-500/5 p-2 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-8 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? activeTheme.primary + ' text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {activeTab === 'visuals' && (
          <section className={`${activeTheme.card} p-12 rounded-[3.5rem] border ${activeTheme.border} shadow-sm animate-in slide-in-from-bottom-4`}>
            <div className="flex items-center gap-4 mb-12">
               <div className="p-4 bg-fuchsia-500/10 rounded-2xl text-fuchsia-500 shadow-lg shadow-fuchsia-500/10"><Palette size={28} /></div>
               <div>
                  <h2 className="text-2xl font-oswald font-bold uppercase italic tracking-wider">Interface Protocols</h2>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Select visual skin for the terminal</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Object.keys(THEMES) as ThemeType[]).map(t => (
                <button 
                  key={t} 
                  onClick={() => setTheme(t)} 
                  className={`relative p-8 rounded-[3rem] border-2 transition-all flex flex-col items-start gap-6 group ${theme === t ? 'border-indigo-500 bg-indigo-500/5 shadow-2xl' : 'border-transparent bg-gray-500/5 hover:border-gray-500/20'}`}
                >
                   <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-xl shadow-lg border-2 border-white/10 ${THEMES[t].primary}`} />
                         <div className="text-left">
                            <p className="font-black text-sm uppercase italic tracking-tight">{THEMES[t].name}</p>
                            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-0.5">{t}</p>
                         </div>
                      </div>
                      {theme === t && <div className="p-2 bg-indigo-500 text-white rounded-full shadow-lg"><Check size={14} /></div>}
                   </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'scoring' && (
          <section className={`${activeTheme.card} p-12 rounded-[3.5rem] border ${activeTheme.border} shadow-sm animate-in slide-in-from-bottom-4`}>
            <div className="flex items-center gap-4 mb-12">
               <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 shadow-lg shadow-amber-500/10"><Award size={28} /></div>
               <div>
                  <h2 className="text-2xl font-oswald font-bold uppercase italic tracking-wider">Scoring Architecture</h2>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Validated Garena Official Metrics</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="p-5 bg-gray-500/5 rounded-[1.8rem] border border-white/5 space-y-3">
                      <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Rank #{i+1}</label>
                      <input 
                        type="number" 
                        value={state.settings.scoring.placementPoints[i+1] || 0}
                        onChange={(e) => handleUpdateScoring(i+1, parseInt(e.target.value) || 0)}
                        className={`w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-oswald font-bold text-center text-lg ${activeTheme.text}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap size={20} className="text-indigo-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Combat Points</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">Points per Kill</label>
                    <input 
                      type="number" 
                      value={state.settings.scoring.pointsPerKill}
                      onChange={(e) => handleUpdateKillPoints(parseInt(e.target.value) || 0)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 font-oswald font-bold text-2xl text-indigo-400 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'maps' && (
          <section className={`${activeTheme.card} p-12 rounded-[3.5rem] border ${activeTheme.border} animate-in slide-in-from-bottom-4`}>
            <div className="flex items-center gap-4 mb-12">
               <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/10"><MapPin size={28} /></div>
               <div>
                  <h2 className="text-2xl font-oswald font-bold uppercase italic tracking-wider">Terrain Registry</h2>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Authorized Combat Theaters</p>
               </div>
            </div>
            <div className="flex gap-4 mb-12">
              <input 
                value={newMap} 
                onChange={e => setNewMap(e.target.value)} 
                className={`flex-1 bg-gray-500/5 border ${activeTheme.border} rounded-2xl px-8 py-5 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${activeTheme.text}`} 
                placeholder="Register New Territory Name..." 
              />
              <button 
                onClick={() => { if(newMap) updateSettings({ maps: [...state.settings.maps, newMap] }); setNewMap(''); }} 
                className="px-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-3 transition-all"
              >
                <Plus size={20} /> INITIALIZE
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {state.settings.maps.map(m => (
                <div key={m} className="p-6 bg-gray-500/5 border border-white/5 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/20 transition-all">
                  <span className={`font-black text-sm uppercase italic tracking-widest ${activeTheme.text}`}>{m}</span>
                  <button onClick={() => updateSettings({ maps: state.settings.maps.filter(x => x !== m) })} className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"><X size={18}/></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'reports' && (
          <section className={`${activeTheme.card} p-12 rounded-[3.5rem] border ${activeTheme.border} animate-in slide-in-from-bottom-4`}>
             <PdfSettings />
          </section>
        )}

        {activeTab === 'members' && (
          <section className={`${activeTheme.card} p-12 rounded-[3.5rem] border ${activeTheme.border} shadow-sm animate-in slide-in-from-bottom-4`}>
            <div className="flex items-center gap-4 mb-12">
               <div className="p-4 bg-sky-500/10 rounded-2xl text-sky-500 shadow-lg shadow-sky-500/10"><UsersIcon size={28} /></div>
               <div>
                  <h2 className="text-2xl font-oswald font-bold uppercase italic tracking-wider">Member Registry</h2>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Authorized Account Moderation Hub</p>
               </div>
            </div>
            <div className="space-y-4">
              {state.accounts.map(acc => (
                <div key={acc.secureId} className="flex items-center justify-between p-6 bg-gray-500/5 border border-white/5 rounded-[2rem] hover:border-indigo-500/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-xl ${acc.isBanned ? 'bg-red-600' : activeTheme.primary}`}>{acc.username.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-lg">{acc.username} {acc.isBanned && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded ml-2 font-black uppercase">TERMINATED</span>}</p>
                      <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1">{acc.role.replace('_', ' ')} • {acc.secureId}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        dispatch({ type: 'TOGGLE_BAN_USER', payload: acc.secureId });
                        dispatch({ type: 'ADD_LOG', payload: { user: user?.username || 'Root', role: Role.SUPER_ADMIN, action: acc.isBanned ? 'ACCESS REINSTATED' : 'IDENTITY TERMINATED', details: `${acc.username} (${acc.secureId}) state updated.`, type: acc.isBanned ? 'success' : 'danger' } });
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${acc.isBanned ? 'bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20' : 'bg-red-600/10 text-red-500 hover:bg-red-600/20'}`}
                    >
                      {acc.isBanned ? <Unlock size={16} /> : <Ban size={16} />}
                      {acc.isBanned ? 'REINSTATE' : 'TERMINATE ACCESS'}
                    </button>
                  </div>
                </div>
              ))}
              {state.accounts.length === 0 && <p className="text-center py-20 opacity-30 italic font-bold uppercase tracking-widest">Registry Empty</p>}
            </div>
          </section>
        )}

        {activeTab === 'security' && (
          <section className={`${activeTheme.card} p-12 rounded-[3.5rem] border ${activeTheme.border} animate-in slide-in-from-bottom-4`}>
            <div className="flex items-center gap-4 mb-12">
               <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 shadow-lg shadow-red-500/10"><ShieldAlert size={28} /></div>
               <div>
                  <h2 className="text-2xl font-oswald font-bold uppercase italic tracking-wider">Identity Core</h2>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Master Access Key Configuration</p>
               </div>
            </div>
            <div className="p-10 bg-red-500/5 border border-red-500/10 rounded-[3rem] space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">SUPER ADMIN HUB</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold opacity-20 uppercase ml-2 tracking-widest">Operator ID</label>
                        <input value={editSystemIds.superAdmin.id} onChange={(e) => setEditSystemIds({...editSystemIds, superAdmin: {...editSystemIds.superAdmin, id: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-mono text-[11px] text-red-400 shadow-inner outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold opacity-20 uppercase ml-2 tracking-widest">Access Key</label>
                        <input value={editSystemIds.superAdmin.key} onChange={(e) => setEditSystemIds({...editSystemIds, superAdmin: {...editSystemIds.superAdmin, key: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-mono text-[11px] text-red-400 shadow-inner outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">ADMIN TERMINAL</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold opacity-20 uppercase ml-2 tracking-widest">Operator ID</label>
                        <input value={editSystemIds.admin.id} onChange={(e) => setEditSystemIds({...editSystemIds, admin: {...editSystemIds.admin, id: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-mono text-[11px] text-red-400 shadow-inner outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold opacity-20 uppercase ml-2 tracking-widest">Access Key</label>
                        <input value={editSystemIds.admin.key} onChange={(e) => setEditSystemIds({...editSystemIds, admin: {...editSystemIds.admin, key: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-mono text-[11px] text-red-400 shadow-inner outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">HOST LOBBY</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold opacity-20 uppercase ml-2 tracking-widest">Operator ID</label>
                        <input value={editSystemIds.host.id} onChange={(e) => setEditSystemIds({...editSystemIds, host: {...editSystemIds.host, id: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-mono text-[11px] text-red-400 shadow-inner outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold opacity-20 uppercase ml-2 tracking-widest">Access Key</label>
                        <input value={editSystemIds.host.key} onChange={(e) => setEditSystemIds({...editSystemIds, host: {...editSystemIds.host, key: e.target.value}})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-mono text-[11px] text-red-400 shadow-inner outline-none focus:ring-1 focus:ring-red-500" />
                      </div>
                    </div>
                  </div>
               </div>
               <button onClick={handleSaveSystemIds} className="w-full bg-red-600 hover:bg-red-500 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-xl shadow-red-600/20 active:scale-95 transition-all">COMMIT SYSTEM RESTRUCTURING</button>
            </div>
          </section>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 gap-10 animate-in slide-in-from-bottom-4">
            <section className={`${activeTheme.card} p-16 rounded-[4rem] border border-red-500/20 bg-red-500/5 flex flex-col items-center text-center gap-10 shadow-2xl`}>
              <div className="p-8 bg-red-600 text-white rounded-[2.5rem] shadow-2xl shadow-red-600/30 ring-8 ring-red-600/10"><Trash2 size={56} /></div>
              <div className="space-y-4">
                <h2 className="text-4xl font-oswald font-bold uppercase italic text-red-500 tracking-tighter">NUCLEAR WIPE PROTOCOL</h2>
                <p className="text-sm font-medium opacity-50 max-w-sm mx-auto leading-relaxed">Permanently erases all match logs, rosters, and circuits. System IDs and registered accounts remain intact.</p>
              </div>
              <button onClick={() => { if(confirm("CONFIRM SYSTEM DESTRUCTION?")) dispatch({ type: 'RESET_DATA' }); }} className="w-full max-w-md py-8 rounded-[2rem] bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-[0.5em] shadow-2xl shadow-red-600/20 flex items-center justify-center gap-4">
                 EXECUTE SYSTEM WIPE <Zap size={20} />
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
