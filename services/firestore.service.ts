import { db } from '@/lib/firebase';
import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocFromCache,
  getDocs,
  getDocsFromCache,
  Query,
  QuerySnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export type FirestoreReadMetadata = {
  offline: boolean;
  fromCache: boolean;
};

export type FirestoreDocumentResult<T> = {
  data: T | null;
  metadata: FirestoreReadMetadata & {
    exists: boolean;
  };
};

export type FirestoreCollectionResult<T> = {
  data: (T & { id: string })[];
  metadata: FirestoreReadMetadata;
};

const FIRESTORE_READ_TIMEOUT_MS = 3000;

function mapCollectionSnapshot<T>(snapshot: QuerySnapshot<DocumentData>) {
  return snapshot.docs.map(
    (documentSnapshot) =>
      ({ id: documentSnapshot.id, ...documentSnapshot.data() }) as T & { id: string }
  );
}

function createReadTimeoutError(scope: string) {
  const error = new Error(`Firestore read timeout while loading ${scope}`);
  (error as Error & { code?: string }).code = 'deadline-exceeded';
  return error;
}

async function withReadTimeout<T>(promise: Promise<T>, scope: string) {
  let timeoutId: number | undefined;

  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(createReadTimeoutError(scope));
        }, FIRESTORE_READ_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
}

export const FirestoreService = {
  isOfflineError(error: unknown) {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const code =
      'code' in error && typeof error.code === 'string'
        ? error.code
        : '';
    const message =
      'message' in error && typeof error.message === 'string'
        ? error.message.toLowerCase()
        : '';

    return (
      code === 'unavailable' ||
      code === 'deadline-exceeded' ||
      code === 'failed-precondition' ||
      message.includes('offline') ||
      message.includes('network') ||
      message.includes('timeout')
    );
  },

  logReadError(scope: string, error: unknown) {
    if (this.isOfflineError(error)) {
      return;
    }

    console.error(scope, error);
  },

  async readDocumentByRef<T>(
    documentRef: DocumentReference<DocumentData>
  ): Promise<FirestoreDocumentResult<T>> {
    try {
      const snapshot =
        typeof window === 'undefined'
          ? await getDoc(documentRef)
          : await withReadTimeout(getDoc(documentRef), documentRef.path);

      return {
        data: snapshot.exists() ? (snapshot.data() as T) : null,
        metadata: {
          offline: false,
          fromCache: snapshot.metadata.fromCache,
          exists: snapshot.exists(),
        },
      };
    } catch (error) {
      this.logReadError(`Error getting document at ${documentRef.path}:`, error);

      try {
        const snapshot = await getDocFromCache(documentRef);

        return {
          data: snapshot.exists() ? (snapshot.data() as T) : null,
          metadata: {
            offline: true,
            fromCache: true,
            exists: snapshot.exists(),
          },
        };
      } catch (cacheError) {
        return {
          data: null,
          metadata: {
            offline: this.isOfflineError(error) || this.isOfflineError(cacheError),
            fromCache: true,
            exists: false,
          },
        };
      }
    }
  },

  async readCollectionByQuery<T>(
    queryRef: Query<DocumentData> | CollectionReference<DocumentData>
  ): Promise<FirestoreCollectionResult<T>> {
    const path = 'path' in queryRef ? queryRef.path : 'query';

    try {
      const snapshot =
        typeof window === 'undefined'
          ? await getDocs(queryRef)
          : await withReadTimeout(getDocs(queryRef), path);

      return {
        data: mapCollectionSnapshot<T>(snapshot),
        metadata: {
          offline: false,
          fromCache: snapshot.metadata.fromCache,
        },
      };
    } catch (error) {
      this.logReadError(`Error getting collection at ${path}:`, error);

      try {
        const snapshot = await getDocsFromCache(queryRef);

        return {
          data: mapCollectionSnapshot<T>(snapshot),
          metadata: {
            offline: true,
            fromCache: true,
          },
        };
      } catch (cacheError) {
        return {
          data: [],
          metadata: {
            offline: this.isOfflineError(error) || this.isOfflineError(cacheError),
            fromCache: true,
          },
        };
      }
    }
  },

  /**
   * Generic helper to get a single document
   */
  async getDocument<T>(path: string): Promise<T | null> {
    const result = await this.readDocumentByRef<T>(doc(db, path));
    return result.data;
  },

  /**
   * Generic helper to get all documents in a collection
   */
  async getCollection<T>(path: string): Promise<(T & { id: string })[]> {
    const result = await this.readCollectionByQuery<T>(collection(db, path));
    return result.data;
  },

  /**
   * Generic helper to set a document (create or overwrite)
   */
  async setDocument(path: string, data: DocumentData, merge = true): Promise<boolean> {
    try {
      const docRef = doc(db, path);
      await setDoc(docRef, data, { merge });
      return true;
    } catch (error) {
      console.error(`Error setting document at ${path}:`, error);
      return false;
    }
  },

  /**
   * Generic helper to update a document (fails if it doesn't exist)
   */
  async updateDocument(path: string, data: Partial<DocumentData>): Promise<boolean> {
    try {
      const docRef = doc(db, path);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error(`Error updating document at ${path}:`, error);
      return false;
    }
  },

  /**
   * Generic helper to delete a document
   */
  async deleteDocument(path: string): Promise<boolean> {
    try {
      const docRef = doc(db, path);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document at ${path}:`, error);
      return false;
    }
  }
};
