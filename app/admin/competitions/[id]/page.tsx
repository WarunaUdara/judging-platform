'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Pause,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Competition, Criterion, Team } from '@/lib/types';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'criteria' | 'teams';

export default function CompetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // New criterion form
  const [showCriterionForm, setShowCriterionForm] = useState(false);
  const [newCriterion, setNewCriterion] = useState({
    name: '',
    description: '',
    weight: 1,
    maxScore: 10,
    category: 'General',
    isRequired: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch competition
        const compDoc = await getDoc(doc(db, 'competitions', competitionId));
        if (!compDoc.exists()) {
          toast.error('Competition not found');
          router.push('/admin/competitions');
          return;
        }
        setCompetition({ id: compDoc.id, ...compDoc.data() } as Competition);

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

        // Fetch teams
        const teamsSnap = await getDocs(
          collection(db, `competitions/${competitionId}/teams`)
        );
        const teamsList = teamsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Team[];
        setTeams(teamsList);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load competition');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [competitionId, router]);

  const updateStatus = async (status: Competition['status']) => {
    if (!competition) return;

    try {
      await updateDoc(doc(db, 'competitions', competitionId), {
        status,
        updatedAt: serverTimestamp(),
      });
      setCompetition({ ...competition, status });
      toast.success(`Competition ${status === 'active' ? 'activated' : status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const addCriterion = async () => {
    if (!newCriterion.name) {
      toast.error('Criterion name is required');
      return;
    }

    try {
      const docRef = await addDoc(
        collection(db, `competitions/${competitionId}/criteria`),
        {
          ...newCriterion,
          competitionId,
          order: criteria.length,
        }
      );

      setCriteria([
        ...criteria,
        {
          id: docRef.id,
          competitionId,
          order: criteria.length,
          ...newCriterion,
        },
      ]);

      setNewCriterion({
        name: '',
        description: '',
        weight: 1,
        maxScore: 10,
        category: 'General',
        isRequired: true,
      });
      setShowCriterionForm(false);
      toast.success('Criterion added');
    } catch (error) {
      console.error('Error adding criterion:', error);
      toast.error('Failed to add criterion');
    }
  };

  const deleteCriterion = async (id: string) => {
    if (!confirm('Delete this criterion?')) return;

    try {
      await deleteDoc(doc(db, `competitions/${competitionId}/criteria`, id));
      setCriteria(criteria.filter((c) => c.id !== id));
      toast.success('Criterion deleted');
    } catch (error) {
      console.error('Error deleting criterion:', error);
      toast.error('Failed to delete criterion');
    }
  };

  const getTotalWeight = () => criteria.reduce((sum, c) => sum + c.weight, 0);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading...</div>
      </div>
    );
  }

  if (!competition) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/competitions"
            className="inline-flex items-center text-sm text-[#888888] hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Competitions
          </Link>
          <h1 className="text-2xl font-semibold">{competition.name}</h1>
          <p className="text-[#888888] text-sm mt-1">
            {competition.description || 'No description'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1 border ${
              competition.status === 'active'
                ? 'border-white text-white'
                : competition.status === 'scoring'
                ? 'border-[#c0c0c0] text-[#c0c0c0]'
                : 'border-[#333333] text-[#888888]'
            }`}
          >
            {competition.status}
          </span>

          {competition.status === 'draft' && (
            <Button size="sm" onClick={() => updateStatus('active')}>
              <Play className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
          {competition.status === 'active' && (
            <Button size="sm" onClick={() => updateStatus('scoring')}>
              <Pause className="w-4 h-4 mr-2" />
              Start Scoring
            </Button>
          )}
          {competition.status === 'scoring' && (
            <Button size="sm" onClick={() => updateStatus('closed')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#333333]">
        <nav className="flex gap-6">
          {(['overview', 'criteria', 'teams'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              {tab}
              {tab === 'criteria' && ` (${criteria.length})`}
              {tab === 'teams' && ` (${teams.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888888]">Type</span>
                <span className="capitalize">{competition.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Team Size</span>
                <span>
                  {competition.teamMinSize} - {competition.teamMaxSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Domains</span>
                <span>
                  {competition.allowedDomains.length || 'Any'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Rescoring</span>
                <span>
                  {competition.scoringConfig.allowRescoring ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888888]">Teams</span>
                <span>{teams.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Criteria</span>
                <span>{criteria.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">Total Weight</span>
                <span>{getTotalWeight()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'criteria' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888888]">
              Total weight: {getTotalWeight()}
            </p>
            <Button onClick={() => setShowCriterionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Criterion
            </Button>
          </div>

          {/* New Criterion Form */}
          {showCriterionForm && (
            <Card className="border-[#c0c0c0]">
              <CardHeader>
                <CardTitle className="text-base">New Criterion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#a1a1a1]">Name</label>
                    <Input
                      value={newCriterion.name}
                      onChange={(e) =>
                        setNewCriterion({ ...newCriterion, name: e.target.value })
                      }
                      placeholder="Innovation"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[#a1a1a1]">Category</label>
                    <Input
                      value={newCriterion.category}
                      onChange={(e) =>
                        setNewCriterion({
                          ...newCriterion,
                          category: e.target.value,
                        })
                      }
                      placeholder="Technical"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#a1a1a1]">Description</label>
                  <Input
                    value={newCriterion.description}
                    onChange={(e) =>
                      setNewCriterion({
                        ...newCriterion,
                        description: e.target.value,
                      })
                    }
                    placeholder="How innovative is the solution?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#a1a1a1]">Weight</label>
                    <Input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={newCriterion.weight}
                      onChange={(e) =>
                        setNewCriterion({
                          ...newCriterion,
                          weight: parseFloat(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[#a1a1a1]">Max Score</label>
                    <Input
                      type="number"
                      min={1}
                      value={newCriterion.maxScore}
                      onChange={(e) =>
                        setNewCriterion({
                          ...newCriterion,
                          maxScore: parseInt(e.target.value) || 10,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addCriterion}>Add Criterion</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCriterionForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Criteria List */}
          {criteria.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-[#888888]">
                No criteria defined yet
              </CardContent>
            </Card>
          ) : (
            <div className="border border-[#333333]">
              {criteria.map((criterion, idx) => (
                <div
                  key={criterion.id}
                  className="flex items-center gap-4 p-4 border-b border-[#333333] last:border-b-0"
                >
                  <GripVertical className="w-4 h-4 text-[#333333]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{criterion.name}</span>
                      <span className="text-xs text-[#888888] px-2 py-0.5 border border-[#333333]">
                        {criterion.category}
                      </span>
                    </div>
                    <p className="text-sm text-[#888888] mt-1">
                      {criterion.description}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      Weight: <span className="text-white">{criterion.weight}</span>
                    </p>
                    <p className="text-[#888888]">Max: {criterion.maxScore}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCriterion(criterion.id)}
                    className="text-[#888888] hover:text-[#ff4444]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888888]">{teams.length} teams</p>
            <Link href={`/admin/teams?competition=${competitionId}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Import Teams
              </Button>
            </Link>
          </div>

          {teams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-[#888888]">
                No teams imported yet
              </CardContent>
            </Card>
          ) : (
            <div className="border border-[#333333]">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
                <div className="col-span-4">Team</div>
                <div className="col-span-3">Project</div>
                <div className="col-span-2">Domain</div>
                <div className="col-span-2">Members</div>
                <div className="col-span-1">Status</div>
              </div>
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 text-sm"
                >
                  <div className="col-span-4 font-medium">{team.name}</div>
                  <div className="col-span-3 text-[#a1a1a1] truncate">
                    {team.projectTitle || '-'}
                  </div>
                  <div className="col-span-2 text-[#888888]">
                    {team.domain || '-'}
                  </div>
                  <div className="col-span-2 text-[#888888]">
                    {team.members?.length || 0}
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs px-2 py-0.5 border border-[#333333] text-[#888888] capitalize">
                      {team.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
