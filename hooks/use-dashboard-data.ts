'use client';

import { useMemo } from 'react';

import { useAttendance } from '@/hooks/use-attendance';
import { useAuth } from '@/hooks/use-auth';
import { useSubjects } from '@/hooks/use-subjects';

function getGreeting(displayName?: string) {
  const hour = new Date().getHours();
  const name = displayName || 'Explorer';

  if (hour < 12) {
    return {
      title: `Good morning, ${name}`,
      description: 'A calm start still counts. Check in for your classes and keep today moving.',
    };
  }

  if (hour < 18) {
    return {
      title: `Good afternoon, ${name}`,
      description: 'You are in the middle of the day now. A few honest check-ins go a long way.',
    };
  }

  return {
    title: `Good evening, ${name}`,
    description: 'Close the day with clarity. Mark what you attended and keep your rhythm steady.',
  };
}

export function useDashboardData() {
  const { user, loading: authLoading } = useAuth();
  const {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();
  const attendance = useAttendance();

  const subjectById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  const todaySessions = useMemo(
    () =>
      attendance.sessions.map((session) => {
        const subject = subjectById.get(session.subjectId);
        return {
          ...session,
          color: subject?.color ?? 'oklch(0.6 0.15 250)',
          room: subject?.room ?? '',
          teacher: subject?.teacher ?? '',
        };
      }),
    [attendance.sessions, subjectById]
  );

  const todayProgress = useMemo(() => {
    const total = todaySessions.length;
    const attended = todaySessions.filter((session) => session.status === 'attended').length;
    const missed = todaySessions.filter((session) => session.status === 'missed').length;
    const scheduled = todaySessions.filter((session) => session.status === 'scheduled').length;
    const percent = total === 0 ? 0 : Math.round((attended / total) * 100);

    return {
      total,
      attended,
      missed,
      scheduled,
      percent,
    };
  }, [todaySessions]);

  const userSummary = useMemo(() => {
    const level = user?.level ?? 1;
    const xp = user?.xp ?? 0;
    const streak = user?.streak ?? 0;
    const nextLevelXp = level * 250;
    const currentLevelFloor = Math.max((level - 1) * 250, 0);
    const progressToNextLevel = Math.max(
      Math.min(Math.round(((xp - currentLevelFloor) / Math.max(nextLevelXp - currentLevelFloor, 1)) * 100), 100),
      0
    );

    return {
      level,
      xp,
      streak,
      nextLevelXp,
      progressToNextLevel,
    };
  }, [user]);

  const emptyState = useMemo(() => {
    if (subjects.length === 0) {
      return {
        title: 'No classes in your schedule yet',
        description: 'Add a few weekly subjects first. BlueStep will generate today attendance sessions from them automatically.',
        actionLabel: 'Open Schedule',
        actionHref: '/schedule',
      };
    }

    return {
      title: 'No classes scheduled for today',
      description: 'Today is clear. Enjoy the breathing room, or use this time to plan the rest of your week.',
      actionLabel: 'Review Schedule',
      actionHref: '/schedule',
    };
  }, [subjects.length]);

  const greeting = useMemo(() => getGreeting(user?.displayName), [user?.displayName]);

  return {
    greeting,
    userSummary,
    todayProgress,
    todaySessions,
    emptyState,
    loading: authLoading || subjectsLoading || attendance.loading,
    error: subjectsError || attendance.error,
    markAsAttended: attendance.markAsAttended,
    refresh: attendance.refresh,
  };
}
