'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, UserCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Competition } from '@/lib/types';

interface DashboardStats {
  competitions: number;
  activeCompetitions: number;
  teams: number;
  evaluators: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    competitions: 0,
    activeCompetitions: 0,
    teams: 0,
    evaluators: 0,
  });
  const [recentCompetitions, setRecentCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch competitions
        const competitionsSnap = await getDocs(collection(db, 'competitions'));
        const competitions = competitionsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Competition[];

        const activeComps = competitions.filter((c) => c.status === 'active');

        // Fetch teams count
        let teamsCount = 0;
        for (const comp of competitions) {
          const teamsSnap = await getDocs(
            collection(db, `competitions/${comp.id}/teams`)
          );
          teamsCount += teamsSnap.size;
        }

        // Fetch evaluators count
        const evaluatorsSnap = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'evaluator'))
        );

        setStats({
          competitions: competitions.length,
          activeCompetitions: activeComps.length,
          teams: teamsCount,
          evaluators: evaluatorsSnap.size,
        });

        // Get recent competitions (sorted by createdAt)
        const sorted = competitions.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setRecentCompetitions(sorted.slice(0, 3));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-[#888888] text-sm mt-1">
          Overview of your judging platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333]">
        <div className="bg-black p-6">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-5 h-5 text-[#888888]" />
            <span className="text-xs text-[#888888]">Total</span>
          </div>
          <p className="text-3xl font-semibold">{stats.competitions}</p>
          <p className="text-sm text-[#888888] mt-1">Competitions</p>
        </div>

        <div className="bg-black p-6">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-5 h-5 text-white" />
            <span className="text-xs text-[#888888]">Active</span>
          </div>
          <p className="text-3xl font-semibold">{stats.activeCompetitions}</p>
          <p className="text-sm text-[#888888] mt-1">Running Now</p>
        </div>

        <div className="bg-black p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-5 h-5 text-[#888888]" />
            <span className="text-xs text-[#888888]">Total</span>
          </div>
          <p className="text-3xl font-semibold">{stats.teams}</p>
          <p className="text-sm text-[#888888] mt-1">Teams</p>
        </div>

        <div className="bg-black p-6">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="w-5 h-5 text-[#888888]" />
            <span className="text-xs text-[#888888]">Total</span>
          </div>
          <p className="text-3xl font-semibold">{stats.evaluators}</p>
          <p className="text-sm text-[#888888] mt-1">Evaluators</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/competitions/new" className="block">
              <Button variant="outline" className="w-full justify-between">
                Create Competition
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/evaluators" className="block">
              <Button variant="outline" className="w-full justify-between">
                Invite Evaluators
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/leaderboard" className="block">
              <Button variant="outline" className="w-full justify-between">
                View Leaderboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompetitions.length === 0 ? (
              <p className="text-[#888888] text-sm">No competitions yet</p>
            ) : (
              <div className="space-y-3">
                {recentCompetitions.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/admin/competitions/${comp.id}`}
                    className="flex items-center justify-between p-3 border border-[#333333] hover:border-[#888888] transition-colors"
                  >
                    <div>
                      <p className="font-medium">{comp.name}</p>
                      <p className="text-xs text-[#888888] capitalize">
                        {comp.status}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 border ${
                        comp.status === 'active'
                          ? 'border-white text-white'
                          : comp.status === 'closed'
                          ? 'border-[#888888] text-[#888888]'
                          : 'border-[#333333] text-[#888888]'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
