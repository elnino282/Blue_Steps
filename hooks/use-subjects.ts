'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subject } from '@/types';
import { SubjectService } from '@/services/subject.service';
import { useAuth } from '@/hooks/use-auth';

export function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await SubjectService.getSubjects(user.uid);
      setSubjects(data);
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    } else {
      setSubjects([]);
      setLoading(false);
    }
  }, [user, fetchSubjects]);

  const createSubject = async (data: Omit<Subject, 'id' | 'createdAt' | 'totalSessions' | 'attendedSessions'>) => {
    if (!user) return null;
    const newSubject = await SubjectService.createSubject(user.uid, data);
    if (newSubject) {
      setSubjects(prev => {
        const updated = [...prev, newSubject];
        // Re-sort by weekday and startTime
        return updated.sort((a, b) => {
          if (a.weekday !== b.weekday) return a.weekday - b.weekday;
          return a.startTime.localeCompare(b.startTime);
        });
      });
    }
    return newSubject;
  };

  const updateSubject = async (id: string, data: Partial<Omit<Subject, 'id' | 'createdAt'>>) => {
    if (!user) return false;
    const success = await SubjectService.updateSubject(user.uid, id, data);
    if (success) {
      setSubjects(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, ...data } : s);
        return updated.sort((a, b) => {
          if (a.weekday !== b.weekday) return a.weekday - b.weekday;
          return a.startTime.localeCompare(b.startTime);
        });
      });
    }
    return success;
  };

  const deleteSubject = async (id: string) => {
    if (!user) return false;
    const success = await SubjectService.deleteSubject(user.uid, id);
    if (success) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
    return success;
  };

  const seedDemo = async () => {
    if (!user) return false;
    setLoading(true);
    const success = await SubjectService.seedDemoSubjects(user.uid);
    if (success) {
      await fetchSubjects();
    }
    setLoading(false);
    return success;
  };

  return {
    subjects,
    loading,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
    refreshSubjects: fetchSubjects,
    seedDemo
  };
}
