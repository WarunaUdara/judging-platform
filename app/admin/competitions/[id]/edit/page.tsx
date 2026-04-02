"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import type {
  CompetitionType,
  CompetitionStatus,
  Competition,
} from "@/lib/types";
import toast from "react-hot-toast";

export default function EditCompetitionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const competitionId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    type: "hackathon" as CompetitionType,
    description: "",
    status: "draft" as CompetitionStatus,
    teamMinSize: 1,
    teamMaxSize: 4,
    allowedDomains: [] as string[],
    scoringConfig: {
      allowPartialSubmit: false,
      showLeaderboardTo: "organizers_only" as
        | "organizers_only"
        | "evaluators_and_organizers",
      scoreVisibilityMode: "after_close" as "live" | "after_close",
      allowRescoring: true,
    },
  });

  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    if (!competitionId) return;

    const fetchCompetition = async () => {
      try {
        const docRef = doc(db, "competitions", competitionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const comp = docSnap.data() as Competition;
          setFormData({
            name: comp.name || "",
            type: comp.type || "hackathon",
            description: comp.description || "",
            status: comp.status || "draft",
            teamMinSize: comp.teamMinSize || 1,
            teamMaxSize: comp.teamMaxSize || 4,
            allowedDomains: comp.allowedDomains || [],
            scoringConfig: {
              allowPartialSubmit:
                comp.scoringConfig?.allowPartialSubmit ?? false,
              showLeaderboardTo:
                comp.scoringConfig?.showLeaderboardTo || "organizers_only",
              scoreVisibilityMode:
                comp.scoringConfig?.scoreVisibilityMode || "after_close",
              allowRescoring: comp.scoringConfig?.allowRescoring ?? true,
            },
          });
        } else {
          toast.error("Competition not found");
          router.push("/admin/competitions");
        }
      } catch (error) {
        console.error("Error fetching competition:", error);
        toast.error("Failed to load competition details");
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [competitionId, router]);

  const handleAddDomain = () => {
    if (newDomain && !formData.allowedDomains.includes(newDomain)) {
      setFormData((prev) => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, newDomain],
      }));
      setNewDomain("");
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((d) => d !== domain),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    setSaving(true);

    try {
      const docRef = doc(db, "competitions", competitionId);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });

      toast.success("Competition updated");
      router.push(`/admin/competitions/${competitionId}`);
    } catch (error) {
      console.error("Error updating competition:", error);
      toast.error("Failed to update competition");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading competition...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/competitions"
          className="inline-flex items-center text-sm text-[#888888] hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Competitions
        </Link>
        <h1 className="text-2xl font-semibold">Edit Competition</h1>
        <p className="text-[#888888] text-sm mt-1">
          Update the competition details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">Competition Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="CryptX Hackathon 2025"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as CompetitionType,
                    }))
                  }
                  className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="designathon">Designathon</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as CompetitionStatus,
                    }))
                  }
                  className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="scoring">Scoring</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the competition..."
                rows={3}
                className="w-full bg-[#0a0a0a] border border-[#333333] px-3 py-2 text-sm text-white placeholder:text-[#888888] focus:border-[#c0c0c0] focus:outline-none resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Min Team Size</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.teamMinSize}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamMinSize: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Max Team Size</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.teamMaxSize}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamMaxSize: parseInt(e.target.value) || 4,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">
                Allowed Domains / Tracks
              </label>
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g., FinTech, HealthTech"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDomain();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDomain}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.allowedDomains.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allowedDomains.map((domain) => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[#333333] text-[#a1a1a1]"
                    >
                      {domain}
                      <button
                        type="button"
                        onClick={() => handleRemoveDomain(domain)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scoring Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scoring Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.scoringConfig.allowPartialSubmit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scoringConfig: {
                        ...prev.scoringConfig,
                        allowPartialSubmit: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-white"
                />
                <span className="text-sm">Allow partial score submissions</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.scoringConfig.allowRescoring}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scoringConfig: {
                        ...prev.scoringConfig,
                        allowRescoring: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-white"
                />
                <span className="text-sm">
                  Allow evaluators to rescore teams
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">
                Leaderboard Visibility
              </label>
              <select
                value={formData.scoringConfig.showLeaderboardTo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scoringConfig: {
                      ...prev.scoringConfig,
                      showLeaderboardTo: e.target
                        .value as typeof formData.scoringConfig.showLeaderboardTo,
                    },
                  }))
                }
                className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
              >
                <option value="organizers_only">Organizers Only</option>
                <option value="evaluators_and_organizers">
                  Evaluators & Organizers
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#a1a1a1]">Score Visibility</label>
              <select
                value={formData.scoringConfig.scoreVisibilityMode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scoringConfig: {
                      ...prev.scoringConfig,
                      scoreVisibilityMode: e.target
                        .value as typeof formData.scoringConfig.scoreVisibilityMode,
                    },
                  }))
                }
                className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
              >
                <option value="after_close">After Competition Closes</option>
                <option value="live">Live (Real-time)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/admin/competitions">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
