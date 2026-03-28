import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import {
  buildAttendanceSession,
  getDatesInRange,
  getStartOfLocalDay,
  isSameLocalDay,
  isSessionMissed,
  sortSessionsByTime,
} from '@/lib/attendance';
import { AttendanceSession } from '@/types';
import { SubjectService } from '@/services/subject.service';

type SubjectCounter = {
  totalSessions: number;
  attendedSessions: number;
};

export const AttendanceService = {
  getCollectionPath(uid: string) {
    return `users/${uid}/attendanceSessions`;
  },

  getDocumentPath(uid: string, sessionId: string) {
    return `${this.getCollectionPath(uid)}/${sessionId}`;
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

    const existingSessionIds = new Set(existingSessions.map((session) => session.id));
    const newSessions: AttendanceSession[] = [];

    for (const date of getDatesInRange(startDate, endDate)) {
      const weekday = date.getDay();
      const matchingSubjects = subjects.filter((subject) => subject.weekday === weekday);

      for (const subject of matchingSubjects) {
        const session = buildAttendanceSession(subject, date);
        if (!existingSessionIds.has(session.id)) {
          newSessions.push(session);
          existingSessionIds.add(session.id);
        }
      }
    }

    if (newSessions.length === 0) {
      return [];
    }

    await Promise.all(
      newSessions.map((session) =>
        setDoc(doc(db, this.getCollectionPath(uid), session.id), session)
      )
    );

    const affectedSubjectIds = [...new Set(newSessions.map((session) => session.subjectId))];
    await this.syncSubjectCounters(uid, existingSessions.concat(newSessions), affectedSubjectIds);

    return newSessions;
  },

  async getTodaySessions(uid: string) {
    await this.ensureSessionsForToday(uid);

    const todayStart = getStartOfLocalDay(new Date());
    const allSessions = await this.getAllSessions(uid);
    const todaySessions = allSessions.filter((session) => isSameLocalDay(session.date, todayStart));
    const now = new Date();

    const sessionsToMarkMissed = todaySessions.filter((session) => isSessionMissed(session, now));

    if (sessionsToMarkMissed.length > 0) {
      await Promise.all(
        sessionsToMarkMissed.map((session) =>
          setDoc(
            doc(db, this.getCollectionPath(uid), session.id),
            {
              status: 'missed',
              updatedAt: Date.now(),
            },
            { merge: true }
          )
        )
      );
    }

    const normalizedSessions = todaySessions.map((session) => {
      if (!sessionsToMarkMissed.find((item) => item.id === session.id)) {
        return session;
      }

      return {
        ...session,
        status: 'missed' as const,
        updatedAt: Date.now(),
      };
    });

    return sortSessionsByTime(normalizedSessions);
  },

  async markAsAttended(uid: string, sessionId: string) {
    const sessionRef = doc(db, this.getCollectionPath(uid), sessionId);
    const sessionSnapshot = await getDoc(sessionRef);

    if (!sessionSnapshot.exists()) {
      return null;
    }

    const currentSession = this.normalizeSession(sessionSnapshot.id, sessionSnapshot.data());

    if (!currentSession) {
      return null;
    }

    if (currentSession.status !== 'scheduled') {
      return currentSession;
    }

    const updatedSession: AttendanceSession = {
      ...currentSession,
      status: 'attended',
      checkedInAt: Date.now(),
      xpAwarded: currentSession.xpAwarded ?? 0,
      streakBonus: currentSession.streakBonus ?? 0,
      reasonRequired: false,
      updatedAt: Date.now(),
    };

    await setDoc(sessionRef, updatedSession, { merge: true });
    await this.syncSubjectCounters(uid, undefined, [updatedSession.subjectId]);

    return updatedSession;
  },

  async getAllSessions(uid: string) {
    const snapshot = await getDocs(collection(db, this.getCollectionPath(uid)));
    const sessions = snapshot.docs
      .map((sessionDoc) => this.normalizeSession(sessionDoc.id, sessionDoc.data()))
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
        const subjectSnapshot = await getDoc(subjectRef);

        if (!subjectSnapshot.exists()) {
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

  normalizeSession(id: string, rawSession: Partial<AttendanceSession>) {
    if (!rawSession.subjectId || typeof rawSession.date !== 'number') {
      return null;
    }

    const sessionDate = new Date(rawSession.date);
    const normalizedStatus =
      rawSession.status === 'attended' || rawSession.status === 'missed' || rawSession.status === 'scheduled'
        ? rawSession.status
        : 'scheduled';

    return {
      id,
      subjectId: rawSession.subjectId,
      subjectName: rawSession.subjectName ?? 'Class session',
      date: rawSession.date,
      weekday: rawSession.weekday ?? sessionDate.getDay(),
      startTime: rawSession.startTime ?? '00:00',
      endTime: rawSession.endTime ?? rawSession.startTime ?? '00:00',
      status: normalizedStatus,
      checkedInAt: rawSession.checkedInAt ?? null,
      xpAwarded: rawSession.xpAwarded ?? 0,
      streakBonus: rawSession.streakBonus ?? 0,
      reasonRequired: rawSession.reasonRequired ?? false,
      createdAt: rawSession.createdAt ?? rawSession.date,
      updatedAt: rawSession.updatedAt ?? rawSession.createdAt ?? rawSession.date,
    } satisfies AttendanceSession;
  },
};
