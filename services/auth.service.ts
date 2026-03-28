import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile, UserSettings } from '@/types';
import { FirestoreService } from '@/services/firestore.service';
import { ProfileService } from '@/services/profile.service';

export type AuthState = {
  user: UserProfile | null;
  needsOnlineBootstrap: boolean;
};

type AuthSubscriber = (state: AuthState) => void;

const authSubscribers = new Set<AuthSubscriber>();
let unsubscribeAuthListener: (() => void) | null = null;
let unsubscribeProfileListener: (() => void) | null = null;
let unsubscribeOnlineListener: (() => void) | null = null;
let cachedAuthState: AuthState | null = null;
let hasResolvedAuth = false;
let signInPromise: Promise<void> | null = null;
const AUTH_BOOTSTRAP_TIMEOUT_MS = 4000;

function createAuthTimeoutError() {
  const error = new Error('Anonymous auth bootstrap timed out');
  (error as Error & { code?: string }).code = 'deadline-exceeded';
  return error;
}

async function withBootstrapTimeout<T>(promise: Promise<T>) {
  let timeoutId: number | undefined;

  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(createAuthTimeoutError());
        }, AUTH_BOOTSTRAP_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
}

function notifyAuthSubscribers(state: AuthState) {
  cachedAuthState = state;
  hasResolvedAuth = true;

  authSubscribers.forEach((subscriber) => subscriber(state));
}

export const AuthService = {
  /**
   * Initializes anonymous authentication.
   * If the user is not signed in, it signs them in anonymously.
   * If they are signed in, it bootstraps their profile in Firestore.
   */
  initAuth(callback: (state: AuthState) => void) {
    authSubscribers.add(callback);

    if (hasResolvedAuth && cachedAuthState) {
      callback(cachedAuthState);
    }

    const resolveCurrentAuthState = async () => {
      unsubscribeProfileListener?.();
      unsubscribeProfileListener = null;

      const firebaseUser = auth.currentUser;

      if (firebaseUser) {
        const bootstrapState = await this.bootstrapUserProfile(firebaseUser.uid);
        notifyAuthSubscribers(bootstrapState);

        if (bootstrapState.needsOnlineBootstrap) {
          return;
        }

        const userRef = doc(db, 'users', firebaseUser.uid);

        unsubscribeProfileListener = onSnapshot(userRef, (snapshot) => {
          notifyAuthSubscribers({
            user: snapshot.exists()
              ? ProfileService.normalizeUserProfile(
                  firebaseUser.uid,
                  snapshot.data() as Partial<UserProfile>
                )
              : null,
            needsOnlineBootstrap: false,
          });
        });

        return;
      }

      try {
        signInPromise ??= signInAnonymously(auth)
          .then(() => undefined)
          .finally(() => {
            signInPromise = null;
          });

        await withBootstrapTimeout(signInPromise);
      } catch (error) {
        if (FirestoreService.isOfflineError(error)) {
          notifyAuthSubscribers({
            user: null,
            needsOnlineBootstrap: true,
          });
          return;
        }

        console.error("Error signing in anonymously:", error);
        notifyAuthSubscribers({
          user: null,
          needsOnlineBootstrap: false,
        });
      }
    };

    if (!unsubscribeOnlineListener && typeof window !== 'undefined') {
      const handleOnline = () => {
        void resolveCurrentAuthState();
      };

      window.addEventListener('online', handleOnline);
      unsubscribeOnlineListener = () => {
        window.removeEventListener('online', handleOnline);
      };
    }

    if (!unsubscribeAuthListener) {
      unsubscribeAuthListener = onAuthStateChanged(auth, async () => {
        await resolveCurrentAuthState();
      });
    }

    return () => {
      authSubscribers.delete(callback);

      if (authSubscribers.size > 0) {
        return;
      }

      unsubscribeProfileListener?.();
      unsubscribeProfileListener = null;
      unsubscribeAuthListener?.();
      unsubscribeAuthListener = null;
      unsubscribeOnlineListener?.();
      unsubscribeOnlineListener = null;
      cachedAuthState = null;
      hasResolvedAuth = false;
    };
  },

  /**
   * Bootstraps the user profile in Firestore.
   * Creates a new profile if one doesn't exist, otherwise updates lastActiveAt.
   */
  async bootstrapUserProfile(uid: string): Promise<AuthState> {
    const userRef = doc(db, 'users', uid);
    const userResult = await FirestoreService.readDocumentByRef<UserProfile>(userRef);

    if (userResult.data) {
      const profile = ProfileService.normalizeUserProfile(uid, userResult.data);

      if (!userResult.metadata.offline) {
        void setDoc(
          userRef,
          {
            ...profile,
            lastActiveAt: Date.now(),
          },
          { merge: true }
        ).catch((error) => {
          if (!FirestoreService.isOfflineError(error)) {
            console.error('Error updating last active timestamp:', error);
          }
        });
      }

      return {
        user: profile,
        needsOnlineBootstrap: false,
      };
    }

    if (userResult.metadata.offline) {
      return {
        user: null,
        needsOnlineBootstrap: true,
      };
    }

    const newProfile = ProfileService.createDefaultProfile(uid);
    const defaultSettings: UserSettings = {
      theme: 'system',
      notificationsEnabled: false,
      dailyReminderTime: '09:00',
    };

    try {
      await Promise.all([
        setDoc(userRef, newProfile),
        setDoc(doc(db, `users/${uid}/settings/main`), defaultSettings),
      ]);

      return {
        user: newProfile,
        needsOnlineBootstrap: false,
      };
    } catch (error) {
      if (FirestoreService.isOfflineError(error)) {
        return {
          user: null,
          needsOnlineBootstrap: true,
        };
      }

      console.error("Error bootstrapping user profile:", error);
      return {
        user: null,
        needsOnlineBootstrap: false,
      };
    }
  }
};
