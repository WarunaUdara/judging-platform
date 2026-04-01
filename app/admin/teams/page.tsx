"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Competition, ImportTeamsResponse, Team } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function TeamsPage() {
  const router = useRouter();
  const { role } = useAuth();

  const searchParams = useSearchParams();
  const preselectedCompId = searchParams.get("competition");

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>(
    preselectedCompId || "",
  );
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportTeamsResponse | null>(
    null,
  );

  // CSV data
  const [csvText, setCsvText] = useState("");
  const [parsedTeams, setParsedTeams] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Existing teams data
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteTeamDialog, setDeleteTeamDialog] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  // Editing parsed teams in preview
  const [editingParsedTeam, setEditingParsedTeam] = useState<any | null>(null);
  const [editingParsedTeamIndex, setEditingParsedTeamIndex] = useState<
    number | null
  >(null);
  const [deleteParsedTeamDialog, setDeleteParsedTeamDialog] = useState<{
    isOpen: boolean;
    index: number | null;
    name: string;
  }>({
    isOpen: false,
    index: null,
    name: "",
  });

  useEffect(() => {
    if (role === "organizer") {
      router.push("/admin/pending");
      return;
    }

    const fetchCompetitions = async () => {
      try {
        const snapshot = await getDocs(collection(db, "competitions"));
        const comps = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Competition[];
        setCompetitions(comps);

        if (preselectedCompId) {
          setSelectedCompetition(preselectedCompId);
        }
      } catch (error) {
        console.error("Error fetching competitions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, [preselectedCompId, role, router]);

  const fetchExistingTeams = async (compId: string) => {
    if (!compId) {
      setExistingTeams([]);
      return;
    }
    setLoadingTeams(true);
    try {
      const teamsSnap = await getDocs(
        collection(db, `competitions/${compId}/teams`),
      );
      const teamsList = teamsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Team[];
      setExistingTeams(teamsList);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load existing teams");
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchExistingTeams(selectedCompetition);
  }, [selectedCompetition]);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      processFile(file);
    } else if (file) {
      toast.error("Please upload a valid CSV file");
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      toast.error("CSV must have at least a header row and one data row");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Expected headers: team_name, project_title, domain, submission_url, member_name, member_email, member_role
    const teams: Record<string, any> = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      const teamName = row["team_name"] || row["teamname"] || row["team"];
      if (!teamName) continue;

      if (!teams[teamName]) {
        teams[teamName] = {
          name: teamName,
          projectTitle:
            row["project_title"] || row["projecttitle"] || row["project"] || "",
          domain: row["domain"] || row["track"] || "",
          submissionUrl:
            row["submission_url"] ||
            row["submissionurl"] ||
            row["submission"] ||
            "",
          members: [],
          notes: "",
        };
      }

      const memberName =
        row["member_name"] || row["membername"] || row["name"] || "";
      const memberEmail =
        row["member_email"] || row["memberemail"] || row["email"] || "";

      if (memberName || memberEmail) {
        teams[teamName].members.push({
          name: memberName,
          email: memberEmail,
          studentId: row["student_id"] || row["studentid"] || "",
          university: row["university"] || "",
          role: teams[teamName].members.length === 0 ? "leader" : "member",
        });
      }
    }

    setParsedTeams(Object.values(teams));
  };

  const handleImport = async () => {
    if (!selectedCompetition) {
      toast.error("Please select a competition");
      return;
    }

    if (parsedTeams.length === 0) {
      toast.error("No teams to import");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const response = await fetch("/api/teams/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: selectedCompetition,
          teams: parsedTeams,
          format: "csv",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      setImportResult(result);
      toast.success(`Imported ${result.imported} teams`);

      // Clear form
      setCsvText("");
      setParsedTeams([]);

      // Refresh the existing teams list
      fetchExistingTeams(selectedCompetition);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !selectedCompetition) return;

    try {
      const teamRef = doc(
        db,
        `competitions/${selectedCompetition}/teams`,
        editingTeam.id,
      );
      await updateDoc(teamRef, {
        name: editingTeam.name,
        projectTitle: editingTeam.projectTitle,
        domain: editingTeam.domain,
        status: editingTeam.status,
      });

      setExistingTeams(
        existingTeams.map((t) => (t.id === editingTeam.id ? editingTeam : t)),
      );
      setEditingTeam(null);
      toast.success("Team updated successfully");
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Failed to update team");
    }
  };

  const confirmDeleteTeam = (id: string, name: string) => {
    setDeleteTeamDialog({ isOpen: true, id, name });
  };

  const handleDeleteTeam = async () => {
    const { id, name } = deleteTeamDialog;
    if (!id || !selectedCompetition) return;

    try {
      await deleteDoc(doc(db, `competitions/${selectedCompetition}/teams`, id));
      setExistingTeams(existingTeams.filter((t) => t.id !== id));
      toast.success("Team deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    } finally {
      setDeleteTeamDialog({ isOpen: false, id: null, name: "" });
    }
  };

  const handleUpdateParsedTeam = () => {
    if (editingParsedTeamIndex === null || !editingParsedTeam) return;

    const newParsedTeams = [...parsedTeams];
    newParsedTeams[editingParsedTeamIndex] = editingParsedTeam;
    setParsedTeams(newParsedTeams);
    setEditingParsedTeam(null);
    setEditingParsedTeamIndex(null);
    toast.success("Preview team updated");
  };

  const confirmDeleteParsedTeam = (index: number, name: string) => {
    setDeleteParsedTeamDialog({ isOpen: true, index, name });
  };

  const handleDeleteParsedTeam = () => {
    if (deleteParsedTeamDialog.index === null) return;
    const newParsedTeams = parsedTeams.filter(
      (_, i) => i !== deleteParsedTeamDialog.index,
    );
    setParsedTeams(newParsedTeams);
    toast.success("Team removed from import preview");
    setDeleteParsedTeamDialog({ isOpen: false, index: null, name: "" });
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
      <div>
        <h1 className="text-2xl font-semibold">Import Teams</h1>
        <p className="text-[#888888] text-sm mt-1">
          Import teams from a CSV file
        </p>
      </div>

      {/* Competition Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Competition</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
          >
            <option value="">Select a competition...</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-[#c0c0c0] bg-[#1a1a1a]"
                : "border-[#333333] hover:border-[#444444]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-[#888888]" />
              <span className="text-sm text-[#888888]">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-[#555555]">CSV file only</span>
            </label>
          </div>

          <div className="text-xs text-[#888888] space-y-1">
            <p>Expected CSV columns:</p>
            <code className="block bg-[#0a0a0a] p-2 text-[#a1a1a1]">
              team_name, project_title, domain, submission_url, member_name,
              member_email, student_id, university
            </code>
          </div>

          {csvText && (
            <div className="space-y-2">
              <p className="text-sm text-[#888888]">Raw CSV preview:</p>
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCSV(e.target.value);
                }}
                rows={6}
                className="w-full bg-[#0a0a0a] border border-[#333333] px-3 py-2 text-xs font-mono text-[#a1a1a1] focus:border-[#c0c0c0] focus:outline-none resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parsed Teams Preview */}
      {parsedTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Preview ({parsedTeams.length} teams)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-[#333333] max-h-64 overflow-auto">
              {parsedTeams.map((team, idx) => (
                <div
                  key={idx}
                  className="p-3 border-b border-[#333333] last:border-b-0 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{team.name}</span>
                      <span className="text-xs text-[#888888] whitespace-nowrap">
                        {team.members.length} members
                      </span>
                    </div>
                    <p className="text-xs text-[#888888] mt-1 truncate">
                      {team.projectTitle || "No project title"}
                      {team.domain && ` - ${team.domain}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#888888] hover:text-white"
                      onClick={() => {
                        setEditingParsedTeam({ ...team });
                        setEditingParsedTeamIndex(idx);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#888888] hover:text-[#ff4444]"
                      onClick={() => confirmDeleteParsedTeam(idx, team.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-4">
              <Button onClick={handleImport} disabled={importing}>
                {importing
                  ? "Importing..."
                  : `Import ${parsedTeams.length} Teams`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCsvText("");
                  setParsedTeams([]);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-white" />
              <div>
                <p className="font-medium">
                  Successfully imported {importResult.imported} teams
                </p>
                {importResult.errors.length > 0 && (
                  <p className="text-sm text-[#888888] mt-1">
                    {importResult.errors.length} errors occurred
                  </p>
                )}
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4 border border-[#333333] p-3">
                <p className="text-sm text-[#888888] mb-2">Errors:</p>
                {importResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-[#ff4444]"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Row {err.index + 2}: {err.reason}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Teams */}
      {selectedCompetition && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mt-6">
            <h2 className="text-xl font-semibold">Existing Teams</h2>
            <p className="text-sm text-[#888888]">
              {existingTeams.length} teams
            </p>
          </div>

          {loadingTeams ? (
            <Card>
              <CardContent className="py-8 text-center text-[#888888]">
                Loading teams...
              </CardContent>
            </Card>
          ) : existingTeams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-[#888888]">
                No teams found for this competition
              </CardContent>
            </Card>
          ) : (
            <div className="border border-[#333333]">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
                <div className="col-span-3">Team</div>
                <div className="col-span-3">Project</div>
                <div className="col-span-2">Domain</div>
                <div className="col-span-1">Members</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {existingTeams.map((team) => (
                <div
                  key={team.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 text-sm items-center"
                >
                  <div className="col-span-3 font-medium truncate">
                    {team.name}
                  </div>
                  <div className="col-span-3 text-[#a1a1a1] truncate">
                    {team.projectTitle || "-"}
                  </div>
                  <div className="col-span-2 text-[#888888] truncate">
                    {team.domain || "-"}
                  </div>
                  <div className="col-span-1 text-[#888888]">
                    {team.members?.length || 0}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`text-xs px-2 py-0.5 border capitalize ${team.status === "disqualified" ? "border-[#ff4444] text-[#ff4444]" : team.status === "submitted" ? "border-white text-white" : "border-[#333333] text-[#888888]"}`}
                    >
                      {team.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#888888] hover:text-white"
                      onClick={() => setEditingTeam(team)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#888888] hover:text-[#ff4444]"
                      onClick={() => confirmDeleteTeam(team.id, team.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#0a0a0a] border-[#333333] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-base text-white">Edit Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Team Name</label>
                <Input
                  value={editingTeam.name}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Project Title</label>
                <Input
                  value={editingTeam.projectTitle}
                  onChange={(e) =>
                    setEditingTeam({
                      ...editingTeam,
                      projectTitle: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Domain</label>
                <Input
                  value={editingTeam.domain}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, domain: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Status</label>
                <select
                  value={editingTeam.status}
                  onChange={(e) =>
                    setEditingTeam({
                      ...editingTeam,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
                >
                  <option value="registered">Registered</option>
                  <option value="submitted">Submitted</option>
                  <option value="disqualified">Disqualified</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4 justify-end">
                <Button variant="outline" onClick={() => setEditingTeam(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTeam}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Parsed Team Modal */}
      {editingParsedTeam && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#0a0a0a] border-[#333333] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Edit Import Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Team Name</label>
                <Input
                  value={editingParsedTeam.name}
                  onChange={(e) =>
                    setEditingParsedTeam({
                      ...editingParsedTeam,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Project Title</label>
                <Input
                  value={editingParsedTeam.projectTitle}
                  onChange={(e) =>
                    setEditingParsedTeam({
                      ...editingParsedTeam,
                      projectTitle: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#a1a1a1]">Domain</label>
                <Input
                  value={editingParsedTeam.domain}
                  onChange={(e) =>
                    setEditingParsedTeam({
                      ...editingParsedTeam,
                      domain: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2 pt-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingParsedTeam(null);
                    setEditingParsedTeamIndex(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateParsedTeam}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Team Confirmation */}
      <ConfirmDialog
        isOpen={deleteTeamDialog.isOpen}
        title="Delete Team"
        description={`Are you sure you want to delete team "${deleteTeamDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDeleteTeam}
        onCancel={() =>
          setDeleteTeamDialog({ isOpen: false, id: null, name: "" })
        }
      />

      <ConfirmDialog
        isOpen={deleteParsedTeamDialog.isOpen}
        title="Remove Import Team"
        description={`Are you sure you want to remove "${deleteParsedTeamDialog.name}" from the import list?`}
        confirmText="Remove"
        isDestructive={true}
        onConfirm={handleDeleteParsedTeam}
        onCancel={() =>
          setDeleteParsedTeamDialog({ isOpen: false, index: null, name: "" })
        }
      />
    </div>
  );
}
