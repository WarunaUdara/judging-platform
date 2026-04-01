'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  competitionIds: string[];
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  competitionIds: [],
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [competitionIds, setCompetitionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setRole(data.role as UserRole);
          setCompetitionIds(data.competitionIds || []);
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Clear session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      setUser(null);
      setRole(null);
      setCompetitionIds([]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch session data from our API
        await refreshSession();
      } else {
        setRole(null);
        setCompetitionIds([]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [refreshSession]);

  return (
    <AuthContext.Provider value={{ user, loading, role, competitionIds, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
