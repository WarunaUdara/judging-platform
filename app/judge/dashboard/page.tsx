'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Competition, Team } from '@/lib/types';

interface DashboardStats {
  totalTeams: number;
  scoredTeams: number;
  pendingTeams: number;
}

export default function JudgeDashboard() {
  const { user, competitionIds } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    scoredTeams: 0,
    pendingTeams: 0,
  });
  const [recentTeams, setRecentTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !competitionIds?.length) {
        setLoading(false);
        return;
      }

      try {
        // Fetch competitions user has access to
        const comps: Competition[] = [];
        for (const compId of competitionIds) {
          const compDoc = await getDoc(doc(db, 'competitions', compId));
          if (compDoc.exists()) {
            comps.push({ id: compDoc.id, ...compDoc.data() } as Competition);
          }
        }
        setCompetitions(comps);

        // Select first active competition
        const activeComp = comps.find(
          (c) => c.status === 'active' || c.status === 'scoring'
        );
        if (activeComp) {
          setSelectedCompetition(activeComp);
          await fetchCompetitionData(activeComp.id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, competitionIds]);

  const fetchCompetitionData = async (competitionId: string) => {
    if (!user) return;

    try {
      // Fetch teams
      const teamsSnap = await getDocs(
        collection(db, `competitions/${competitionId}/teams`)
      );
      const teams = teamsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Team[];

      // Fetch user's scorecards
      const scorecardsSnap = await getDocs(
        query(
          collection(db, `competitions/${competitionId}/scorecards`),
          where('evaluatorId', '==', user.uid)
        )
      );
      const scoredTeamIds = new Set(
        scorecardsSnap.docs
          .filter((doc) => doc.data().status === 'submitted')
          .map((doc) => doc.data().teamId)
      );

      setStats({
        totalTeams: teams.length,
        scoredTeams: scoredTeamIds.size,
        pendingTeams: teams.length - scoredTeamIds.size,
      });

      // Get recent/pending teams
      const pendingTeams = teams.filter((t) => !scoredTeamIds.has(t.id));
      setRecentTeams(pendingTeams.slice(0, 5));
    } catch (error) {
      console.error('Error fetching competition data:', error);
    }
  };

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
            <p>You are not assigned to any competitions yet.</p>
            <p className="text-sm mt-2">Contact your organizer for access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-[#888888] text-sm mt-1">
            Your judging overview
          </p>
        </div>

        {competitions.length > 1 && (
          <select
            value={selectedCompetition?.id || ''}
            onChange={async (e) => {
              const comp = competitions.find((c) => c.id === e.target.value);
              if (comp) {
                setSelectedCompetition(comp);
                await fetchCompetitionData(comp.id);
              }
            }}
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

      {selectedCompetition && (
        <>
          {/* Competition Info */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{selectedCompetition.name}</h2>
                  <p className="text-sm text-[#888888] capitalize">
                    {selectedCompetition.status}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 border ${
                    selectedCompetition.status === 'scoring'
                      ? 'border-white text-white'
                      : 'border-[#333333] text-[#888888]'
                  }`}
                >
                  {selectedCompetition.status === 'scoring'
                    ? 'Scoring Open'
                    : selectedCompetition.status}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-px bg-[#333333]">
            <div className="bg-black p-6 text-center">
              <Users className="w-6 h-6 text-[#888888] mx-auto mb-2" />
              <p className="text-3xl font-semibold">{stats.totalTeams}</p>
              <p className="text-sm text-[#888888]">Total Teams</p>
            </div>
            <div className="bg-black p-6 text-center">
              <CheckCircle className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-3xl font-semibold">{stats.scoredTeams}</p>
              <p className="text-sm text-[#888888]">Scored</p>
            </div>
            <div className="bg-black p-6 text-center">
              <Clock className="w-6 h-6 text-[#888888] mx-auto mb-2" />
              <p className="text-3xl font-semibold">{stats.pendingTeams}</p>
              <p className="text-sm text-[#888888]">Pending</p>
            </div>
          </div>

          {/* Pending Teams */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Teams to Score</CardTitle>
              <Link href="/judge/teams">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTeams.length === 0 ? (
                <p className="text-[#888888] text-center py-4">
                  All teams scored! Great job.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentTeams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/judge/teams/${team.id}?competition=${selectedCompetition.id}`}
                      className="flex items-center justify-between p-3 border border-[#333333] hover:border-[#888888] transition-colors"
                    >
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-[#888888]">
                          {team.projectTitle || 'No project title'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#888888]" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
