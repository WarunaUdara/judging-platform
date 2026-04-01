'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MoreVertical, Trash2, Edit, Eye } from 'lucide-react';
import Link from 'next/link';
import type { Competition } from '@/lib/types';
import toast from 'react-hot-toast';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchCompetitions = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'competitions'));
      const comps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Competition[];
      
      // Sort by createdAt descending
      comps.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      setCompetitions(comps);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;
    
    try {
      await deleteDoc(doc(db, 'competitions', id));
      setCompetitions((prev) => prev.filter((c) => c.id !== id));
      toast.success('Competition deleted');
    } catch (error) {
      console.error('Error deleting competition:', error);
      toast.error('Failed to delete competition');
    }
  };

  const getStatusStyle = (status: Competition['status']) => {
    switch (status) {
      case 'active':
        return 'border-white text-white';
      case 'scoring':
        return 'border-[#c0c0c0] text-[#c0c0c0]';
      case 'closed':
        return 'border-[#888888] text-[#888888]';
      default:
        return 'border-[#333333] text-[#888888]';
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Competitions</h1>
          <p className="text-[#888888] text-sm mt-1">
            Manage your hackathon competitions
          </p>
        </div>
        <Link href="/admin/competitions/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Competition
          </Button>
        </Link>
      </div>

      {/* Competitions List */}
      {competitions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[#888888] mb-4">No competitions yet</p>
            <Link href="/admin/competitions/new">
              <Button>Create your first competition</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-[#333333]">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {competitions.map((comp) => (
            <div
              key={comp.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 items-center hover:bg-[#0a0a0a] transition-colors"
            >
              <div className="col-span-4">
                <Link
                  href={`/admin/competitions/${comp.id}`}
                  className="font-medium hover:text-[#c0c0c0] transition-colors"
                >
                  {comp.name}
                </Link>
                <p className="text-xs text-[#888888] mt-1 truncate">
                  {comp.description || 'No description'}
                </p>
              </div>
              <div className="col-span-2 capitalize text-sm text-[#a1a1a1]">
                {comp.type}
              </div>
              <div className="col-span-2">
                <span
                  className={`text-xs px-2 py-1 border ${getStatusStyle(
                    comp.status
                  )}`}
                >
                  {comp.status}
                </span>
              </div>
              <div className="col-span-2 text-sm text-[#888888]">
                {comp.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
              </div>
              <div className="col-span-2 flex justify-end gap-2 relative">
                <Link href={`/admin/competitions/${comp.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/admin/competitions/${comp.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(comp.id)}
                  className="text-[#ff4444] hover:text-[#ff4444] hover:bg-[#ff4444]/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
