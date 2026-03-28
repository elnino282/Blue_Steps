import { format, startOfWeek } from 'date-fns';

import { AttendanceSession, DailySummary } from '@/types';
import { getDateKey, isSessionMissed, sortSessionsByTime } from '@/lib/attendance';

export const XP_VALUES = {
  attendance: 60,
  streakDailyBonus: 10,
  perfectDayBonus: 20,
} as const;

export type XpProgress = {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  requiredXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  nextLevel: number;
};

export type WeeklySummary = {
  weekKey: string;
  totalScheduledSessions: number;
  totalAttendedSessions: number;
  totalMissedSessions: number;
  studyDays: number;
  allResolved: boolean;
  allSessionsAttended: boolean;
  everyStudyDayHadAttendance: boolean;
};

export function requiredXpForLevel(level: number) {
  const safeLevel = Math.max(Math.floor(level), 1);
  return Math.round(100 * 1.2 ** (safeLevel - 1));
}

export function getLevelFromTotalXp(totalXp: number) {
  const safeXp = Math.max(Math.floor(totalXp), 0);
  let level = 1;
  let remainingXp = safeXp;

  while (remainingXp >= requiredXpForLevel(level)) {
    remainingXp -= requiredXpForLevel(level);
    level += 1;
  }

  return level;
}

export function getXpProgress(totalXp: number): XpProgress {
  const safeXp = Math.max(Math.floor(totalXp), 0);
  let level = 1;
  let consumedXp = 0;

  while (safeXp >= consumedXp + requiredXpForLevel(level)) {
    consumedXp += requiredXpForLevel(level);
    level += 1;
  }

  const requiredXp = requiredXpForLevel(level);
  const currentLevelXp = safeXp - consumedXp;
  const xpToNextLevel = Math.max(requiredXp - currentLevelXp, 0);
  const progressPercent =
    requiredXp === 0 ? 100 : Math.max(Math.min(Math.round((currentLevelXp / requiredXp) * 100), 100), 0);

  return {
    level,
    totalXp: safeXp,
    currentLevelXp,
    requiredXp,
    xpToNextLevel,
    progressPercent,
    nextLevel: level + 1,
  };
}

export function getEffectiveSessionStatus(session: AttendanceSession, now = new Date()) {
  if (session.status === 'scheduled' && isSessionMissed(session, now)) {
    return 'missed';
  }

  return session.status;
}

export function buildDailySummariesFromSessions(
  sessions: AttendanceSession[],
  now = new Date()
): DailySummary[] {
  const groupedSessions = new Map<string, AttendanceSession[]>();

  for (const session of sortSessionsByTime(sessions)) {
    const dateKey = getDateKey(new Date(session.date));
    const existingSessions = groupedSessions.get(dateKey) ?? [];
    existingSessions.push(session);
    groupedSessions.set(dateKey, existingSessions);
  }

  const summaries = [...groupedSessions.entries()]
    .map(([dateKey, daySessions]) => {
      const scheduledSessions = daySessions.length;
      const attendedSessions = daySessions.filter(
        (session) => getEffectiveSessionStatus(session, now) === 'attended'
      ).length;
      const missedSessions = daySessions.filter(
        (session) => getEffectiveSessionStatus(session, now) === 'missed'
      ).length;
      const pendingSessions = Math.max(scheduledSessions - attendedSessions - missedSessions, 0);
      const baseXpEarned = daySessions.reduce((total, session) => total + (session.xpAwarded ?? 0), 0);
      const streakBonusEarned = daySessions.reduce((total, session) => total + (session.streakBonus ?? 0), 0);
      const completionBonusEarned = Math.max(
        baseXpEarned - attendedSessions * XP_VALUES.attendance,
        0
      );

      const summary: DailySummary = {
        dateKey,
        date: daySessions[0]?.date ?? Date.now(),
        scheduledSessions,
        attendedSessions,
        missedSessions,
        pendingSessions,
        completedAllSessions: scheduledSessions > 0 && attendedSessions === scheduledSessions,
        qualifiesForStreak: attendedSessions > 0,
        breaksStreak:
          scheduledSessions > 0 &&
          attendedSessions === 0 &&
          missedSessions === scheduledSessions &&
          pendingSessions === 0,
        streakCount: 0,
        bestStreak: 0,
        baseXpEarned,
        completionBonusEarned,
        streakBonusEarned,
        totalXpEarned: baseXpEarned + streakBonusEarned,
        streakMaintained: false,
        updatedAt: now.getTime(),
      };

      return summary;
    })
    .sort((left, right) => left.date - right.date);

  let currentStreak = 0;
  let bestStreak = 0;

  for (const summary of summaries) {
    if (summary.qualifiesForStreak) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
      summary.streakCount = currentStreak;
      summary.bestStreak = bestStreak;
      summary.streakMaintained = currentStreak > 1;
      continue;
    }

    if (summary.breaksStreak) {
      currentStreak = 0;
    }

    summary.streakCount = currentStreak;
    summary.bestStreak = bestStreak;
    summary.streakMaintained = false;
  }

  return summaries;
}

export function getCurrentAndBestStreak(summaries: DailySummary[]) {
  let currentStreak = 0;
  let bestStreak = 0;

  for (const summary of summaries) {
    bestStreak = Math.max(bestStreak, summary.bestStreak);

    if (summary.qualifiesForStreak) {
      currentStreak = summary.streakCount;
      continue;
    }

    if (summary.breaksStreak) {
      currentStreak = 0;
    }
  }

  return {
    currentStreak,
    bestStreak,
  };
}

export function getWeekKey(dateLike: number | Date) {
  return format(startOfWeek(new Date(dateLike), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function buildWeeklySummaries(summaries: DailySummary[]): WeeklySummary[] {
  const groupedWeeks = new Map<string, DailySummary[]>();

  for (const summary of summaries) {
    const weekKey = getWeekKey(summary.date);
    const existingSummaries = groupedWeeks.get(weekKey) ?? [];
    existingSummaries.push(summary);
    groupedWeeks.set(weekKey, existingSummaries);
  }

  return [...groupedWeeks.entries()]
    .map(([weekKey, weekSummaries]) => {
      const totalScheduledSessions = weekSummaries.reduce(
        (total, summary) => total + summary.scheduledSessions,
        0
      );
      const totalAttendedSessions = weekSummaries.reduce(
        (total, summary) => total + summary.attendedSessions,
        0
      );
      const totalMissedSessions = weekSummaries.reduce(
        (total, summary) => total + summary.missedSessions,
        0
      );
      const allResolved = weekSummaries.every((summary) => summary.pendingSessions === 0);

      return {
        weekKey,
        totalScheduledSessions,
        totalAttendedSessions,
        totalMissedSessions,
        studyDays: weekSummaries.length,
        allResolved,
        allSessionsAttended:
          allResolved &&
          totalScheduledSessions > 0 &&
          totalAttendedSessions === totalScheduledSessions,
        everyStudyDayHadAttendance:
          allResolved &&
          weekSummaries.length > 0 &&
          weekSummaries.every((summary) => summary.attendedSessions > 0),
      } satisfies WeeklySummary;
    })
    .sort((left, right) => left.weekKey.localeCompare(right.weekKey));
}
