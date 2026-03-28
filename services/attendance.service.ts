import {
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import {
  buildAttendanceSession,
  getDatesInRange,
  getStartOfLocalDay,
  isSameLocalDay,
  isSessionMissed,
  normalizeAttendanceSession,
  sortSessionsByTime,
} from '@/lib/attendance';
import { XP_VALUES, buildDailySummariesFromSessions } from '@/lib/gamification';
import { FirestoreService } from '@/services/firestore.service';
import { AttendanceSession } from '@/types';
import { BadgeService } from '@/services/badge.service';
import { ProfileService } from '@/services/profile.service';
import { SubjectService } from '@/services/subject.service';

type SubjectCounter = {
  totalSessions: number;
  attendedSessions: number;
};

const startupSyncPromises = new Map<string, Promise<void>>();

export const AttendanceService = {
  getCollectionPath(uid: string) {
    return `users/${uid}/attendanceSessions`;
  },

  getDocumentPath(uid: string, sessionId: string) {
    return `${this.getCollectionPath(uid)}/${sessionId}`;
  },

  getRenderableSession(session: AttendanceSession, now = new Date()) {
    if (!isSessionMissed(session, now)) {
      return session;
    }

    return {
      ...session,
      status: 'missed' as const,
    };
  },

  buildTodaySessions(
    subjects: Awaited<ReturnType<typeof SubjectService.getSubjects>>,
    existingSessions: AttendanceSession[],
    today = new Date()
  ) {
    const todayStart = getStartOfLocalDay(today);
    const todaySessionMap = new Map(
      existingSessions
        .filter((session) => isSameLocalDay(session.date, todayStart))
        .map((session) => [session.id, session])
    );

    for (const subject of subjects) {
      if (subject.weekday !== todayStart.getDay()) {
        continue;
      }

      const generatedSession = buildAttendanceSession(subject, todayStart);
      if (!todaySessionMap.has(generatedSession.id)) {
        todaySessionMap.set(generatedSession.id, generatedSession);
      }
    }

    return sortSessionsByTime(
      [...todaySessionMap.values()].map((session) => this.getRenderableSession(session, today))
    );
  },

  scheduleStartupSync(uid: string) {
    const existingPromise = startupSyncPromises.get(uid);
    if (existingPromise) {
      return existingPromise;
    }

    const syncPromise = (async () => {
      try {
        await this.runStartupSync(uid);
      } catch (error) {
        if (!FirestoreService.isOfflineError(error)) {
          console.error('Failed to run attendance startup sync:', error);
        }
      } finally {
        startupSyncPromises.delete(uid);
      }
    })();

    startupSyncPromises.set(uid, syncPromise);
    return syncPromise;
  },

  async runStartupSync(uid: string) {
    await this.ensureSessionsForToday(uid);

    const allSessions = await this.getAllSessions(uid);
    const todayStart = getStartOfLocalDay(new Date());
    const todaySessions = allSessions.filter((session) => isSameLocalDay(session.date, todayStart));
    const now = new Date();
    const sessionsToMarkMissed = todaySessions.filter((session) => isSessionMissed(session, now));
    let sessionsForProfileSync = allSessions;

    if (sessionsToMarkMissed.length > 0) {
      const missedIds = new Set(sessionsToMarkMissed.map((session) => session.id));
      const updatedAt = Date.now();

      await Promise.all(
        sessionsToMarkMissed.map((session) =>
          setDoc(
            doc(db, this.getCollectionPath(uid), session.id),
            {
              status: 'missed',
              updatedAt,
            },
            { merge: true }
          )
        )
      );

      sessionsForProfileSync = allSessions.map((session) =>
        missedIds.has(session.id)
          ? {
              ...session,
              status: 'missed' as const,
              updatedAt,
            }
          : session
      );
    }

    const { summaries } = await ProfileService.syncDailySummariesAndProfile(uid, sessionsForProfileSync);
    await BadgeService.evaluateBadges(uid, summaries);
  },

  async ensureSessionsForToday(uid: string) {
    const today = new Date();
    return this.ensureSessionsForRange(uid, today, today);
  },

  async ensureSessionsForRange(uid: string, startDate: Date, endDate: Date) {
    const [subjects, existingSessions] = await Promise.all([
      SubjectService.getSubjects(uid),
      this.getAllSessions(uid),
    ]);

    if (subjects.length === 0) {
      return [];
    }

    const existingSessionMap = new Map(existingSessions.map((session) => [session.id, session]));
    const newSessions: AttendanceSession[] = [];
    const syncedScheduledSessions: AttendanceSession[] = [];

    for (const date of getDatesInRange(startDate, endDate)) {
      const weekday = date.getDay();
      const matchingSubjects = subjects.filter((subject) => subject.weekday === weekday);

      for (const subject of matchingSubjects) {
        const session = buildAttendanceSession(subject, date);
        const existingSession = existingSessionMap.get(session.id);

        if (!existingSession) {
          newSessions.push(session);
          existingSessionMap.set(session.id, session);
          continue;
        }

        if (existingSession.status !== 'scheduled') {
          continue;
        }

        const needsSync =
          existingSession.subjectName !== subject.name ||
          existingSession.startTime !== subject.startTime ||
          existingSession.endTime !== subject.endTime ||
          existingSession.weekday !== session.weekday;

        if (!needsSync) {
          continue;
        }

        const syncedSession: AttendanceSession = {
          ...existingSession,
          subjectName: subject.name,
          date: session.date,
          weekday: session.weekday,
          startTime: subject.startTime,
          endTime: subject.endTime,
          updatedAt: Date.now(),
        };

        syncedScheduledSessions.push(syncedSession);
        existingSessionMap.set(syncedSession.id, syncedSession);
      }
    }

    if (newSessions.length === 0 && syncedScheduledSessions.length === 0) {
      return [];
    }

    await Promise.all(
      newSessions.concat(syncedScheduledSessions).map((session) =>
        setDoc(doc(db, this.getCollectionPath(uid), session.id), session)
      )
    );

    const affectedSubjectIds = [
      ...new Set(
        newSessions
          .concat(syncedScheduledSessions)
          .map((session) => session.subjectId)
      ),
    ];
    await this.syncSubjectCounters(uid, [...existingSessionMap.values()], affectedSubjectIds);

    return newSessions.concat(syncedScheduledSessions);
  },

  async getTodaySessions(uid: string) {
    const [subjects, allSessions] = await Promise.all([
      SubjectService.getSubjects(uid),
      this.getAllSessions(uid),
    ]);

    const todaySessions = this.buildTodaySessions(subjects, allSessions);
    void this.scheduleStartupSync(uid);

    return todaySessions;
  },

  async markAsAttended(uid: string, sessionId: string) {
    const sessionRef = doc(db, this.getCollectionPath(uid), sessionId);
    let sessionResult = await FirestoreService.readDocumentByRef<AttendanceSession>(sessionRef);

    if (!sessionResult.data) {
      await this.ensureSessionsForToday(uid);
      sessionResult = await FirestoreService.readDocumentByRef<AttendanceSession>(sessionRef);
    }

    if (!sessionResult.data) {
      return null;
    }

    const currentSession = normalizeAttendanceSession(
      sessionId,
      sessionResult.data as Partial<AttendanceSession>
    );

    if (!currentSession) {
      return null;
    }

    if (currentSession.status !== 'scheduled') {
      return currentSession;
    }

    const allSessions = await this.getAllSessions(uid);
    const checkInTimestamp = Date.now();
    const provisionalSession: AttendanceSession = {
      ...currentSession,
      status: 'attended',
      checkedInAt: checkInTimestamp,
      xpAwarded: XP_VALUES.attendance,
      streakBonus: 0,
      reasonRequired: false,
      updatedAt: checkInTimestamp,
    };
    const nextSessions = allSessions.map((session) =>
      session.id === sessionId ? provisionalSession : session
    );
    const currentDateKey = new Date(currentSession.date).toDateString();
    const sameDaySessions = nextSessions.filter(
      (session) => new Date(session.date).toDateString() === currentDateKey
    );
    const attendedSessionsForDay = sameDaySessions.filter((session) => session.status === 'attended');
    const summaries = buildDailySummariesFromSessions(nextSessions);
    const currentDaySummary = summaries.find((summary) => summary.date === currentSession.date);
    const streakBonus =
      attendedSessionsForDay.length === 1 && (currentDaySummary?.streakCount ?? 0) > 1
        ? XP_VALUES.streakDailyBonus
        : 0;
    const completionBonus =
      sameDaySessions.length > 0 && sameDaySessions.every((session) => session.status === 'attended')
        ? XP_VALUES.perfectDayBonus
        : 0;
    const updatedSession: AttendanceSession = {
      ...provisionalSession,
      xpAwarded: XP_VALUES.attendance + completionBonus,
      streakBonus,
      reasonRequired: false,
      updatedAt: checkInTimestamp,
    };

    await setDoc(sessionRef, updatedSession, { merge: true });
    const syncedSessions = nextSessions.map((session) =>
      session.id === updatedSession.id ? updatedSession : session
    );
    await this.syncSubjectCounters(uid, syncedSessions, [updatedSession.subjectId]);
    const { summaries: syncedSummaries } = await ProfileService.syncDailySummariesAndProfile(
      uid,
      syncedSessions
    );
    await BadgeService.evaluateBadges(uid, syncedSummaries);

    return updatedSession;
  },

  async getAllSessions(uid: string) {
    const result = await FirestoreService.readCollectionByQuery<AttendanceSession>(
      collection(db, this.getCollectionPath(uid))
    );
    const sessions = result.data
      .map((sessionDoc) =>
        normalizeAttendanceSession(
          sessionDoc.id,
          sessionDoc as Partial<AttendanceSession>
        )
      )
      .filter((session): session is AttendanceSession => session !== null);

    return sortSessionsByTime(sessions);
  },

  async syncSubjectCounters(uid: string, sessions?: AttendanceSession[], subjectIds?: string[]) {
    const allSessions = sessions ?? (await this.getAllSessions(uid));
    const counters = this.buildSubjectCounters(allSessions);
    const relevantSubjectIds = subjectIds ?? [...counters.keys()];

    await Promise.all(
      relevantSubjectIds.map(async (subjectId) => {
        const subjectRef = doc(db, SubjectService.getCollectionPath(uid), subjectId);
        const subjectResult = await FirestoreService.readDocumentByRef(subjectRef);

        if (!subjectResult.data) {
          return;
        }

        const counter = counters.get(subjectId) ?? {
          totalSessions: 0,
          attendedSessions: 0,
        };

        await setDoc(
          subjectRef,
          {
            totalSessions: counter.totalSessions,
            attendedSessions: counter.attendedSessions,
          } satisfies SubjectCounter,
          { merge: true }
        );
      })
    );
  },

  buildSubjectCounters(sessions: AttendanceSession[]) {
    return sessions.reduce((accumulator, session) => {
      const current = accumulator.get(session.subjectId) ?? {
        totalSessions: 0,
        attendedSessions: 0,
      };

      current.totalSessions += 1;
      if (session.status === 'attended') {
        current.attendedSessions += 1;
      }

      accumulator.set(session.subjectId, current);
      return accumulator;
    }, new Map<string, SubjectCounter>());
  },
};
