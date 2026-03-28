'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { AuthService, type AuthState } from '@/services/auth.service';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnlineBootstrap, setNeedsOnlineBootstrap] = useState(false);

  useEffect(() => {
    // Initialize auth and listen for state changes
    const unsubscribe = AuthService.initAuth((state: AuthState) => {
      setUser(state.user);
      setNeedsOnlineBootstrap(state.needsOnlineBootstrap);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading, needsOnlineBootstrap };
}
