'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Mail, Copy, Check, UserX } from 'lucide-react';
import type { Competition, Evaluator, CreateInvitationResponse } from '@/lib/types';
import toast from 'react-hot-toast';

export default function EvaluatorsPage() {
  const { claims } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'evaluator' | 'head_judge'>('evaluator');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'competitions'));
        const comps = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Competition[];
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
  }, []);

  useEffect(() => {
    const fetchEvaluators = async () => {
      if (!selectedCompetition) {
        setEvaluators([]);
        return;
      }

      try {
        const snapshot = await getDocs(
          collection(db, `competitions/${selectedCompetition}/evaluators`)
        );
        const evals = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as Evaluator[];
        setEvaluators(evals);
      } catch (error) {
        console.error('Error fetching evaluators:', error);
      }
    };

    fetchEvaluators();
  }, [selectedCompetition]);

  const handleInvite = async () => {
    if (!inviteEmail || !selectedCompetition || !claims?.orgId) {
      toast.error('Missing required fields');
      return;
    }

    setInviting(true);

    try {
      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: 'evaluator',
          competitionId: selectedCompetition,
          orgId: claims.orgId,
        }),
      });

      const result: CreateInvitationResponse = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || 'Failed to create invitation');
      }

      setInviteLink(result.inviteUrl);
      toast.success('Invitation created');
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create invitation');
    } finally {
      setInviting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const resetForm = () => {
    setInviteEmail('');
    setInviteLink(null);
    setShowInviteForm(false);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Evaluators</h1>
          <p className="text-[#888888] text-sm mt-1">
            Manage judges for your competitions
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Evaluator
        </Button>
      </div>

      {/* Competition Filter */}
      <div>
        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          className="w-full md:w-64 h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
        >
          <option value="">Select competition...</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="border-[#c0c0c0]">
          <CardHeader>
            <CardTitle className="text-base">Invite Evaluator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!inviteLink ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-[#a1a1a1]">Email Address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="evaluator@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#a1a1a1]">Competition</label>
                  <select
                    value={selectedCompetition}
                    onChange={(e) => setSelectedCompetition(e.target.value)}
                    className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
                  >
                    {competitions.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleInvite} disabled={inviting}>
                    {inviting ? 'Creating...' : 'Create Invitation'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-[#a1a1a1]">Invitation Link</label>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="font-mono text-xs" />
                    <Button variant="outline" onClick={copyToClipboard}>
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-[#888888]">
                    Share this link with the evaluator. It expires in 7 days.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={resetForm}>Invite Another</Button>
                  <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evaluators List */}
      {!selectedCompetition ? (
        <Card>
          <CardContent className="py-8 text-center text-[#888888]">
            Select a competition to view evaluators
          </CardContent>
        </Card>
      ) : evaluators.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-[#888888]">
            No evaluators assigned to this competition
          </CardContent>
        </Card>
      ) : (
        <div className="border border-[#333333]">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
            <div className="col-span-4">Evaluator</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Assigned Teams</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {evaluators.map((evaluator) => (
            <div
              key={evaluator.uid}
              className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 items-center"
            >
              <div className="col-span-4">
                <p className="font-medium">{evaluator.displayName || 'Unnamed'}</p>
                <p className="text-xs text-[#888888]">{evaluator.email}</p>
              </div>
              <div className="col-span-3">
                <span className="text-xs px-2 py-1 border border-[#333333] capitalize">
                  {evaluator.role.replace('_', ' ')}
                </span>
              </div>
              <div className="col-span-2 text-sm text-[#888888]">
                {evaluator.assignedTeamIds?.length || 'All'}
              </div>
              <div className="col-span-2">
                <span
                  className={`text-xs px-2 py-1 border ${
                    evaluator.isActive
                      ? 'border-white text-white'
                      : 'border-[#333333] text-[#888888]'
                  }`}
                >
                  {evaluator.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#888888] hover:text-[#ff4444]"
                >
                  <UserX className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
