import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { UserProfile, AccountType, Language } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, firstName: string, lastName: string, phone: string, accountType: AccountType) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string, accountType?: AccountType, phone?: string) => Promise<void>;
  loginAsDemoUser: (role?: UserRole, type?: AccountType) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or create default
  const fetchOrCreateProfile = async (firebaseUser: User, extraData?: Partial<UserProfile>) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      } else {
        const names = (firebaseUser.displayName || 'Utilisateur ImmoPlus').split(' ');
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Utilisateur',
          firstName: extraData?.firstName || names[0] || 'Utilisateur',
          lastName: extraData?.lastName || names.slice(1).join(' ') || '',
          phone: extraData?.phone || '+213 555 12 34 56',
          whatsapp: extraData?.whatsapp || '213555123456',
          accountType: extraData?.accountType || 'private_owner',
          role: firebaseUser.email === 'oussamaguesmia2@gmail.com' ? 'admin' : 'user',
          isVerified: true,
          preferredLanguage: 'fr',
          photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          city: 'Sétif',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Profile sync fallback:', err);
      // Local fallback
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Utilisateur',
        firstName: extraData?.firstName || 'Oussama',
        lastName: extraData?.lastName || 'Guesmia',
        phone: '+213 555 12 34 56',
        accountType: 'private_owner',
        role: firebaseUser.email === 'oussamaguesmia2@gmail.com' ? 'admin' : 'user',
        isVerified: true,
        preferredLanguage: 'fr',
        photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchOrCreateProfile(currentUser);
      } else {
        // If demo profile exists in localStorage, restore it
        const savedDemo = localStorage.getItem('immoplus_demo_user');
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo) as UserProfile;
            setUserProfile(parsed);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    localStorage.removeItem('immoplus_demo_user');
    await fetchOrCreateProfile(res.user);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    localStorage.removeItem('immoplus_demo_user');
    await fetchOrCreateProfile(res.user);
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    firstName: string, 
    lastName: string, 
    phone: string, 
    accountType: AccountType
  ) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const displayName = `${firstName} ${lastName}`.trim();
    await updateProfile(res.user, { displayName });
    localStorage.removeItem('immoplus_demo_user');
    await fetchOrCreateProfile(res.user, { firstName, lastName, phone, accountType });
  };

  const loginAsDemoUser = async (role: 'user' | 'admin' = 'user') => {
    const demoProfile: UserProfile = {
      uid: role === 'admin' ? 'admin-oussamaguesmia' : 'user-oussama-demo',
      email: role === 'admin' ? 'oussamaguesmia2@gmail.com' : 'o.guesmia@gmail.com',
      displayName: 'Oussama Guesmia',
      firstName: 'Oussama',
      lastName: 'Guesmia',
      phone: '+213 555 12 34 56',
      whatsapp: '213555123456',
      accountType: 'private_owner',
      role: role,
      isVerified: true,
      preferredLanguage: 'fr',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      city: 'Sétif, Algérie',
      bio: 'Propriétaire et investisseur immobilier basé à Sétif.',
      createdAt: '2025-04-10T08:00:00.000Z'
    };
    setUserProfile(demoProfile);
    localStorage.setItem('immoplus_demo_user', JSON.stringify(demoProfile));
  };

  const logout = async () => {
    localStorage.removeItem('immoplus_demo_user');
    setUserProfile(null);
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...data };
    setUserProfile(updated);
    if (localStorage.getItem('immoplus_demo_user')) {
      localStorage.setItem('immoplus_demo_user', JSON.stringify(updated));
    }
    try {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, updated, { merge: true });
      }
    } catch (err) {
      console.warn('Error updating Firestore profile:', err);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmail(email, pass);
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    accountType: AccountType = 'private_owner',
    phone: string = ''
  ) => {
    const [firstName, ...rest] = displayName.split(' ');
    const lastName = rest.join(' ');
    await signUpWithEmail(email, pass, firstName || displayName, lastName || '', phone, accountType);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      loginWithEmail,
      registerWithEmail,
      loginAsDemoUser,
      logout,
      updateUserProfile,
      updateProfile: updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
