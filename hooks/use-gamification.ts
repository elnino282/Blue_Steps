'use client';

import { useMemo } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useBadges } from '@/hooks/use-badges';
import { getXpProgress } from '@/lib/gamification';

export function useGamification() {
  const { user, loading: authLoading, needsOnlineBootstrap } = useAuth();
  const {
    badges,
    unlockedBadges,
    loading: badgesLoading,
  } = useBadges();

  const xpProgress = useMemo(
    () => getXpProgress(user?.xp ?? 0),
    [user?.xp]
  );

  const userSummary = useMemo(
    () => ({
      level: user?.level ?? xpProgress.level,
      totalXp: user?.xp ?? 0,
      currentStreak: user?.streak ?? 0,
      bestStreak: user?.bestStreak ?? 0,
      displayName: user?.displayName ?? 'Explorer',
      xpProgress,
    }),
    [user?.bestStreak, user?.displayName, user?.level, user?.streak, user?.xp, xpProgress]
  );

  return {
    userSummary,
    xpProgress,
    badges,
    unlockedBadges,
    loading: authLoading || badgesLoading,
    needsOnlineBootstrap,
  };
}
