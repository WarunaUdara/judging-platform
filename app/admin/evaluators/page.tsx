'use client';

import { useEffect, useState, Fragment } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, UserX, Mail, Key } from 'lucide-react';
import type { Competition, Evaluator } from '@/lib/types';
import toast from 'react-hot-toast';

export default function EvaluatorsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [loading, setLoading] = useState(true);

  // Create evaluator form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [evaluatorToDelete, setEvaluatorToDelete] = useState<Evaluator | null>(null);

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
        toast.error('Failed to load competitions');
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreatePassword(password);
  };

  const handleCreateEvaluator = async () => {
    if (!createEmail || !createDisplayName || !createPassword || !selectedCompetition) {
      toast.error('Please fill all fields');
      return;
    }

    if (createPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/evaluators/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail,
          displayName: createDisplayName,
          password: createPassword,
          competitionId: selectedCompetition,
          orgId: 'default',
          sendCredentials: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create evaluator');
      }

      if (result.emailSent) {
        toast.success(`Evaluator created and credentials sent to ${createEmail}`);
      } else {
        const errorMsg = result.emailError 
          ? `Email failed: ${result.emailError}` 
          : 'Email not sent - share credentials manually';
        toast.error(`Evaluator created but ${errorMsg}`);
        console.log('Email error details:', result.emailError);
      }

      // Refresh evaluators list
      const snapshot = await getDocs(
        collection(db, `competitions/${selectedCompetition}/evaluators`)
      );
      const evals = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Evaluator[];
      setEvaluators(evals);

      // Reset form
      setCreateEmail('');
      setCreateDisplayName('');
      setCreatePassword('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating evaluator:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create evaluator');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setCreateEmail('');
    setCreateDisplayName('');
    setCreatePassword('');
    setShowCreateForm(false);
  };

  const handleDeleteEvaluator = async () => {
    if (!evaluatorToDelete) return;

    try {
      const response = await fetch(`/api/evaluators/${evaluatorToDelete.uid}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete evaluator');
      }

      toast.success('Evaluator deleted successfully');

      // Refresh evaluators list
      if (selectedCompetition) {
        const snapshot = await getDocs(
          collection(db, `competitions/${selectedCompetition}/evaluators`)
        );
        const evals = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as Evaluator[];
        setEvaluators(evals);
      }
    } catch (error) {
      console.error('Error deleting evaluator:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete evaluator');
    } finally {
      setEvaluatorToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const confirmDelete = (evaluator: Evaluator) => {
    setEvaluatorToDelete(evaluator);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Evaluators</h1>
          <p className="text-[#888888] text-sm mt-1">
            Create and manage judges for your competitions
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Evaluator
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

      {/* Create Evaluator Form */}
      {showCreateForm && (
        <Card className="border-[#c0c0c0]">
          <CardHeader>
            <CardTitle className="text-base">Add New Evaluator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Display Name</label>
                <Input
                  value={createDisplayName}
                  onChange={(e) => setCreateDisplayName(e.target.value)}
                  placeholder="Judge Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Email Address</label>
                <Input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="judge@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">Password</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="font-mono"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  <Key className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-[#888888]">
                This password will be sent to the evaluator via email
              </p>
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

            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateEvaluator} disabled={creating}>
                <Mail className="w-4 h-4 mr-2" />
                {creating ? 'Creating...' : 'Create & Send Credentials'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
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
            <p className="mb-4">No evaluators assigned to this competition</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Evaluator
            </Button>
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
                  {evaluator.role?.replace('_', ' ') || 'evaluator'}
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
                  onClick={() => confirmDelete(evaluator)}
                >
                  <UserX className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <ConfirmDialog
      isOpen={showDeleteDialog}
      title="Delete Evaluator"
      description={
        <div className="space-y-2">
          <p>Are you sure you want to delete evaluator <span className="text-white font-medium">{evaluatorToDelete?.displayName}</span>?</p>
          <p className="text-sm text-[#888888]">This will:</p>
          <ul className="text-sm text-[#888888] list-disc list-inside">
            <li>Remove their access to this competition</li>
            <li>Delete all their scores</li>
            <li>This action cannot be undone</li>
          </ul>
        </div>
      }
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={handleDeleteEvaluator}
      onCancel={() => {
        setShowDeleteDialog(false);
        setEvaluatorToDelete(null);
      }}
      isDestructive
    />
    </>
  );
}
