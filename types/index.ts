export type UserProfile = {
  uid: string;
  displayName: string;
  level: number;
  xp: number;
  streak: number;
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
  date: number;
  status: 'attended' | 'missed' | 'excused';
  xpEarned: number;
  notes?: string;
};

export type DailySummary = {
  dateKey: string; // Format: YYYY-MM-DD
  totalXpEarned: number;
  sessionsAttended: number;
  sessionsMissed: number;
  streakMaintained: boolean;
};

export type ReasonLog = {
  id: string;
  sessionId: string;
  subjectId: string;
  reason: string;
  date: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
};

