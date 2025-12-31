
export enum Role {
  PLAYER = 'player',
  TEAM_MANAGER = 'team_manager',
  HOST = 'host',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum Permission {
  MANAGE_ROSTERS = 'MANAGE_ROSTERS',
  MANAGE_FINANCES = 'MANAGE_FINANCES',
  OVERRIDE_SCORES = 'OVERRIDE_SCORES',
  ROTATE_KEYS = 'ROTATE_KEYS',
  ISSUE_BROADCASTS = 'ISSUE_BROADCASTS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS'
}

export enum TournamentType {
  SOLO = 'SOLO',
  DUO = 'DUO',
  SQUAD = 'SQUAD'
}

export interface Player {
  id: string;
  name: string;
  ign: string;
  role?: string;
  isSubstitute?: boolean;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logoUrl?: string;
  players: Player[];
  substitutes: Player[];
  rosterLocked: boolean;
  managerId: string;
}

export interface TeamRegistration {
  id: string;
  tournamentId: string;
  teamName: string;
  teamTag: string;
  players: Player[];
  substitutes: Player[];
  transactionId: string;
  screenshotUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  timestamp: string;
}

export interface MatchIncident {
  id: string;
  type: 'PAUSE' | 'RESUME' | 'OVERRIDE' | 'DISPUTE';
  message: string;
  author: string;
  timestamp: string;
}

export interface MatchResult {
  teamId: string;
  placement: number;
  kills: number;
  penalty: number;
  playersPresent: string[]; // IDs of players who played
  anomalyFlag?: boolean;
}

export interface Match {
  id: string;
  tournamentId: string;
  roundNumber: number;
  map: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'UNDER_REVIEW' | 'COMPLETED' | 'VOIDED';
  results: MatchResult[];
  incidents: MatchIncident[];
  modifiedBy?: string;
  modificationReason?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRoles: Role[];
  author: string;
  timestamp: string;
  type: 'INFO' | 'URGENT' | 'MATCH';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  action: string;
  details: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  sessionHash?: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  logoUrl?: string;
  startDate: string;
  endDate: string;
  teamIds: string[];
  scoringSystem: 'STANDARD_GARENA' | 'CUSTOM';
  status: 'UPCOMING' | 'ONGOING' | 'FINISHED';
  tagline?: string;
  organizer?: string;
  venue?: string;
  discord?: string;
  instagram?: string;
  youtube?: string;
  announcements: Announcement[];
}

export interface UserAccount {
  secureId: string;
  username: string;
  role: Role;
  mobile: string;
  insta?: string;
  discord?: string;
  passwordHash: string;
  isBanned?: boolean;
  permissions: Permission[];
  lastLogin?: string;
  deviceHash?: string;
}

export interface ScoringConfig {
  placementPoints: Record<number, number>;
  pointsPerKill: number;
  maxKillThreshold: number; // For anomaly detection
}

export interface AppSettings {
  appName: string;
  upiHandle: string;
  entryFee: string;
  paymentQrUrl: string;
  scoring: ScoringConfig;
  maps: string[];
  systemIds: {
    superAdmin: { id: string; key: string };
    admin: { id: string; key: string };
    host: { id: string; key: string };
  };
}

export interface AppState {
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  registrations: TeamRegistration[];
  logs: ActivityLog[];
  accounts: UserAccount[];
  currentUser: UserAccount | null;
  currentTheme: ThemeType;
  settings: AppSettings;
  loginAttempts: Record<string, number>;
  lockoutUntil: Record<string, number>;
}

export type ThemeType = 'light' | 'dark' | 'orange' | 'neon' | 'aggressive' | 'tech';

export type Action = 
  | { type: 'ADD_TOURNAMENT'; payload: Tournament }
  | { type: 'UPDATE_TOURNAMENT'; payload: Tournament }
  | { type: 'DELETE_TOURNAMENT'; payload: string }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'TOGGLE_TEAM_LOCK'; payload: string }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'UPDATE_MATCH'; payload: { match: Match; reason?: string; author: string } }
  | { type: 'ADD_INCIDENT'; payload: { matchId: string; incident: MatchIncident } }
  | { type: 'DELETE_MATCH'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'ADD_LOG'; payload: Omit<ActivityLog, 'id' | 'timestamp'> }
  | { type: 'ADD_REGISTRATION'; payload: TeamRegistration }
  | { type: 'APPROVE_REGISTRATION'; payload: { regId: string; teamId: string } }
  | { type: 'REJECT_REGISTRATION'; payload: string }
  | { type: 'ADD_ANNOUNCEMENT'; payload: { tournamentId: string; announcement: Announcement } }
  | { type: 'SIGN_UP'; payload: UserAccount }
  | { type: 'TOGGLE_BAN_USER'; payload: string }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SET_USER'; payload: UserAccount | null }
  | { type: 'IMPORT_STATE'; payload: AppState }
  | { type: 'RESET_DATA' };
