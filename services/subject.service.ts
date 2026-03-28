import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { Subject } from '@/types';

export const SubjectService = {
  getCollectionPath(uid: string) {
    return `users/${uid}/subjects`;
  },

  async getSubjects(uid: string): Promise<Subject[]> {
    try {
      const colRef = collection(db, this.getCollectionPath(uid));
      // Order by weekday and then startTime
      const q = query(colRef, orderBy('weekday', 'asc'), orderBy('startTime', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  },

  async getSubjectsByWeekday(uid: string, weekday: number): Promise<Subject[]> {
    try {
      const colRef = collection(db, this.getCollectionPath(uid));
      const q = query(colRef, where('weekday', '==', weekday), orderBy('startTime', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
    } catch (error) {
      console.error("Error fetching subjects by weekday:", error);
      return [];
    }
  },

  async createSubject(uid: string, subjectData: Omit<Subject, 'id' | 'createdAt' | 'totalSessions' | 'attendedSessions'>): Promise<Subject | null> {
    try {
      const colRef = collection(db, this.getCollectionPath(uid));
      const newDocRef = doc(colRef);
      
      const newSubject: Subject = {
        ...subjectData,
        id: newDocRef.id,
        createdAt: Date.now(),
        totalSessions: 0,
        attendedSessions: 0,
      };

      await setDoc(newDocRef, newSubject);
      return newSubject;
    } catch (error) {
      console.error("Error creating subject:", error);
      return null;
    }
  },

  async updateSubject(uid: string, subjectId: string, updates: Partial<Omit<Subject, 'id' | 'createdAt'>>): Promise<boolean> {
    try {
      const docRef = doc(db, this.getCollectionPath(uid), subjectId);
      await setDoc(docRef, updates, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating subject:", error);
      return false;
    }
  },

  async deleteSubject(uid: string, subjectId: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.getCollectionPath(uid), subjectId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting subject:", error);
      return false;
    }
  },

  async seedDemoSubjects(uid: string): Promise<boolean> {
    const demoSubjects = [
      { name: 'Advanced Mathematics', weekday: 1, startTime: '09:00', endTime: '11:00', room: 'Room 301', teacher: 'Dr. Smith', color: 'oklch(0.6 0.15 250)' },
      { name: 'Physics Lab', weekday: 1, startTime: '13:00', endTime: '15:30', room: 'Lab 2', teacher: 'Prof. Johnson', color: 'oklch(0.7 0.15 150)' },
      { name: 'Computer Science', weekday: 2, startTime: '10:00', endTime: '12:00', room: 'Room 405', teacher: 'Mrs. Davis', color: 'oklch(0.75 0.15 50)' },
      { name: 'Literature', weekday: 3, startTime: '08:00', endTime: '09:30', room: 'Room 102', teacher: 'Mr. Wilson', color: 'oklch(0.6 0.2 25)' },
    ];

    try {
      for (const sub of demoSubjects) {
        await this.createSubject(uid, sub);
      }
      return true;
    } catch (error) {
      console.error("Error seeding subjects:", error);
      return false;
    }
  }
};
