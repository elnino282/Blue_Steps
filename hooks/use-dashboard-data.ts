'use client';

import { useMemo } from 'react';

import { useAttendance } from '@/hooks/use-attendance';
import { useGamification } from '@/hooks/use-gamification';
import { useAuth } from '@/hooks/use-auth';
import { useSubjects } from '@/hooks/use-subjects';

function getGreeting(displayName?: string) {
  const hour = new Date().getHours();
  const name = displayName || 'Explorer';

  if (hour < 12) {
    return {
      title: `Good morning, ${name}`,
      description: 'Classes count more when the routine feels light enough to repeat.',
    };
  }

  if (hour < 18) {
    return {
      title: `Good afternoon, ${name}`,
      description: 'Keep the day honest. Each check-in feeds your XP, streak, and badges.',
    };
  }

  return {
    title: `Good evening, ${name}`,
    description: 'A clean check-in before the day ends still moves your progress forward.',
  };
}

export function useDashboardData() {
  const { user, loading: authLoading, needsOnlineBootstrap } = useAuth();
  const {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
    needsOnlineBootstrap: subjectsNeedBootstrap,
  } = useSubjects();
  const attendance = useAttendance();
  const gamification = useGamification();

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

  const emptyState = useMemo(() => {
    if (needsOnlineBootstrap || subjectsNeedBootstrap) {
      return {
        title: 'Connect once to start BlueStep',
        description:
          'You need to be online at least once so BlueStep can create your anonymous account and sync your data.',
        actionLabel: 'Try Again When Online',
        actionHref: '/dashboard',
      };
    }

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
  }, [needsOnlineBootstrap, subjects.length, subjectsNeedBootstrap]);

  const greeting = useMemo(
    () => getGreeting(gamification.userSummary.displayName || user?.displayName),
    [gamification.userSummary.displayName, user?.displayName]
  );
  const featuredBadges = useMemo(() => {
    return [...gamification.badges]
      .sort((left, right) => {
        if (left.unlocked !== right.unlocked) {
          return left.unlocked ? -1 : 1;
        }

        return (right.unlockedAt ?? 0) - (left.unlockedAt ?? 0);
      })
      .slice(0, 4);
  }, [gamification.badges]);

  return {
    greeting,
    userSummary: gamification.userSummary,
    xpProgress: gamification.xpProgress,
    badges: gamification.badges,
    featuredBadges,
    todayProgress,
    todaySessions,
    emptyState,
    needsOnlineBootstrap,
    loading: authLoading || subjectsLoading || attendance.loading,
    gamificationLoading: gamification.loading,
    error: subjectsError || attendance.error,
    markAsAttended: attendance.markAsAttended,
    refresh: attendance.refresh,
  };
}
