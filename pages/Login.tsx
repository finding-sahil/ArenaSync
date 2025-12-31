
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, useTheme } from '../App';
import { THEMES } from '../constants';
import { 
  Activity, ShieldCheck, ArrowRight, KeyRound, UserPlus, 
  AlertTriangle, Eye, EyeOff, Smartphone, Instagram, 
  Send, Info, ShieldAlert, Cpu, Globe, Lock, User
} from 'lucide-react';
import { Role, UserAccount, Permission } from '../types';

export default function Login() {
  const { state, dispatch } = useData();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const activeTheme = THEMES[theme];

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [form, setForm] = useState({ id: '', key: '' });
  const [signup, setSignup] = useState({ name: '', role: Role.PLAYER, mobile: '', insta: '', discord: '' });
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [newIdentity, setNewIdentity] = useState<{id: string, key: string} | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (state.lockoutUntil[form.id] && Date.now() < state.lockoutUntil[form.id]) {
      const wait = Math.ceil((state.lockoutUntil[form.id] - Date.now()) / 1000);
      setError(`Terminal Locked. Retry in ${wait}s`);
      return;
    }

    const sys = state.settings.systemIds;
    let authUser: UserAccount | null = null;

    // Fix: Added missing permissions property to system accounts
    if (form.id === sys.superAdmin.id && form.key === sys.superAdmin.key) {
      authUser = { secureId: form.id, username: 'Super Admin', role: Role.SUPER_ADMIN, mobile: 'SYSTEM', passwordHash: 'ENCRYPTED', permissions: Object.values(Permission) };
    } else if (form.id === sys.admin.id && form.key === sys.admin.key) {
      authUser = { secureId: form.id, username: 'Admin Hub', role: Role.ADMIN, mobile: 'SYSTEM', passwordHash: 'ENCRYPTED', permissions: [Permission.MANAGE_ROSTERS, Permission.ISSUE_BROADCASTS] };
    } else if (form.id === sys.host.id && form.key === sys.host.key) {
      authUser = { secureId: form.id, username: 'Lobby Host', role: Role.HOST, mobile: 'SYSTEM', passwordHash: 'ENCRYPTED', permissions: [Permission.OVERRIDE_SCORES] };
    } else {
      const acc = state.accounts.find(a => a.secureId === form.id && a.passwordHash === btoa(form.key));
      if (acc) {
        if (acc.isBanned) {
          setError('IDENTITY TERMINATED: This account has been banned by Super Admin.');
          return;
        }
        authUser = acc;
      }
    }

    if (authUser) {
      dispatch({ type: 'SET_USER', payload: authUser });
      dispatch({ type: 'ADD_LOG', payload: { user: authUser.username, role: authUser.role, action: 'Access Granted', details: `Secure session initialized for ${authUser.secureId}`, type: 'success' } });
      navigate('/');
    } else {
      dispatch({ type: 'LOGIN_FAILURE', payload: form.id });
      setError('Identity authentication failed. Access denied.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = signup.role === Role.TEAM_MANAGER ? 'MGR' : 'PLR';
    const sId = `${prefix}-${Math.floor(1000 + Math.random() * 8999)}-${signup.name.toUpperCase().slice(0, 3)}`;
    const sKey = `KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
    
    // Fix: Added missing permissions property to signup account
    const newUser: UserAccount = {
      secureId: sId,
      username: signup.name,
      role: signup.role,
      mobile: signup.mobile,
      insta: signup.insta,
      discord: signup.discord,
      passwordHash: btoa(sKey),
      permissions: []
    };

    dispatch({ type: 'SIGN_UP', payload: newUser });
    dispatch({ type: 'ADD_LOG', payload: { user: signup.name, role: signup.role, action: 'Identity Created', details: `New secure ID issued: ${sId}`, type: 'info' } });
    
    setNewIdentity({ id: sId, key: sKey });
    setMode('LOGIN');
    setForm({ id: sId, key: '' });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#030508] text-white font-inter overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="w-full md:w-1/2 p-12 flex flex-col justify-between relative z-10 border-r border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Activity size={32} />
          </div>
          <span className="font-orbitron font-black text-xl tracking-[0.3em] italic uppercase text-indigo-400">ARENASYNC</span>
        </div>

        <div className="space-y-8 max-w-lg">
          <h2 className="text-6xl font-oswald font-bold leading-none italic uppercase tracking-tighter">
            PRO-GRADE <br />
            <span className="text-indigo-500">MANAGEMENT</span> <br />
            FOR ELITE SQUADS.
          </h2>
          <p className="text-slate-400 font-medium leading-relaxed">
            The world's most advanced logistics hub for Free Fire Max Esports. Validated Garena scoring, secure roster registry, and real-time combat analytics.
          </p>
          <div className="flex gap-8 pt-4">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-orbitron font-bold text-white italic">24/7</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">SECURE OPERATIONS</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-orbitron font-bold text-indigo-500 italic">V3.5</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">SYSTEM ARCHITECTURE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">End-to-End Encryption</span>
          </div>
          <div className="h-px w-12 bg-white/5"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Garena Verified v2025</span>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20 relative z-10">
        <div className="w-full max-w-md space-y-10">
          <div className="flex justify-between items-end border-b border-white/5 pb-6">
            <div>
              <h3 className="text-2xl font-oswald font-bold uppercase italic">{mode === 'LOGIN' ? 'Access Terminal' : 'Join Registry'}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Status: Operational</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button onClick={() => setMode('LOGIN')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>SIGN IN</button>
              <button onClick={() => setMode('SIGNUP')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>SIGN UP</button>
            </div>
          </div>

          {newIdentity && (
            <div className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-indigo-400" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Identity Protocol Success</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Please record your operational credentials immediately. They are encrypted and non-recoverable.</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between">
                  <span className="text-[9px] font-black opacity-40 uppercase">Secure ID</span>
                  <span className="font-mono text-indigo-400 font-bold">{newIdentity.id}</span>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between">
                  <span className="text-[9px] font-black opacity-40 uppercase">Digital Key</span>
                  <span className="font-mono text-indigo-400 font-bold">{newIdentity.key}</span>
                </div>
              </div>
              <button onClick={() => setNewIdentity(null)} className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-black uppercase rounded-lg transition-all mt-2">I'VE SAVED MY DATA</button>
            </div>
          )}

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-4">Operator ID</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input required value={form.id} onChange={e => setForm({...form, id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 outline-none focus:ring-2 focus:ring-indigo-500/40 text-white font-mono placeholder:text-slate-800 transition-all" placeholder="ID-XXXX-XXX" />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-4">Secure Passkey</label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input type={showKey ? 'text' : 'password'} required value={form.key} onChange={e => setForm({...form, key: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-16 outline-none focus:ring-2 focus:ring-indigo-500/40 text-white font-mono placeholder:text-slate-800 transition-all" placeholder="••••••••••••" />
                    <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">{showKey ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 animate-pulse"><AlertTriangle size={14}/> {error}</p>}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 group transition-all active:scale-[0.98]">
                AUTHENTICATE <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <input required placeholder="Operator Full Name" value={signup.name} onChange={e => setSignup({...signup, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-2xl py-5 px-8 outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm font-bold" />
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setSignup({...signup, role: Role.PLAYER})} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${signup.role === Role.PLAYER ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/5 text-slate-600'}`}>PLAYER</button>
                  <button type="button" onClick={() => setSignup({...signup, role: Role.TEAM_MANAGER})} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${signup.role === Role.TEAM_MANAGER ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/5 text-slate-600'}`}>MANAGER</button>
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input required placeholder="91XXXXXXXX" value={signup.mobile} onChange={e => setSignup({...signup, mobile: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative"><Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} /><input placeholder="Instagram" value={signup.insta} onChange={e => setSignup({...signup, insta: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-xs" /></div>
                  <div className="relative"><Send className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={16} /><input placeholder="Discord" value={signup.discord} onChange={e => setSignup({...signup, discord: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-xs" /></div>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] text-white shadow-2xl shadow-indigo-600/30 mt-4 active:scale-95 transition-all">INITIALIZE IDENTITY</button>
            </form>
          )}

          <div className="text-center pt-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">Garena Secure Access Terminal • v3.5.0-PRO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
