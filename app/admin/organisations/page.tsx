'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Organisation {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrganisations();
  }, []);

  const fetchOrganisations = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'organisations'));
      setOrganisations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organisation)));
    } catch (error) {
      console.error('Error fetching organisations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Organisation name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'organisations', editingId), {
          name: formData.name,
          description: formData.description,
        });
        toast.success('Organisation updated');
      } else {
        await addDoc(collection(db, 'organisations'), {
          name: formData.name,
          description: formData.description,
          createdAt: new Date().toISOString(),
        });
        toast.success('Organisation created');
      }
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      fetchOrganisations();
    } catch (error) {
      console.error('Error saving organisation:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (org: Organisation) => {
    setFormData({ name: org.name, description: org.description });
    setEditingId(org.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this organisation?')) return;
    try {
      await deleteDoc(doc(db, 'organisations', id));
      toast.success('Organisation deleted');
      fetchOrganisations();
    } catch (error) {
      console.error('Error deleting organisation:', error);
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-6 lg:p-8 text-[#888888]">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Organisations</h1>
          <p className="text-[#888888] text-sm mt-1">Manage organisations</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Organisation
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Edit Organisation' : 'New Organisation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Organisation name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description (optional)"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {organisations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-[#888888]">
            No organisations found
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organisations.map((org) => (
            <Card key={org.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#333333] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#888888]" />
                    </div>
                    <div>
                      <h3 className="font-medium">{org.name}</h3>
                      <p className="text-sm text-[#888888]">{org.description || 'No description'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(org)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(org.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}