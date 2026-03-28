import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';

export const FirestoreService = {
  /**
   * Generic helper to get a single document
   */
  async getDocument<T>(path: string): Promise<T | null> {
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    } catch (error) {
      console.error(`Error getting document at ${path}:`, error);
      return null;
    }
  },

  /**
   * Generic helper to get all documents in a collection
   */
  async getCollection<T>(path: string): Promise<(T & { id: string })[]> {
    try {
      const colRef = collection(db, path);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
    } catch (error) {
      console.error(`Error getting collection at ${path}:`, error);
      return [];
    }
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
