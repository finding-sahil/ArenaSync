
import React, { useReducer, useEffect, createContext, useContext, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, Users, Gamepad2, LogOut, Menu, X, ListOrdered, Settings as SettingsIcon, Activity, Megaphone } from 'lucide-react';
import { AppState, Action, Role, ThemeType, UserAccount, Permission } from './types';
import { INITIAL_STATE, THEMES } from './constants';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import TournamentDetail from './pages/TournamentDetail';
import Standings from './pages/Standings';
import Login from './pages/Login';
import Settings from './pages/Settings';

const DataContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);
const AuthContext = createContext<{ user: UserAccount | null; logout: () => void } | undefined>(undefined);
const ThemeContext = createContext<{ theme: ThemeType; setTheme: (t: ThemeType) => void } | undefined>(undefined);

function stateReducer(state: AppState, action: Action): AppState {
  const ts = new Date().toISOString();
  switch (action.type) {
    case 'SET_USER': return { ...state, currentUser: action.payload };
    case 'SIGN_UP': return { ...state, accounts: [...state.accounts, action.payload] };
    case 'TOGGLE_BAN_USER': return { ...state, accounts: state.accounts.map(a => a.secureId === action.payload ? { ...a, isBanned: !a.isBanned } : a) };
    case 'LOGIN_FAILURE': {
      const attempts = (state.loginAttempts[action.payload] || 0) + 1;
      const lockout = attempts >= 5 ? Date.now() + 60000 : 0;
      return {
        ...state,
        loginAttempts: { ...state.loginAttempts, [action.payload]: attempts },
        lockoutUntil: { ...state.lockoutUntil, [action.payload]: lockout }
      };
    }
    case 'ADD_LOG': return { ...state, logs: [{ ...action.payload, id: `l-${Date.now()}`, timestamp: ts }, ...state.logs].slice(0, 100) };
    case 'ADD_TOURNAMENT': return { ...state, tournaments: [...state.tournaments, action.payload] };
    case 'UPDATE_TOURNAMENT': return { ...state, tournaments: state.tournaments.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TOURNAMENT': return { ...state, tournaments: state.tournaments.filter(t => t.id !== action.payload) };
    case 'ADD_TEAM': return { ...state, teams: [...state.teams, action.payload] };
    case 'UPDATE_TEAM': return { ...state, teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'TOGGLE_TEAM_LOCK': return { ...state, teams: state.teams.map(t => t.id === action.payload ? { ...t, rosterLocked: !t.rosterLocked } : t) };
    case 'DELETE_TEAM': return { ...state, teams: state.teams.filter(t => t.id !== action.payload) };
    case 'ADD_MATCH': return { ...state, matches: [...state.matches, action.payload] };
    case 'UPDATE_MATCH': return { 
      ...state, 
      matches: state.matches.map(m => m.id === action.payload.match.id ? { 
        ...action.payload.match, 
        modifiedBy: action.payload.author, 
        modificationReason: action.payload.reason 
      } : m) 
    };
    case 'ADD_INCIDENT': return {
      ...state,
      matches: state.matches.map(m => m.id === action.payload.matchId ? {
        ...m,
        incidents: [...m.incidents, action.payload.incident]
      } : m)
    };
    case 'ADD_ANNOUNCEMENT': return {
      ...state,
      tournaments: state.tournaments.map(t => t.id === action.payload.tournamentId ? {
        ...t,
        announcements: [action.payload.announcement, ...t.announcements]
      } : t)
    };
    case 'DELETE_MATCH': return { ...state, matches: state.matches.filter(m => m.id !== action.payload) };
    case 'ADD_REGISTRATION': return { ...state, registrations: [...state.registrations, action.payload] };
    case 'APPROVE_REGISTRATION': {
      const reg = state.registrations.find(r => r.id === action.payload.regId);
      if (!reg) return state;
      const newTeam = { id: action.payload.teamId, name: reg.teamName, tag: reg.teamTag, players: reg.players, substitutes: reg.substitutes, rosterLocked: true, managerId: reg.submittedBy };
      return { 
        ...state, 
        teams: [...state.teams, newTeam],
        registrations: state.registrations.map(r => r.id === action.payload.regId ? { ...r, status: 'APPROVED' } : r),
        tournaments: state.tournaments.map(t => t.id === reg.tournamentId ? { ...t, teamIds: [...t.teamIds, newTeam.id] } : t)
      };
    }
    case 'REJECT_REGISTRATION': return { ...state, registrations: state.registrations.map(r => r.id === action.payload ? { ...r, status: 'REJECTED' } : r) };
    case 'UPDATE_SETTINGS': return { ...state, settings: action.payload };
    case 'IMPORT_STATE': return action.payload;
    case 'RESET_DATA': return { ...INITIAL_STATE, accounts: state.accounts };
    default: return state;
  }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useContext(AuthContext)!;
  const { state } = useContext(DataContext)!;
  const { theme } = useContext(ThemeContext)!;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeTheme = THEMES[theme];

  const navigation = [
    { name: 'Hub', href: '/', icon: LayoutDashboard, roles: [Role.PLAYER, Role.TEAM_MANAGER, Role.HOST, Role.ADMIN, Role.SUPER_ADMIN] },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy, roles: [Role.HOST, Role.ADMIN, Role.SUPER_ADMIN] },
    { name: 'Operations', href: '/matches', icon: Gamepad2, roles: [Role.HOST, Role.ADMIN, Role.SUPER_ADMIN] },
    { name: 'Elite Squads', href: '/teams', icon: Users, roles: [Role.TEAM_MANAGER, Role.ADMIN, Role.SUPER_ADMIN] },
    { name: 'Settings', href: '/settings', icon: SettingsIcon, roles: [Role.PLAYER, Role.TEAM_MANAGER, Role.HOST, Role.ADMIN, Role.SUPER_ADMIN] },
  ].filter(item => item.roles.includes(user?.role!));

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${activeTheme.bg} ${activeTheme.text} transition-all font-inter`}>
      <header className={`md:hidden sticky top-0 z-[60] flex items-center justify-between px-6 py-4 ${activeTheme.sidebar} border-b ${activeTheme.border}`}>
        <div className="flex items-center gap-3">
          <Activity size={24} className={activeTheme.accent} />
          <span className="font-oswald text-lg font-bold uppercase italic">{state.settings.appName}</span>
        </div>
        <button onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
      </header>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-[70] md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed md:sticky top-0 h-full md:h-screen z-[80] flex flex-col w-72 md:w-64 ${activeTheme.sidebar} border-r ${activeTheme.border} transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-gray-100/10">
          <div className="flex items-center gap-3">
             <Activity size={24} className={activeTheme.accent} />
             <span className="font-oswald text-xl font-bold uppercase italic">{state.settings.appName}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${location.pathname === item.href ? activeTheme.navActive + ' shadow-lg' : 'opacity-40 hover:opacity-100'} font-bold uppercase text-[10px] tracking-widest`}>
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
          <Link to="/standings/overall" className={`flex items-center gap-4 px-5 py-4 rounded-2xl opacity-40 hover:opacity-100 font-bold uppercase text-[10px] tracking-widest`}>
            <ListOrdered size={18} />
            <span>Leaderboards</span>
          </Link>
        </nav>
        <div className="p-6 border-t border-gray-100/10">
          <div className="flex items-center gap-4 p-4 bg-gray-500/5 rounded-2xl">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-oswald font-bold shadow-md ${activeTheme.primary} text-white`}>{user?.username?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate uppercase">{user?.username}</p>
              <p className={`text-[8px] uppercase opacity-40 tracking-widest`}>{user?.role.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="p-2 text-red-500 hover:scale-110"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 max-w-7xl mx-auto px-8 py-10 w-full overflow-hidden">{children}</main>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('theme') as ThemeType) || 'dark');
  const [state, dispatch] = useReducer(stateReducer, INITIAL_STATE, (init) => {
    const saved = localStorage.getItem('state');
    return saved ? JSON.parse(saved) : init;
  });

  useEffect(() => localStorage.setItem('state', JSON.stringify(state)), [state]);
  useEffect(() => localStorage.setItem('theme', theme), [theme]);

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    localStorage.removeItem('auth');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <DataContext.Provider value={{ state, dispatch }}>
        <AuthContext.Provider value={{ user: state.currentUser, logout }}>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={state.currentUser ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
              <Route path="/tournaments" element={state.currentUser ? <Layout><Tournaments /></Layout> : <Navigate to="/login" />} />
              <Route path="/tournaments/:id" element={state.currentUser ? <Layout><TournamentDetail /></Layout> : <Navigate to="/login" />} />
              <Route path="/matches" element={state.currentUser ? <Layout><Matches /></Layout> : <Navigate to="/login" />} />
              <Route path="/teams" element={state.currentUser ? <Layout><Teams /></Layout> : <Navigate to="/login" />} />
              <Route path="/standings/overall" element={state.currentUser ? <Layout><Standings type="overall" /></Layout> : <Navigate to="/login" />} />
              <Route path="/settings" element={state.currentUser ? <Layout><Settings /></Layout> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </HashRouter>
        </AuthContext.Provider>
      </DataContext.Provider>
    </ThemeContext.Provider>
  );
}

export const useData = () => useContext(DataContext)!;
export const useAuth = () => useContext(AuthContext)!;
export const useTheme = () => useContext(ThemeContext)!;
