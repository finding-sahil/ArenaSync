
import { ThemeType, AppState, Role, TournamentType, Team, Match, Tournament, UserAccount, Permission } from './types';

export const OFFICIAL_MAPS = ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra'];

export interface ThemeColors {
  name: string;
  bg: string;
  sidebar: string;
  card: string;
  text: string;
  textMuted: string;
  accent: string;
  primary: string;
  primaryHex: string;
  border: string;
  navActive: string;
  tableRank: string;
  tableTeam: string;
  tableKills: string;
  tablePoints: string;
  chartGrid: string;
}

export const THEMES: Record<ThemeType, ThemeColors> = {
  light: {
    name: 'Garena Light', bg: 'bg-white', sidebar: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900',
    textMuted: 'text-gray-500', accent: 'text-indigo-600', primary: 'bg-indigo-600', primaryHex: '#4f46e5',
    border: 'border-gray-200', navActive: 'bg-indigo-50 text-indigo-600', tableRank: 'text-gray-400',
    tableTeam: 'text-gray-900', tableKills: 'text-gray-700', tablePoints: 'text-indigo-600', chartGrid: '#e5e7eb'
  },
  dark: {
    name: 'Midnight Pro', bg: 'bg-[#0b0f1a]', sidebar: 'bg-[#070b14]', card: 'bg-[#141b2d]', text: 'text-slate-50',
    textMuted: 'text-slate-400', accent: 'text-blue-400', primary: 'bg-blue-600', primaryHex: '#2563eb',
    border: 'border-slate-800', navActive: 'bg-blue-600/10 text-blue-400', tableRank: 'text-slate-500',
    tableTeam: 'text-slate-100', tableKills: 'text-slate-300', tablePoints: 'text-blue-400', chartGrid: '#1e293b'
  },
  orange: {
    name: 'Booyah Orange', bg: 'bg-[#fff7ed]', sidebar: 'bg-white', card: 'bg-white', text: 'text-orange-950',
    textMuted: 'text-orange-400', accent: 'text-orange-600', primary: 'bg-orange-600', primaryHex: '#ea580c',
    border: 'border-orange-100', navActive: 'bg-orange-600 text-white', tableRank: 'text-orange-300',
    tableTeam: 'text-orange-950', tableKills: 'text-orange-800', tablePoints: 'text-orange-600', chartGrid: '#ffedd5'
  },
  neon: {
    name: 'Cyber Neon', bg: 'bg-[#030014]', sidebar: 'bg-[#0b001c]', card: 'bg-[#160033]', text: 'text-cyan-50',
    textMuted: 'text-fuchsia-400/60', accent: 'text-fuchsia-400', primary: 'bg-fuchsia-600', primaryHex: '#d946ef',
    border: 'border-cyan-500/20', navActive: 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]',
    tableRank: 'text-cyan-700', tableTeam: 'text-white', tableKills: 'text-cyan-300', tablePoints: 'text-fuchsia-500', chartGrid: '#1e1b4b'
  },
  aggressive: {
    name: 'Red Fury', bg: 'bg-black', sidebar: 'bg-black', card: 'bg-[#0f0f0f]', text: 'text-white',
    textMuted: 'text-red-950', accent: 'text-red-600', primary: 'bg-red-600', primaryHex: '#dc2626',
    border: 'border-red-900/30', navActive: 'bg-red-600 text-white', tableRank: 'text-zinc-800',
    tableTeam: 'text-red-500', tableKills: 'text-white', tablePoints: 'text-red-600', chartGrid: '#1a1a1a'
  },
  tech: {
    name: 'Steel Tech', bg: 'bg-[#0f172a]', sidebar: 'bg-[#0b0f1a]', card: 'bg-[#1e293b]', text: 'text-emerald-50',
    textMuted: 'text-slate-500', accent: 'text-emerald-400', primary: 'bg-emerald-500', primaryHex: '#10b981',
    border: 'border-emerald-500/10', navActive: 'bg-emerald-500/10 text-emerald-400', tableRank: 'text-slate-600',
    tableTeam: 'text-emerald-50', tableKills: 'text-emerald-200', tablePoints: 'text-sky-500', chartGrid: '#1e293b'
  }
};

const mockTeams: Team[] = Array.from({ length: 12 }, (_, i) => ({
  id: `team-${i + 1}`,
  name: `ELITE SQUAD ${i + 1}`,
  tag: `SQD${i + 1}`,
  logoUrl: '',
  players: Array.from({ length: 4 }, (_, j) => ({
    id: `p-${i}-${j}`,
    name: `Player ${i * 4 + j + 1}`,
    ign: `PRO_X_${i * 4 + j + 1}`
  })),
  substitutes: [],
  rosterLocked: true,
  managerId: `mgr-${i + 1}`
}));

const mockTournaments: Tournament[] = [
  {
    id: 't-1',
    name: 'Garena Pro League S1',
    type: TournamentType.SQUAD,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    teamIds: mockTeams.map(t => t.id),
    scoringSystem: 'STANDARD_GARENA',
    status: 'ONGOING',
    announcements: [
      { id: 'a-1', title: 'Fair Play Notice', content: 'All third-party tools are strictly prohibited.', targetRoles: [Role.PLAYER, Role.TEAM_MANAGER], author: 'Root', timestamp: new Date().toISOString(), type: 'URGENT' }
    ]
  },
  {
    id: 't-2',
    name: 'Bermuda Challengers',
    type: TournamentType.SQUAD,
    startDate: '2025-04-10',
    endDate: '2025-05-10',
    teamIds: mockTeams.slice(0, 8).map(t => t.id),
    scoringSystem: 'STANDARD_GARENA',
    status: 'UPCOMING',
    announcements: []
  }
];

const mockMatches: Match[] = Array.from({ length: 5 }, (_, i) => ({
  id: `m-${i + 1}`,
  tournamentId: 't-1',
  roundNumber: i + 1,
  map: OFFICIAL_MAPS[i % OFFICIAL_MAPS.length],
  scheduledTime: new Date(Date.now() - (5 - i) * 86400000).toISOString(),
  durationMinutes: 20,
  status: 'COMPLETED',
  results: mockTeams.map((t, idx) => ({
    teamId: t.id,
    placement: (idx + i) % 12 + 1,
    kills: Math.floor(Math.random() * 15),
    penalty: 0,
    playersPresent: t.players.map(p => p.id)
  })),
  incidents: []
}));

const mockAccounts: UserAccount[] = [
  { secureId: 'MGR-7080-SAH', username: 'Sahil', role: Role.TEAM_MANAGER, mobile: '918888888888', passwordHash: btoa('password'), isBanned: false, permissions: [Permission.MANAGE_ROSTERS] },
  { secureId: 'PLR-5678-ROH', username: 'Rohit', role: Role.PLAYER, mobile: '917777777777', passwordHash: btoa('password'), isBanned: false, permissions: [] },
  { secureId: 'HST-LOBBY', username: 'Default Host', role: Role.HOST, mobile: 'SYSTEM', passwordHash: btoa('hostpass'), isBanned: false, permissions: [Permission.OVERRIDE_SCORES] },
];

export const INITIAL_STATE: AppState = {
  tournaments: mockTournaments,
  teams: mockTeams,
  matches: mockMatches,
  registrations: [],
  logs: [{ id: 'l1', timestamp: new Date().toISOString(), user: 'System', role: Role.SUPER_ADMIN, action: 'Initialize', details: 'Forensic integrity module active.', type: 'info' }],
  accounts: mockAccounts,
  currentUser: null,
  currentTheme: 'dark',
  loginAttempts: {},
  lockoutUntil: {},
  settings: {
    appName: 'ArenaSync Pro',
    upiHandle: 'arenasync@upi',
    entryFee: '₹100',
    paymentQrUrl: 'https://i.ibb.co/Lz0Y8yF/payment-qr.jpg',
    scoring: { 
      placementPoints: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0 },
      pointsPerKill: 1,
      maxKillThreshold: 25 
    },
    maps: [...OFFICIAL_MAPS],
    systemIds: {
      superAdmin: { id: 'SA-ROOT', key: 'SUPER-SECURE-2025' },
      admin: { id: 'ADM-HUB', key: 'ADMIN-ACCESS-777' },
      host: { id: 'HST-LOBBY', key: 'HOST-ENTRY-888' }
    }
  }
};
