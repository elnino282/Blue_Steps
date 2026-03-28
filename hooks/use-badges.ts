'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { Badge, BadgeStatus } from '@/types';
import { BadgeService } from '@/services/badge.service';

type BadgeSnapshot = {
  uid: string | null;
  unlockedBadges: Badge[];
};

export function useBadges() {
  const { user, loading: authLoading, needsOnlineBootstrap } = useAuth();
  const [badgeSnapshot, setBadgeSnapshot] = useState<BadgeSnapshot>({
    uid: null,
    unlockedBadges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user || needsOnlineBootstrap) {
      setBadgeSnapshot({
        uid: null,
        unlockedBadges: [],
      });
      setLoading(false);
      return;
    }

    let isActive = true;
    setLoading(true);

    const fallbackTimer = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      setBadgeSnapshot((currentSnapshot) =>
        currentSnapshot.uid === user.uid
          ? currentSnapshot
          : {
              uid: user.uid,
              unlockedBadges: [],
            }
      );
      setLoading(false);
    }, 2500);

    const resolveBadges = (badges: Badge[]) => {
      if (!isActive) {
        return;
      }

      window.clearTimeout(fallbackTimer);
      setBadgeSnapshot({
        uid: user.uid,
        unlockedBadges: badges,
      });
      setLoading(false);
    };

    void BadgeService.getUnlockedBadges(user.uid)
      .then(resolveBadges)
      .catch((error) => {
        console.error('Failed to load badges:', error);
        resolveBadges([]);
      });

    const unsubscribe = BadgeService.subscribeToUserBadges(
      user.uid,
      resolveBadges,
      () => {
        resolveBadges([]);
      }
    );

    return () => {
      isActive = false;
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [authLoading, needsOnlineBootstrap, user?.uid]);

  const unlockedBadges = useMemo(
    () =>
      user && !needsOnlineBootstrap && badgeSnapshot.uid === user.uid
        ? badgeSnapshot.unlockedBadges
        : [],
    [badgeSnapshot.uid, badgeSnapshot.unlockedBadges, needsOnlineBootstrap, user?.uid]
  );

  const badges: BadgeStatus[] = useMemo(
    () => BadgeService.getBadgeStatuses(unlockedBadges),
    [unlockedBadges]
  );

  return {
    badges,
    unlockedBadges,
    loading,
    needsOnlineBootstrap,
  };
}
