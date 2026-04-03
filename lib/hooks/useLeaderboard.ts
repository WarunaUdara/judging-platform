'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase/client';

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  domain: string;
  averageWeightedScore: number;
  rank: number;
  submittedScoreCount: number;
}

export interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: Error | null;
  updatedAt: number | null;
}

/**
 * Real-time hook for subscribing to leaderboard updates from Firebase Realtime Database
 * @param competitionId The competition ID to subscribe to
 * @returns Leaderboard entries, loading state, and error
 */
export function useLeaderboard(competitionId: string): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!competitionId) {
      setLoading(false);
      return;
    }

    const leaderboardRef = ref(rtdb, `leaderboards/${competitionId}`);

    const unsubscribe = onValue(
      leaderboardRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          console.log('Leaderboard data received:', data);
          
          if (!data) {
            setEntries([]);
            setUpdatedAt(null);
            setLoading(false);
            return;
          }

          // Handle both data structures:
          // 1. { entries: { team-1: {...}, team-2: {...} }, updatedAt: ... }
          // 2. { entries: { team-1: {...}, team-2: {...}, updatedAt: ... } }
          const entriesData = data.entries || data;
          
          // Extract updatedAt from wherever it is
          const timestamp = data.updatedAt || entriesData?.updatedAt || Date.now();
          
          // Filter out non-team entries (like updatedAt) - team entries have teamName property
          const teamEntries = Object.entries(entriesData)
            .filter(([key, value]) => {
              if (key === 'updatedAt') return false;
              // Check if this looks like a team entry (has teamName or averageWeightedScore)
              const v = value as Record<string, unknown>;
              return v && (typeof v.teamName === 'string' || typeof v.averageWeightedScore === 'number');
            })
            .map(([teamId, value]: [string, any]) => ({
              teamId,
              teamName: value.teamName || '',
              domain: value.domain || '',
              averageWeightedScore: value.averageWeightedScore || 0,
              rank: value.rank || 0,
              submittedScoreCount: value.submittedScoreCount || 0,
            }))
            .sort((a, b) => a.rank - b.rank);
          
          console.log('Parsed leaderboard entries:', teamEntries);
          setEntries(teamEntries);
          setUpdatedAt(timestamp);
          setError(null);
        } catch (err) {
          console.error('Error parsing leaderboard data:', err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firebase RTDB error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => {
      off(leaderboardRef);
    };
  }, [competitionId]);

  return { entries, loading, error, updatedAt };
}
