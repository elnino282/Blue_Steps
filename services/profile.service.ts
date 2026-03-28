import {
  collection,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { normalizeAttendanceSession, toMillis } from '@/lib/attendance';
import {
  buildDailySummariesFromSessions,
  getCurrentAndBestStreak,
  getLevelFromTotalXp,
} from '@/lib/gamification';
import { FirestoreService } from '@/services/firestore.service';
import { AttendanceSession, DailySummary, UserProfile } from '@/types';

export const ProfileService = {
  getDocumentPath(uid: string) {
    return `users/${uid}`;
  },

  getDailySummaryCollectionPath(uid: string) {
    return `users/${uid}/dailySummaries`;
  },

  getAttendanceSessionCollectionPath(uid: string) {
    return `users/${uid}/attendanceSessions`;
  },

  createDefaultProfile(uid: string): UserProfile {
    const timestamp = Date.now();

    return {
      uid,
      displayName: 'Explorer',
      level: 1,
      xp: 0,
      streak: 0,
      bestStreak: 0,
      createdAt: timestamp,
      lastActiveAt: timestamp,
    };
  },

  normalizeUserProfile(uid: string, rawProfile?: Partial<UserProfile> | null) {
    const defaultProfile = this.createDefaultProfile(uid);
    const xp = rawProfile?.xp ?? defaultProfile.xp;
    const streak = rawProfile?.streak ?? defaultProfile.streak;
    const bestStreak = Math.max(rawProfile?.bestStreak ?? defaultProfile.bestStreak, streak);
    const level = getLevelFromTotalXp(xp);

    return {
      ...defaultProfile,
      ...rawProfile,
      uid,
      xp,
      level,
      streak,
      bestStreak,
      createdAt: toMillis(rawProfile?.createdAt) ?? defaultProfile.createdAt,
      lastActiveAt: toMillis(rawProfile?.lastActiveAt) ?? defaultProfile.lastActiveAt,
    } satisfies UserProfile;
  },

  normalizeDailySummary(dateKey: string, rawSummary: Partial<DailySummary>) {
    const summaryDate = toMillis(rawSummary.date) ?? Date.now();

    return {
      dateKey,
      date: summaryDate,
      scheduledSessions: rawSummary.scheduledSessions ?? 0,
      attendedSessions: rawSummary.attendedSessions ?? 0,
      missedSessions: rawSummary.missedSessions ?? 0,
      pendingSessions: rawSummary.pendingSessions ?? 0,
      completedAllSessions: rawSummary.completedAllSessions ?? false,
      qualifiesForStreak: rawSummary.qualifiesForStreak ?? false,
      breaksStreak: rawSummary.breaksStreak ?? false,
      streakCount: rawSummary.streakCount ?? 0,
      bestStreak: rawSummary.bestStreak ?? 0,
      baseXpEarned: rawSummary.baseXpEarned ?? 0,
      completionBonusEarned: rawSummary.completionBonusEarned ?? 0,
      streakBonusEarned: rawSummary.streakBonusEarned ?? 0,
      totalXpEarned: rawSummary.totalXpEarned ?? 0,
      streakMaintained: rawSummary.streakMaintained ?? false,
      updatedAt: toMillis(rawSummary.updatedAt) ?? summaryDate,
    } satisfies DailySummary;
  },

  async getUserProfile(uid: string) {
    const result = await FirestoreService.readDocumentByRef<UserProfile>(
      doc(db, this.getDocumentPath(uid))
    );

    if (!result.data) {
      return null;
    }

    return this.normalizeUserProfile(uid, result.data);
  },

  async getDailySummaries(uid: string) {
    const result = await FirestoreService.readCollectionByQuery<DailySummary>(
      collection(db, this.getDailySummaryCollectionPath(uid))
    );

    return result.data
      .map((summaryDoc) =>
        this.normalizeDailySummary(summaryDoc.id, summaryDoc as Partial<DailySummary>)
      )
      .sort((left, right) => left.date - right.date);
  },

  async getAttendanceSessions(uid: string) {
    const result = await FirestoreService.readCollectionByQuery<AttendanceSession>(
      collection(db, this.getAttendanceSessionCollectionPath(uid))
    );

    return result.data
      .map((sessionDoc) =>
        normalizeAttendanceSession(
          sessionDoc.id,
          sessionDoc as Partial<AttendanceSession>
        )
      )
      .filter((session): session is AttendanceSession => session !== null);
  },

  async syncDailySummariesAndProfile(uid: string, sessions?: AttendanceSession[]) {
    const attendanceSessions = sessions ?? (await this.getAttendanceSessions(uid));
    const summaries = buildDailySummariesFromSessions(attendanceSessions);
    const existingSummaryResult = await FirestoreService.readCollectionByQuery<DailySummary>(
      collection(db, this.getDailySummaryCollectionPath(uid))
    );
    const nextSummaryKeys = new Set(summaries.map((summary) => summary.dateKey));

    await Promise.all(
      summaries
        .map((summary) =>
          setDoc(
            doc(db, this.getDailySummaryCollectionPath(uid), summary.dateKey),
            summary,
            { merge: true }
          )
        )
        .concat(
          existingSummaryResult.data
            .filter((summaryDoc) => !nextSummaryKeys.has(summaryDoc.id))
            .map((summaryDoc) =>
              deleteDoc(doc(db, this.getDailySummaryCollectionPath(uid), summaryDoc.id))
            )
        )
    );

    const totalXp = summaries.reduce((total, summary) => total + summary.totalXpEarned, 0);
    const level = getLevelFromTotalXp(totalXp);
    const { currentStreak, bestStreak } = getCurrentAndBestStreak(summaries);
    const existingProfile = await this.getUserProfile(uid);
    const profile = this.normalizeUserProfile(uid, {
      ...existingProfile,
      xp: totalXp,
      level,
      streak: currentStreak,
      bestStreak: Math.max(bestStreak, existingProfile?.bestStreak ?? 0),
    });

    await setDoc(doc(db, this.getDocumentPath(uid)), profile, { merge: true });

    return {
      profile,
      summaries,
    };
  },
};
