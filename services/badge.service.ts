import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { buildWeeklySummaries } from '@/lib/gamification';
import { FirestoreService } from '@/services/firestore.service';
import { ProfileService } from '@/services/profile.service';
import { Badge, BadgeDefinition, BadgeId, BadgeStatus, DailySummary } from '@/types';

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-attend',
    name: 'First Step',
    description: 'Attend your first class and start building momentum.',
    icon: 'sparkles',
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Show up for 3 study days in a row.',
    icon: 'flame',
  },
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Keep your attendance streak alive for 7 study days.',
    icon: 'medal',
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Attend every scheduled session in a fully resolved week.',
    icon: 'shield-check',
  },
  {
    id: 'no-skip-week',
    name: 'No Skip Week',
    description: 'Show up at least once on every study day of a fully resolved week.',
    icon: 'calendar-check',
  },
  {
    id: 'comeback',
    name: 'Comeback Kid',
    description: 'Return to class after a chain of missed study days.',
    icon: 'rotate-ccw',
  },
];

export const BadgeService = {
  getCollectionPath(uid: string) {
    return `users/${uid}/badges`;
  },

  getBadgeCatalog() {
    return BADGE_DEFINITIONS;
  },

  async getUnlockedBadges(uid: string) {
    const result = await FirestoreService.readCollectionByQuery<Badge>(
      collection(db, this.getCollectionPath(uid))
    );

    return result.data
      .map((badgeDoc) => {
        const definition = BADGE_DEFINITIONS.find((item) => item.id === badgeDoc.id);

        if (!definition) {
          return null;
        }

        return {
          ...definition,
          unlockedAt: badgeDoc.unlockedAt ?? Date.now(),
        } satisfies Badge;
      })
      .filter((badge): badge is Badge => badge !== null)
      .sort((left, right) => {
        const leftTime = left.unlockedAt ?? 0;
        const rightTime = right.unlockedAt ?? 0;
        return leftTime - rightTime;
      });
  },

  subscribeToUserBadges(
    uid: string,
    callback: (badges: Badge[]) => void,
    onError?: (error: unknown) => void
  ) {
    return onSnapshot(
      collection(db, this.getCollectionPath(uid)),
      (snapshot) => {
        const unlockedBadges = snapshot.docs
          .map((badgeDoc) => {
            const data = badgeDoc.data() as Partial<Badge>;
            const definition = BADGE_DEFINITIONS.find((item) => item.id === badgeDoc.id);

            if (!definition) {
              return null;
            }

            return {
              ...definition,
              unlockedAt: data.unlockedAt ?? Date.now(),
            } satisfies Badge;
          })
          .filter((badge): badge is Badge => badge !== null);

        callback(unlockedBadges);
      },
      (error) => {
        if (!FirestoreService.isOfflineError(error)) {
          console.error('Failed to subscribe to badges:', error);
        }

        onError?.(error);
      }
    );
  },

  getBadgeStatuses(unlockedBadges: Badge[]): BadgeStatus[] {
    const unlockedMap = new Map(unlockedBadges.map((badge) => [badge.id, badge]));

    return BADGE_DEFINITIONS.map((definition) => {
      const unlockedBadge = unlockedMap.get(definition.id);
      return {
        ...definition,
        unlocked: Boolean(unlockedBadge),
        unlockedAt: unlockedBadge?.unlockedAt ?? null,
      } satisfies BadgeStatus;
    });
  },

  async evaluateBadges(uid: string, summaries?: DailySummary[]) {
    const dailySummaries = summaries ?? (await ProfileService.getDailySummaries(uid));
    const unlockedBadges = await this.getUnlockedBadges(uid);
    const unlockedIds = new Set(unlockedBadges.map((badge) => badge.id));
    const nextBadgeIds = this.getEarnedBadgeIds(dailySummaries);
    const timestamp = Date.now();

    await Promise.all(
      nextBadgeIds
        .filter((badgeId) => !unlockedIds.has(badgeId))
        .map(async (badgeId) => {
          const definition = BADGE_DEFINITIONS.find((badge) => badge.id === badgeId);
          if (!definition) {
            return;
          }

          await setDoc(doc(db, this.getCollectionPath(uid), badgeId), {
            ...definition,
            unlockedAt: timestamp,
          } satisfies Badge);
        })
    );

    return this.getUnlockedBadges(uid);
  },

  getEarnedBadgeIds(summaries: DailySummary[]) {
    const earnedBadges = new Set<BadgeId>();
    const weeklySummaries = buildWeeklySummaries(summaries);

    if (summaries.some((summary) => summary.attendedSessions > 0)) {
      earnedBadges.add('first-attend');
    }

    if (summaries.some((summary) => summary.streakCount >= 3)) {
      earnedBadges.add('streak-3');
    }

    if (summaries.some((summary) => summary.streakCount >= 7)) {
      earnedBadges.add('streak-7');
    }

    if (
      weeklySummaries.some(
        (summary) => summary.allResolved && summary.totalScheduledSessions > 0 && summary.allSessionsAttended
      )
    ) {
      earnedBadges.add('perfect-week');
    }

    if (
      weeklySummaries.some(
        (summary) =>
          summary.allResolved &&
          summary.studyDays > 0 &&
          summary.everyStudyDayHadAttendance
      )
    ) {
      earnedBadges.add('no-skip-week');
    }

    if (this.hasComeback(summaries)) {
      earnedBadges.add('comeback');
    }

    return [...earnedBadges];
  },

  hasComeback(summaries: DailySummary[]) {
    for (let index = 0; index < summaries.length; index += 1) {
      const summary = summaries[index];

      if (!summary.qualifiesForStreak) {
        continue;
      }

      let brokenDaysBefore = 0;
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        const previousSummary = summaries[cursor];

        if (previousSummary.breaksStreak) {
          brokenDaysBefore += 1;
          continue;
        }

        if (previousSummary.qualifiesForStreak) {
          break;
        }
      }

      if (brokenDaysBefore >= 2) {
        return true;
      }
    }

    return false;
  },
};
