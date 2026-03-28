'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { AuthService } from '@/services/auth.service';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth and listen for state changes
    const unsubscribe = AuthService.initAuth((profile) => {
      setUser(profile);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
}

