"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface LeaderboardEntry {
  averageWeightedScore: number;
  domain: string;
  rank: number;
  submittedScoreCount: number;
  teamId: string;
  teamName: string;
}

export interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  error: Error | null;
  loading: boolean;
  updatedAt: number | null;
}

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

    const supabase = createClient();

    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("leaderboard_cache")
        .select(
          "team_id, team_name, domain, average_weighted_score, rank, submitted_score_count, last_updated"
        )
        .eq("competition_id", competitionId)
        .order("rank", { ascending: true });

      if (queryError) {
        setError(queryError);
        setLoading(false);
        return;
      }

      const mapped = (data ?? []).map((row) => ({
        teamId: row.team_id,
        teamName: row.team_name,
        domain: row.domain,
        averageWeightedScore: row.average_weighted_score,
        rank: row.rank,
        submittedScoreCount: row.submitted_score_count,
      }));

      setEntries(mapped);
      setUpdatedAt(Date.now());
      setLoading(false);
      setError(null);
    };

    load().catch((loadError: unknown) => {
      setError(loadError as Error);
      setLoading(false);
    });

    const channel = supabase
      .channel(`leaderboard:${competitionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard_cache",
          filter: `competition_id=eq.${competitionId}`,
        },
        () => {
          load().catch((loadError: unknown) => {
            setError(loadError as Error);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [competitionId]);

  return { entries, loading, error, updatedAt };
}
