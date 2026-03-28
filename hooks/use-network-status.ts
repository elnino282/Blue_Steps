'use client';

import { useSyncExternalStore } from 'react';

function getOnlineSnapshot() {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

function subscribeToNetworkStatus(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);

  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(
    subscribeToNetworkStatus,
    getOnlineSnapshot,
    () => true
  );

  return {
    isOnline,
    isOffline: !isOnline,
  };
}
