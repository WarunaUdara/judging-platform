'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Competition, Scorecard, Team, Criterion } from '@/lib/types';

interface ScoreEntry {
  teamId: string;
  teamName: string;
  evaluatorId: string;
  scores: Record<string, number>;
  total: number;
}

export default function ScorecardsMatrixPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'competitions'));
        const comps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Competition));
        setCompetitions(comps);
        if (comps.length > 0) setSelectedCompetition(comps[0].id);
      } catch (error) {
        console.error('Error fetching competitions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (!selectedCompetition) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [teamsSnap, criteriaSnap, scorecardsSnap] = await Promise.all([
          getDocs(collection(db, `competitions/${selectedCompetition}/teams`)),
          getDocs(collection(db, `competitions/${selectedCompetition}/criteria`)),
          getDocs(collection(db, `competitions/${selectedCompetition}/scorecards`)),
        ]);

        const teamsData = teamsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Team));
        const criteriaData = criteriaSnap.docs.map(d => ({ id: d.id, ...d.data() } as Criterion));
        const scorecardsData = scorecardsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Scorecard));

        setTeams(teamsData);
        setCriteria(criteriaData);
        setScorecards(scorecardsData);

        const matrixData: ScoreEntry[] = teamsData.map(team => {
          const teamScores = scorecardsData.filter(s => s.teamId === team.id);
          const scores: Record<string, number> = {};
          let total = 0;

          criteriaData.forEach(crit => {
            const scoreForCriterion = teamScores.find(s => s.scores[crit.id]);
            if (scoreForCriterion?.scores[crit.id]?.score !== undefined) {
              const score = scoreForCriterion.scores[crit.id].score;
              scores[crit.id] = score;
              total += score;
            } else {
              scores[crit.id] = 0;
            }
          });

          return {
            teamId: team.id,
            teamName: team.name,
            evaluatorId: teamScores[0]?.evaluatorId || '',
            scores,
            total,
          };
        });

        setMatrix(matrixData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompetition]);

  const exportCSV = () => {
    const headers = ['Team', ...criteria.map(c => c.name), 'Total'];
    const rows = matrix.map(entry => [
      entry.teamName,
      ...criteria.map(c => entry.scores[c.id]?.toString() || '0'),
      entry.total.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scorecards-${selectedCompetition}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && competitions.length === 0) {
    return <div className="p-6 lg:p-8 text-[#888888]">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Scorecards Matrix</h1>
          <p className="text-[#888888] text-sm mt-1">View all scores in a grid</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white"
          >
            <option value="">Select...</option>
            {competitions.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button onClick={exportCSV} disabled={!selectedCompetition}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {selectedCompetition && matrix.length > 0 && (
        <Card>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#333333]">
                  <th className="text-left p-3 text-[#888888] font-medium">Team</th>
                  {criteria.map(c => (
                    <th key={c.id} className="text-left p-3 text-[#888888] font-medium">
                      {c.name} ({c.maxScore})
                    </th>
                  ))}
                  <th className="text-left p-3 text-[#888888] font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map(entry => (
                  <tr key={entry.teamId} className="border-b border-[#222222] hover:bg-[#0a0a0a]">
                    <td className="p-3">{entry.teamName}</td>
                    {criteria.map(c => (
                      <td key={c.id} className="p-3">
                        {entry.scores[c.id] || '-'}
                      </td>
                    ))}
                    <td className="p-3 font-medium">{entry.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {selectedCompetition && matrix.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-[#888888]">
            No scorecards found for this competition
          </CardContent>
        </Card>
      )}
    </div>
  );
}