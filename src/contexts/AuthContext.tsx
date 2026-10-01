import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { UserProfile, UserRole } from '../types/eal';
import { getUserProfile, syncUserProfile } from '../firebase/services';

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;

export const getCachedAccessToken = (): string | null => cachedAccessToken;

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  accessToken: string | null;
  isEalTeacher: boolean;
  isHomeroomTeacher: boolean;
  isAdmin: boolean;
  canEditStudents: boolean;
  canEditAssessments: boolean;
  canEditLanguageProfile: boolean;
  canViewReports: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('eal_teacher');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        cachedAccessToken = null;
        setAccessToken(null);
      }
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          const isBootstrapAdmin = user.email === 'cgomezgalvez@ssis.edu.vn';
          
          if (!profile) {
            profile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Educator',
              role: isBootstrapAdmin ? 'admin' : 'eal_teacher',
              homeroomGrade: '3'
            };
            await syncUserProfile(profile);
          } else if (isBootstrapAdmin && profile.role !== 'admin') {
            profile.role = 'admin';
            await syncUserProfile(profile);
          }
          setUserProfile(profile);
          setActiveRole(profile.role);
        } catch (e) {
          console.error('Error fetching/syncing user profile:', e);
          const defaultRole: UserRole = user.email === 'cgomezgalvez@ssis.edu.vn' ? 'admin' : 'eal_teacher';
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Educator',
            role: defaultRole
          });
          setActiveRole(defaultRole);
        }
      } else {
        // Fallback demo user for immediate classroom preview
        setUserProfile({
          uid: 'demo-eal-teacher',
          email: 'eal.specialist@elementary.edu',
          displayName: 'Ms. Clara Vance (EAL Lead)',
          role: 'eal_teacher',
          homeroomGrade: '3'
        });
        setActiveRole('eal_teacher');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<string | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setAccessToken(credential.accessToken);
        return credential.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      cachedAccessToken = null;
      setAccessToken(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Sign-Out failed:', error);
    }
  };

  const isEalTeacher = activeRole === 'eal_teacher';
  const isHomeroomTeacher = activeRole === 'homeroom_teacher';
  const isAdmin = activeRole === 'admin';

  // Role permissions
  const canEditStudents = isEalTeacher || isAdmin;
  const canEditAssessments = isEalTeacher || isAdmin;
  const canEditLanguageProfile = isEalTeacher || isAdmin || isHomeroomTeacher; // Homeroom teachers can contribute notes/goals
  const canViewReports = true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        activeRole,
        setActiveRole,
        signInWithGoogle,
        signOut,
        accessToken,
        isEalTeacher,
        isHomeroomTeacher,
        isAdmin,
        canEditStudents,
        canEditAssessments,
        canEditLanguageProfile,
        canViewReports
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
