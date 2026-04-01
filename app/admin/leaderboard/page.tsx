'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useLeaderboard, LeaderboardEntry } from '@/lib/hooks/useLeaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { Competition } from '@/lib/types';

export default function LeaderboardPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { entries: leaderboard, loading: leaderboardLoading } =
    useLeaderboard(selectedCompetition);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'competitions'));
        const comps = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Competition[];

        // Filter to active or scoring competitions
        const activeComps = comps.filter(
          (c) => c.status === 'active' || c.status === 'scoring' || c.status === 'closed'
        );
        setCompetitions(activeComps);

        if (activeComps.length > 0) {
          setSelectedCompetition(activeComps[0].id);
        }
      } catch (error) {
        console.error('Error fetching competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leaderboard</h1>
          <p className="text-[#888888] text-sm mt-1">
            Real-time team rankings
          </p>
        </div>

        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          className="w-full sm:w-64 h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
        >
          <option value="">Select competition...</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedCompetition ? (
        <Card>
          <CardContent className="py-12 text-center text-[#888888]">
            Select a competition to view the leaderboard
          </CardContent>
        </Card>
      ) : leaderboardLoading ? (
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
        <>
          {/* Top 3 */}
          <div className="grid md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((entry: LeaderboardEntry, idx: number) => (
              <Card
                key={entry.teamId}
                className={idx === 0 ? 'border-white' : ''}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 flex items-center justify-center border ${
                        idx === 0
                          ? 'border-white text-white'
                          : 'border-[#333333] text-[#888888]'
                      }`}
                    >
                      <span className="text-lg font-bold">{idx + 1}</span>
                    </div>
                    {idx === 0 && <Trophy className="w-5 h-5 text-white" />}
                  </div>
                  <h3 className="font-semibold text-lg">{entry.teamName}</h3>
                  <p className="text-xs text-[#888888] mb-4">{entry.domain}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">
                        {entry.averageWeightedScore.toFixed(2)}
                      </p>
                      <p className="text-xs text-[#888888]">weighted score</p>
                    </div>
                    <div className="text-right text-xs text-[#888888]">
                      <p>{entry.submittedScoreCount}</p>
                      <p>evaluators</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Rankings Table */}
          <div className="border border-[#333333]">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Team</div>
              <div className="col-span-2">Domain</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2">Evaluations</div>
            </div>

            {leaderboard.map((entry: LeaderboardEntry) => (
              <div
                key={entry.teamId}
                className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 items-center hover:bg-[#0a0a0a] transition-colors"
              >
                <div className="col-span-1">
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
                <div className="col-span-2">
                  <p className="font-semibold">
                    {entry.averageWeightedScore.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 text-sm text-[#888888]">
                  {entry.submittedScoreCount}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
