export type UserProfile = {
  uid: string;
  displayName: string;
  level: number;
  xp: number;
  streak: number;
  bestStreak: number;
  createdAt: number;
  lastActiveAt: number;
};

export type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  dailyReminderTime: string;
};

export type Subject = {
  id: string;
  name: string;
  weekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  room: string;
  teacher: string;
  color: string;
  totalSessions: number;
  attendedSessions: number;
  createdAt: number;
};

export type AttendanceSession = {
  id: string;
  subjectId: string;
  subjectName: string;
  date: number;
  weekday: number;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'attended' | 'missed';
  checkedInAt: number | null;
  xpAwarded: number;
  streakBonus: number;
  reasonRequired: boolean;
  createdAt: number;
  updatedAt: number;
};

export type DailySummary = {
  dateKey: string; // Format: YYYY-MM-DD
  date: number;
  scheduledSessions: number;
  attendedSessions: number;
  missedSessions: number;
  pendingSessions: number;
  completedAllSessions: boolean;
  qualifiesForStreak: boolean;
  breaksStreak: boolean;
  streakCount: number;
  bestStreak: number;
  baseXpEarned: number;
  completionBonusEarned: number;
  streakBonusEarned: number;
  totalXpEarned: number;
  streakMaintained: boolean;
  updatedAt: number;
};

export type ReasonLog = {
  id: string;
  sessionId: string;
  subjectId: string;
  reason: string;
  date: number;
};

export type BadgeId =
  | 'first-attend'
  | 'streak-3'
  | 'streak-7'
  | 'perfect-week'
  | 'no-skip-week'
  | 'comeback';

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
};

export type BadgeDefinition = Omit<Badge, 'unlockedAt'>;

export type BadgeStatus = BadgeDefinition & {
  unlocked: boolean;
  unlockedAt: number | null;
};
