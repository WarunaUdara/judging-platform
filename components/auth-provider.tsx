'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { CustomClaims } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  claims: CustomClaims | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  claims: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get custom claims
        const idTokenResult = await firebaseUser.getIdTokenResult();
        setClaims({
          role: idTokenResult.claims.role as CustomClaims['role'],
          orgId: idTokenResult.claims.orgId as string,
          competitionIds: (idTokenResult.claims.competitionIds as string[]) || [],
        });
      } else {
        setClaims(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, claims }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
