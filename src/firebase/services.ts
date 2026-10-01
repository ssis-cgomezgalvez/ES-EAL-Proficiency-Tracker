import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import {
  Student,
  WidaScore,
  ProficiencyAssessment,
  LanguageProfile,
  QuarterlySupport,
  UserProfile
} from '../types/eal';
import {
  INITIAL_STUDENTS,
  INITIAL_WIDA_SCORES,
  INITIAL_PROFICIENCY_ASSESSMENTS,
  INITIAL_LANGUAGE_PROFILES,
  INITIAL_QUARTERLY_SUPPORT
} from './seedData';

// Collection references
const STUDENTS_COLL = 'students';
const WIDA_SCORES_COLL = 'wida_scores';
const PROFICIENCY_COLL = 'proficiency_assessments';
const LANGUAGE_PROFILES_COLL = 'language_profiles';
const QUARTERLY_SUPPORT_COLL = 'quarterly_support';
const USERS_COLL = 'users';

// ================= STUDENTS SERVICES =================
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, STUDENTS_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const students: Student[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Student, 'id'>)
      }));
      onUpdate(students);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, STUDENTS_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function createStudent(student: Omit<Student, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, STUDENTS_COLL), {
      ...student,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, STUDENTS_COLL);
  }
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<void> {
  const path = `${STUDENTS_COLL}/${id}`;
  try {
    const docRef = doc(db, STUDENTS_COLL, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudent(id: string): Promise<void> {
  const path = `${STUDENTS_COLL}/${id}`;
  try {
    const docRef = doc(db, STUDENTS_COLL, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= WIDA SCORES SERVICES =================
export function subscribeToStudentWidaScores(
  studentId: string,
  onUpdate: (scores: WidaScore[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, WIDA_SCORES_COLL);
  const q = query(collRef, where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snapshot) => {
      const scores: WidaScore[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<WidaScore, 'id'>)
      }));
      // Sort chronologically
      scores.sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime());
      onUpdate(scores);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, WIDA_SCORES_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function createWidaScore(score: Omit<WidaScore, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, WIDA_SCORES_COLL), {
      ...score,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, WIDA_SCORES_COLL);
  }
}

export async function deleteWidaScore(id: string): Promise<void> {
  const path = `${WIDA_SCORES_COLL}/${id}`;
  try {
    await deleteDoc(doc(db, WIDA_SCORES_COLL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= PROFICIENCY ASSESSMENTS (A-H) SERVICES =================
export function subscribeToStudentAssessments(
  studentId: string,
  onUpdate: (assessments: ProficiencyAssessment[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, PROFICIENCY_COLL);
  const q = query(collRef, where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snapshot) => {
      const assessments: ProficiencyAssessment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ProficiencyAssessment, 'id'>)
      }));
      // Sort by letter A-H, then date
      assessments.sort((a, b) => {
        if (a.assessmentLetter !== b.assessmentLetter) {
          return a.assessmentLetter.localeCompare(b.assessmentLetter);
        }
        return new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime();
      });
      onUpdate(assessments);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, PROFICIENCY_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function createProficiencyAssessment(assessment: Omit<ProficiencyAssessment, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, PROFICIENCY_COLL), {
      ...assessment,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PROFICIENCY_COLL);
  }
}

export async function deleteProficiencyAssessment(id: string): Promise<void> {
  const path = `${PROFICIENCY_COLL}/${id}`;
  try {
    await deleteDoc(doc(db, PROFICIENCY_COLL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= LANGUAGE PROFILES SERVICES =================
export function subscribeToLanguageProfile(
  studentId: string,
  onUpdate: (profile: LanguageProfile | null) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, LANGUAGE_PROFILES_COLL);
  const q = query(collRef, where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(null);
      } else {
        const docSnap = snapshot.docs[0];
        onUpdate({
          id: docSnap.id,
          ...(docSnap.data() as Omit<LanguageProfile, 'id'>)
        });
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, LANGUAGE_PROFILES_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function saveLanguageProfile(profile: LanguageProfile): Promise<string> {
  try {
    if (profile.id) {
      const docRef = doc(db, LANGUAGE_PROFILES_COLL, profile.id);
      await updateDoc(docRef, {
        whatCanStudentDoWithLanguage: profile.whatCanStudentDoWithLanguage,
        socialCulturalMultilingualStrengths: profile.socialCulturalMultilingualStrengths,
        concreteFeedbackForGrowth: profile.concreteFeedbackForGrowth,
        effectiveScaffoldsAndModalities: profile.effectiveScaffoldsAndModalities,
        currentGoals: profile.currentGoals,
        lastUpdated: new Date().toISOString()
      });
      return profile.id;
    } else {
      // Check if one already exists for student
      const q = query(collection(db, LANGUAGE_PROFILES_COLL), where('studentId', '==', profile.studentId));
      const existing = await getDocs(q);
      if (!existing.empty) {
        const existingDocId = existing.docs[0].id;
        const docRef = doc(db, LANGUAGE_PROFILES_COLL, existingDocId);
        await updateDoc(docRef, {
          whatCanStudentDoWithLanguage: profile.whatCanStudentDoWithLanguage,
          socialCulturalMultilingualStrengths: profile.socialCulturalMultilingualStrengths,
          concreteFeedbackForGrowth: profile.concreteFeedbackForGrowth,
          effectiveScaffoldsAndModalities: profile.effectiveScaffoldsAndModalities,
          currentGoals: profile.currentGoals,
          lastUpdated: new Date().toISOString()
        });
        return existingDocId;
      }

      const docRef = await addDoc(collection(db, LANGUAGE_PROFILES_COLL), {
        ...profile,
        lastUpdated: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, LANGUAGE_PROFILES_COLL);
  }
}

// ================= QUARTERLY SUPPORT SERVICES =================
export function subscribeToQuarterlySupport(
  studentId: string,
  onUpdate: (supports: QuarterlySupport[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, QUARTERLY_SUPPORT_COLL);
  const q = query(collRef, where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: QuarterlySupport[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<QuarterlySupport, 'id'>)
      }));
      // Sort by school year desc, then quarter
      records.sort((a, b) => {
        if (a.schoolYear !== b.schoolYear) return b.schoolYear.localeCompare(a.schoolYear);
        return a.quarter.localeCompare(b.quarter);
      });
      onUpdate(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, QUARTERLY_SUPPORT_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function createQuarterlySupport(support: Omit<QuarterlySupport, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, QUARTERLY_SUPPORT_COLL), {
      ...support,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, QUARTERLY_SUPPORT_COLL);
  }
}

export async function deleteQuarterlySupport(id: string): Promise<void> {
  const path = `${QUARTERLY_SUPPORT_COLL}/${id}`;
  try {
    await deleteDoc(doc(db, QUARTERLY_SUPPORT_COLL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= GLOBAL AGGREGATE SUBSCRIPTIONS =================
export function subscribeToAllWidaScores(
  onUpdate: (scores: WidaScore[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, WIDA_SCORES_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const scores: WidaScore[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<WidaScore, 'id'>)
      }));
      onUpdate(scores);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, WIDA_SCORES_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export function subscribeToAllAssessments(
  onUpdate: (assessments: ProficiencyAssessment[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, PROFICIENCY_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: ProficiencyAssessment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ProficiencyAssessment, 'id'>)
      }));
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, PROFICIENCY_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export function subscribeToAllQuarterlySupports(
  onUpdate: (supports: QuarterlySupport[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, QUARTERLY_SUPPORT_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: QuarterlySupport[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<QuarterlySupport, 'id'>)
      }));
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, QUARTERLY_SUPPORT_COLL);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

// ================= USER ROLES SERVICES =================
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `${USERS_COLL}/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, USERS_COLL, uid));
    if (docSnap.exists()) {
      return { uid, ...(docSnap.data() as Omit<UserProfile, 'uid'>) };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncUserProfile(userProfile: UserProfile): Promise<void> {
  const path = `${USERS_COLL}/${userProfile.uid}`;
  try {
    await setDoc(doc(db, USERS_COLL, userProfile.uid), {
      email: userProfile.email,
      displayName: userProfile.displayName,
      role: userProfile.role,
      homeroomGrade: userProfile.homeroomGrade || '',
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= ONE-CLICK INITIAL DATA SEEDER =================
export async function seedDemoDataIfEmpty(retries = 2): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const studentsSnap = await getDocs(collection(db, STUDENTS_COLL));
      if (!studentsSnap.empty) {
        return false; // Already populated
      }

      console.log('Seeding initial international elementary school EAL student data...');

      // 1. Add students
      for (const student of INITIAL_STUDENTS) {
        await addDoc(collection(db, STUDENTS_COLL), {
          ...student,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Add WIDA scores
      for (const score of INITIAL_WIDA_SCORES) {
        await addDoc(collection(db, WIDA_SCORES_COLL), {
          ...score,
          createdAt: new Date().toISOString()
        });
      }

      // 3. Add Proficiency Assessments
      for (const assessment of INITIAL_PROFICIENCY_ASSESSMENTS) {
        await addDoc(collection(db, PROFICIENCY_COLL), {
          ...assessment,
          createdAt: new Date().toISOString()
        });
      }

      // 4. Add Language Profiles
      for (const [studentId, profile] of Object.entries(INITIAL_LANGUAGE_PROFILES)) {
        await addDoc(collection(db, LANGUAGE_PROFILES_COLL), {
          ...profile,
          lastUpdated: new Date().toISOString()
        });
      }

      // 5. Add Quarterly Support
      for (const support of INITIAL_QUARTERLY_SUPPORT) {
        await addDoc(collection(db, QUARTERLY_SUPPORT_COLL), {
          ...support,
          createdAt: new Date().toISOString()
        });
      }

      console.log('Seed completed successfully!');
      return true;
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Seed attempt ${attempt + 1} failed, retrying in 1s...`, error);
        await new Promise((res) => setTimeout(res, 1000));
      } else {
        console.warn('Initial seed deferred; can be loaded manually from dashboard:', error);
        return false;
      }
    }
  }
  return false;
}
