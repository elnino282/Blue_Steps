'use client';

import { useCallback, useEffect, useState } from 'react';

import { AttendanceService } from '@/services/attendance.service';
import { AttendanceSession } from '@/types';
import { sortSessionsByTime } from '@/lib/attendance';
import { useAuth } from '@/hooks/use-auth';

export function useAttendance() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextSessions = await AttendanceService.getTodaySessions(user.uid);
      setSessions(nextSessions);
    } catch (err) {
      console.error('Failed to load attendance sessions:', err);
      setError('Failed to load today sessions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    refresh();
  }, [authLoading, refresh]);

  const markAsAttended = useCallback(
    async (sessionId: string) => {
      if (!user) {
        return null;
      }

      const previousSession = sessions.find((session) => session.id === sessionId);
      if (!previousSession) {
        return null;
      }

      if (previousSession.status !== 'scheduled') {
        return previousSession;
      }

      const optimisticTimestamp = Date.now();
      const optimisticSession: AttendanceSession = {
        ...previousSession,
        status: 'attended',
        checkedInAt: optimisticTimestamp,
        xpAwarded: previousSession.xpAwarded ?? 0,
        streakBonus: previousSession.streakBonus ?? 0,
        reasonRequired: false,
        updatedAt: optimisticTimestamp,
      };

      setError(null);
      setSessions((currentSessions) =>
        sortSessionsByTime(
          currentSessions.map((session) =>
            session.id === sessionId ? optimisticSession : session
          )
        )
      );

      try {
        const updatedSession = await AttendanceService.markAsAttended(user.uid, sessionId);

        if (!updatedSession) {
          throw new Error('Attendance session not found');
        }

        setSessions((currentSessions) =>
          sortSessionsByTime(
            currentSessions.map((session) =>
              session.id === sessionId ? updatedSession : session
            )
          )
        );

        return updatedSession;
      } catch (err) {
        console.error('Failed to mark session as attended:', err);
        setSessions((currentSessions) =>
          sortSessionsByTime(
            currentSessions.map((session) =>
              session.id === sessionId ? previousSession : session
            )
          )
        );
        setError('Could not save your check-in');
        return null;
      }
    },
    [sessions, user]
  );

  return {
    sessions,
    loading: authLoading || loading,
    error,
    refresh,
    markAsAttended,
  };
}
