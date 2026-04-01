'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth-provider';
import { useLeaderboard, LeaderboardEntry } from '@/lib/hooks/useLeaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { Competition } from '@/lib/types';

export default function JudgeLeaderboardPage() {
  const { claims } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { entries: leaderboard, loading: leaderboardLoading } =
    useLeaderboard(selectedCompetition);

  useEffect(() => {
    const fetchCompetitions = async () => {
      if (!claims?.competitionIds?.length) {
        setLoading(false);
        return;
      }

      try {
        const comps: Competition[] = [];
        for (const compId of claims.competitionIds) {
          const compDoc = await getDoc(doc(db, 'competitions', compId));
          if (compDoc.exists()) {
            const comp = { id: compDoc.id, ...compDoc.data() } as Competition;
            // Only show leaderboard if config allows
            if (
              comp.scoringConfig.showLeaderboardTo === 'evaluators_and_organizers'
            ) {
              comps.push(comp);
            }
          }
        }
        setCompetitions(comps);

        if (comps.length > 0) {
          setSelectedCompetition(comps[0].id);
        }
      } catch (error) {
        console.error('Error fetching competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, [claims]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading...</div>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center text-[#888888]">
            Leaderboard is not available for your assigned competitions.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leaderboard</h1>
          <p className="text-[#888888] text-sm mt-1">Live team rankings</p>
        </div>

        {competitions.length > 1 && (
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="w-full sm:w-64 h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
          >
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {leaderboardLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-[#888888]">
            Loading leaderboard...
          </CardContent>
        </Card>
      ) : leaderboard.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-[#888888]">
            No scores submitted yet
          </CardContent>
        </Card>
      ) : (
        <div className="border border-[#333333]">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
            <div className="col-span-2">Rank</div>
            <div className="col-span-5">Team</div>
            <div className="col-span-2">Domain</div>
            <div className="col-span-3">Score</div>
          </div>

          {leaderboard.map((entry: LeaderboardEntry) => (
            <div
              key={entry.teamId}
              className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 items-center"
            >
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 text-sm border ${
                    entry.rank <= 3
                      ? 'border-white text-white font-bold'
                      : 'border-[#333333] text-[#888888]'
                  }`}
                >
                  {entry.rank}
                </span>
              </div>
              <div className="col-span-5">
                <p className="font-medium">{entry.teamName}</p>
              </div>
              <div className="col-span-2 text-sm text-[#888888]">
                {entry.domain || '-'}
              </div>
              <div className="col-span-3">
                <p className="font-semibold">
                  {entry.averageWeightedScore.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
