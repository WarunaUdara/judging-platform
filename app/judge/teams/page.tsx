'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Competition, Team } from '@/lib/types';

interface TeamWithStatus extends Team {
  isScored: boolean;
}

export default function JudgeTeamsPage() {
  const { user, claims } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [teams, setTeams] = useState<TeamWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'scored'>('all');

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
            comps.push({ id: compDoc.id, ...compDoc.data() } as Competition);
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

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedCompetition || !user) return;

      try {
        // Fetch teams
        const teamsSnap = await getDocs(
          collection(db, `competitions/${selectedCompetition}/teams`)
        );
        const teamsList = teamsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Team[];

        // Fetch user's scorecards
        const scorecardsSnap = await getDocs(
          query(
            collection(db, `competitions/${selectedCompetition}/scorecards`),
            where('evaluatorId', '==', user.uid)
          )
        );
        const scoredTeamIds = new Set(
          scorecardsSnap.docs
            .filter((doc) => doc.data().status === 'submitted')
            .map((doc) => doc.data().teamId)
        );

        const teamsWithStatus: TeamWithStatus[] = teamsList.map((team) => ({
          ...team,
          isScored: scoredTeamIds.has(team.id),
        }));

        setTeams(teamsWithStatus);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [selectedCompetition, user]);

  const filteredTeams = teams.filter((team) => {
    if (filter === 'pending') return !team.isScored;
    if (filter === 'scored') return team.isScored;
    return true;
  });

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
          <h1 className="text-2xl font-semibold">Teams</h1>
          <p className="text-[#888888] text-sm mt-1">
            Score teams in your assigned competition
          </p>
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

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'scored'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
            {f === 'all' && ` (${teams.length})`}
            {f === 'pending' && ` (${teams.filter((t) => !t.isScored).length})`}
            {f === 'scored' && ` (${teams.filter((t) => t.isScored).length})`}
          </Button>
        ))}
      </div>

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-[#888888]">
            {filter === 'pending'
              ? 'All teams have been scored!'
              : filter === 'scored'
              ? 'No teams scored yet'
              : 'No teams available'}
          </CardContent>
        </Card>
      ) : (
        <div className="border border-[#333333]">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
            <div className="col-span-4">Team</div>
            <div className="col-span-3">Project</div>
            <div className="col-span-2">Domain</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Action</div>
          </div>

          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 items-center hover:bg-[#0a0a0a] transition-colors"
            >
              <div className="col-span-4">
                <p className="font-medium">{team.name}</p>
                <p className="text-xs text-[#888888]">
                  {team.members?.length || 0} members
                </p>
              </div>
              <div className="col-span-3 text-sm text-[#a1a1a1] truncate">
                {team.projectTitle || '-'}
              </div>
              <div className="col-span-2 text-sm text-[#888888]">
                {team.domain || '-'}
              </div>
              <div className="col-span-2">
                {team.isScored ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-white text-white">
                    <CheckCircle className="w-3 h-3" />
                    Scored
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-[#333333] text-[#888888]">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </div>
              <div className="col-span-1">
                <Link
                  href={`/judge/teams/${team.id}?competition=${selectedCompetition}`}
                >
                  <Button variant="outline" size="sm">
                    {team.isScored ? 'View' : 'Score'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
