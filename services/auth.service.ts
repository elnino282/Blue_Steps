import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile, UserSettings } from '@/types';

export const AuthService = {
  /**
   * Initializes anonymous authentication.
   * If the user is not signed in, it signs them in anonymously.
   * If they are signed in, it bootstraps their profile in Firestore.
   */
  initAuth(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in (anonymously)
        const profile = await this.bootstrapUserProfile(firebaseUser.uid);
        callback(profile);
      } else {
        // No user, sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Error signing in anonymously:", error);
          callback(null);
        }
      }
    });
  },

  /**
   * Bootstraps the user profile in Firestore.
   * Creates a new profile if one doesn't exist, otherwise updates lastActiveAt.
   */
  async bootstrapUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Profile exists, update last active timestamp
        await setDoc(userRef, { lastActiveAt: Date.now() }, { merge: true });
        return userSnap.data() as UserProfile;
      } else {
        // Create new profile for the anonymous user
        const newProfile: UserProfile = {
          uid,
          displayName: 'Explorer',
          level: 1,
          xp: 0,
          streak: 0,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
        };
        
        const defaultSettings: UserSettings = {
          theme: 'system',
          notificationsEnabled: false,
          dailyReminderTime: '09:00',
        };

        // Create user document
        await setDoc(userRef, newProfile);
        
        // Create default settings subcollection document
        await setDoc(doc(db, `users/${uid}/settings/main`), defaultSettings);
        
        return newProfile;
      }
    } catch (error) {
      console.error("Error bootstrapping user profile:", error);
      return null;
    }
  }
};
