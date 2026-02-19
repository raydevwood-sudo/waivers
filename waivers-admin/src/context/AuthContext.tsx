import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import app from '../config/firebase';
import {
  getValidWaiversAccessControl,
  isValidWaiversEmailAuthorized,
} from '../services/settings.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  const assertAccessAllowed = async (user: User): Promise<void> => {
    const email = user.email?.trim().toLowerCase();
    if (!email) {
      await firebaseSignOut(auth);
      throw new Error('This account does not have a valid email address.');
    }

    const accessControl = await getValidWaiversAccessControl();
    const isAuthorized = isValidWaiversEmailAuthorized(email, accessControl);

    if (!isAuthorized) {
      await firebaseSignOut(auth);
      throw new Error('This account is not authorized to access Valid Waivers.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await assertAccessAllowed(user);
        setUser(user);
      } catch (error) {
        console.error('Authorization check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [auth]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(auth, provider);
      await assertAccessAllowed(credential.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
