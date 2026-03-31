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
          
          if (data?.entries) {
            const sorted = Object.entries(data.entries)
              .map(([teamId, value]: [string, any]) => ({
                teamId,
                teamName: value.teamName || '',
                domain: value.domain || '',
                averageWeightedScore: value.averageWeightedScore || 0,
                rank: value.rank || 0,
                submittedScoreCount: value.submittedScoreCount || 0,
              }))
              .sort((a, b) => a.rank - b.rank);
            
            setEntries(sorted);
            setUpdatedAt(data.updatedAt || Date.now());
          } else {
            setEntries([]);
            setUpdatedAt(null);
          }
          
          setError(null);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
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
