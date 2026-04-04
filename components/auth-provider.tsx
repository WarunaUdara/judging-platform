"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

interface AuthContextType {
  competitionIds: string[];
  loading: boolean;
  refreshSession: () => Promise<void>;
  role: UserRole | null;
  signOut: () => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  competitionIds: [],
  signOut: () => Promise.resolve(),
  refreshSession: () => Promise.resolve(),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [competitionIds, setCompetitionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setRole(data.role as UserRole);
          setCompetitionIds(data.competitionIds || []);
          return;
        }
      }

      setRole(null);
      setCompetitionIds([]);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setRole(null);
      setCompetitionIds([]);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();

      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });

      setUser(null);
      setRole(null);
      setCompetitionIds([]);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);

      if (session?.user) {
        await refreshSession();
      } else {
        setRole(null);
        setCompetitionIds([]);
      }

      setLoading(false);
    };

    bootstrap().catch((error: unknown) => {
      console.error("Auth bootstrap failed:", error);
      if (isMounted) {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await refreshSession();
      } else {
        setRole(null);
        setCompetitionIds([]);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshSession, supabase]);

  const value = useMemo(
    () => ({ user, loading, role, competitionIds, signOut, refreshSession }),
    [competitionIds, loading, refreshSession, role, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
