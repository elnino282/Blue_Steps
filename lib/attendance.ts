import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  set,
  startOfDay,
  startOfWeek,
} from 'date-fns';

import { AttendanceSession, Subject } from '@/types';

type TimestampLike = {
  toMillis: () => number;
};

export type DateRange = {
  start: Date;
  end: Date;
};

export function toMillis(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toMillis' in value &&
    typeof (value as TimestampLike).toMillis === 'function'
  ) {
    return (value as TimestampLike).toMillis();
  }

  return null;
}

export function getStartOfLocalDay(date: Date) {
  return startOfDay(date);
}

export function getDateKey(date: Date) {
  return format(getStartOfLocalDay(date), 'yyyy-MM-dd');
}

export function getCurrentWeekRange(date = new Date()): DateRange {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getDatesInRange(start: Date, end: Date) {
  const normalizedStart = getStartOfLocalDay(start);
  const normalizedEnd = getStartOfLocalDay(end);

  if (isAfter(normalizedStart, normalizedEnd)) {
    return [];
  }

  return eachDayOfInterval({
    start: normalizedStart,
    end: normalizedEnd,
  });
}

export function createAttendanceSessionId(subjectId: string, date: Date) {
  return `${subjectId}_${getDateKey(date)}`;
}

export function buildAttendanceSession(subject: Subject, date: Date): AttendanceSession {
  const dayStart = getStartOfLocalDay(date);
  const timestamp = Date.now();

  return {
    id: createAttendanceSessionId(subject.id, dayStart),
    subjectId: subject.id,
    subjectName: subject.name,
    date: dayStart.getTime(),
    weekday: dayStart.getDay(),
    startTime: subject.startTime,
    endTime: subject.endTime,
    status: 'scheduled',
    checkedInAt: null,
    xpAwarded: 0,
    streakBonus: 0,
    reasonRequired: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function normalizeAttendanceSession(id: string, rawSession: Partial<AttendanceSession>) {
  const sessionDateMillis = toMillis(rawSession.date);

  if (!rawSession.subjectId || sessionDateMillis === null) {
    return null;
  }

  const sessionDate = new Date(sessionDateMillis);
  const normalizedStatus =
    rawSession.status === 'attended' || rawSession.status === 'missed' || rawSession.status === 'scheduled'
      ? rawSession.status
      : 'scheduled';
  const xpAwarded =
    typeof rawSession.xpAwarded === 'number'
      ? rawSession.xpAwarded
      : normalizedStatus === 'attended'
        ? 60
        : 0;

  return {
    id,
    subjectId: rawSession.subjectId,
    subjectName: rawSession.subjectName ?? 'Class session',
    date: sessionDateMillis,
    weekday: rawSession.weekday ?? sessionDate.getDay(),
    startTime: rawSession.startTime ?? '00:00',
    endTime: rawSession.endTime ?? rawSession.startTime ?? '00:00',
    status: normalizedStatus,
    checkedInAt: toMillis(rawSession.checkedInAt) ?? null,
    xpAwarded,
    streakBonus: rawSession.streakBonus ?? 0,
    reasonRequired: rawSession.reasonRequired ?? false,
    createdAt: toMillis(rawSession.createdAt) ?? sessionDateMillis,
    updatedAt:
      toMillis(rawSession.updatedAt) ??
      toMillis(rawSession.createdAt) ??
      sessionDateMillis,
  } satisfies AttendanceSession;
}

export function toSessionDateTime(session: Pick<AttendanceSession, 'date' | 'startTime' | 'endTime'>, field: 'startTime' | 'endTime') {
  const baseDate = new Date(session.date);
  const [hours, minutes] = session[field].split(':').map(Number);

  return set(baseDate, {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });
}

export function isSessionMissed(session: AttendanceSession, now = new Date()) {
  if (session.status !== 'scheduled') {
    return false;
  }

  const sessionEnd = toSessionDateTime(session, 'endTime');
  return isBefore(sessionEnd, now);
}

export function isSameLocalDay(dateA: Date | number, dateB: Date | number) {
  return getDateKey(new Date(dateA)) === getDateKey(new Date(dateB));
}

export function sortSessionsByTime<T extends Pick<AttendanceSession, 'startTime' | 'subjectName'>>(sessions: T[]) {
  return [...sessions].sort((left, right) => {
    const timeCompare = left.startTime.localeCompare(right.startTime);
    if (timeCompare !== 0) {
      return timeCompare;
    }

    return left.subjectName.localeCompare(right.subjectName);
  });
}
