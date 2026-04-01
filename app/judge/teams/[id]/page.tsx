'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Save, Send } from 'lucide-react';
import Link from 'next/link';
import type { Team, Criterion, Scorecard } from '@/lib/types';
import toast from 'react-hot-toast';

interface ScoreEntry {
  score: number;
  remarks: string;
}

export default function ScoringPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const teamId = params.id as string;
  const competitionId = searchParams.get('competition') || '';

  const [team, setTeam] = useState<Team | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
  const [existingScorecard, setExistingScorecard] = useState<Scorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!competitionId || !teamId || !user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch team
        const teamDoc = await getDoc(
          doc(db, `competitions/${competitionId}/teams`, teamId)
        );
        if (!teamDoc.exists()) {
          toast.error('Team not found');
          router.push('/judge/teams');
          return;
        }
        setTeam({ id: teamDoc.id, ...teamDoc.data() } as Team);

        // Fetch criteria
        const criteriaSnap = await getDocs(
          collection(db, `competitions/${competitionId}/criteria`)
        );
        const criteriaList = criteriaSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Criterion[];
        criteriaList.sort((a, b) => a.order - b.order);
        setCriteria(criteriaList);

        // Initialize scores
        const initialScores: Record<string, ScoreEntry> = {};
        criteriaList.forEach((c) => {
          initialScores[c.id] = { score: 0, remarks: '' };
        });

        // Check for existing scorecard
        const scorecardsSnap = await getDocs(
          query(
            collection(db, `competitions/${competitionId}/scorecards`),
            where('teamId', '==', teamId),
            where('evaluatorId', '==', user.uid)
          )
        );

        if (!scorecardsSnap.empty) {
          const scorecard = {
            id: scorecardsSnap.docs[0].id,
            ...scorecardsSnap.docs[0].data(),
          } as Scorecard;
          setExistingScorecard(scorecard);

          // Load existing scores
          if (scorecard.scores) {
            Object.entries(scorecard.scores).forEach(([criterionId, data]) => {
              if (initialScores[criterionId]) {
                initialScores[criterionId] = {
                  score: data.score,
                  remarks: data.remarks,
                };
              }
            });
          }
        }

        setScores(initialScores);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load scoring form');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [competitionId, teamId, user, router]);

  const updateScore = (criterionId: string, field: 'score' | 'remarks', value: number | string) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: value,
      },
    }));
  };

  const calculateWeightedScore = () => {
    let totalWeighted = 0;
    let totalWeight = 0;

    criteria.forEach((c) => {
      const entry = scores[c.id];
      if (entry && entry.score > 0) {
        const normalizedScore = entry.score / c.maxScore;
        totalWeighted += normalizedScore * c.weight;
        totalWeight += c.weight;
      }
    });

    return totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;
  };

  const handleSave = async (submit: boolean = false) => {
    if (!competitionId || !teamId) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/scores/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId,
          teamId,
          scores,
          submit,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save scores');
      }

      if (submit) {
        toast.success('Scores submitted successfully');
        router.push('/judge/teams');
      } else {
        toast.success('Draft saved');
      }
    } catch (error) {
      console.error('Error saving scores:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save scores');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading...</div>
      </div>
    );
  }

  if (!team || !competitionId) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center text-[#888888]">
            Team not found or invalid competition
          </CardContent>
        </Card>
      </div>
    );
  }

  const weightedScore = calculateWeightedScore();
  const isSubmitted = existingScorecard?.status === 'submitted';

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/judge/teams"
          className="inline-flex items-center text-sm text-[#888888] hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{team.name}</h1>
            <p className="text-[#888888] text-sm mt-1">
              {team.projectTitle || 'No project title'}
            </p>
          </div>
          {team.submissionUrl && (
            <a
              href={team.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-white"
            >
              View Submission
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Team Info */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[#888888]">Domain</p>
              <p>{team.domain || '-'}</p>
            </div>
            <div>
              <p className="text-[#888888]">Members</p>
              <p>{team.members?.length || 0}</p>
            </div>
            <div>
              <p className="text-[#888888]">Status</p>
              <p className="capitalize">{team.status}</p>
            </div>
            <div>
              <p className="text-[#888888]">Scoring Status</p>
              <p>{isSubmitted ? 'Submitted' : 'Draft'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Score Preview */}
      <Card className="border-[#c0c0c0]">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888888]">Weighted Score</p>
              <p className="text-3xl font-bold">{weightedScore.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#888888]">
                {Object.values(scores).filter((s) => s.score > 0).length} / {criteria.length}
              </p>
              <p className="text-xs text-[#888888]">criteria scored</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Form */}
      <div className="space-y-4">
        {criteria.map((criterion, idx) => (
          <Card key={criterion.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-[#888888] text-sm">{idx + 1}.</span>
                    {criterion.name}
                    {criterion.isRequired && (
                      <span className="text-xs text-[#ff4444]">*</span>
                    )}
                  </CardTitle>
                  <p className="text-sm text-[#888888] mt-1">
                    {criterion.description}
                  </p>
                </div>
                <div className="text-right text-xs text-[#888888]">
                  <p>Weight: {criterion.weight}</p>
                  <p>Max: {criterion.maxScore}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-[#a1a1a1] block mb-2">
                  Score (0 - {criterion.maxScore})
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={0}
                    max={criterion.maxScore}
                    step={0.5}
                    value={scores[criterion.id]?.score || ''}
                    onChange={(e) =>
                      updateScore(
                        criterion.id,
                        'score',
                        Math.min(
                          criterion.maxScore,
                          Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      )
                    }
                    className="w-24"
                    disabled={isSubmitted}
                  />
                  <input
                    type="range"
                    min={0}
                    max={criterion.maxScore}
                    step={0.5}
                    value={scores[criterion.id]?.score || 0}
                    onChange={(e) =>
                      updateScore(criterion.id, 'score', parseFloat(e.target.value))
                    }
                    className="flex-1 accent-white"
                    disabled={isSubmitted}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#a1a1a1] block mb-2">
                  Remarks (optional)
                </label>
                <textarea
                  value={scores[criterion.id]?.remarks || ''}
                  onChange={(e) =>
                    updateScore(criterion.id, 'remarks', e.target.value)
                  }
                  placeholder="Add notes about this score..."
                  rows={2}
                  className="w-full bg-[#0a0a0a] border border-[#333333] px-3 py-2 text-sm text-white placeholder:text-[#888888] focus:border-[#c0c0c0] focus:outline-none resize-none"
                  disabled={isSubmitted}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {!isSubmitted && (
        <div className="flex gap-4 sticky bottom-4 bg-black py-4 border-t border-[#333333]">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={submitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={submitting}>
            <Send className="w-4 h-4 mr-2" />
            Submit Scores
          </Button>
        </div>
      )}
    </div>
  );
}
