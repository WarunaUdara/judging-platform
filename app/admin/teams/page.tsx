"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import type { Competition, ImportTeamsResponse } from "@/lib/types";
import toast from "react-hot-toast";

export default function TeamsPage() {
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

  useEffect(() => {
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
  }, [preselectedCompId]);

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
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setImporting(false);
    }
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
                  className="p-3 border-b border-[#333333] last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{team.name}</span>
                    <span className="text-xs text-[#888888]">
                      {team.members.length} members
                    </span>
                  </div>
                  <p className="text-xs text-[#888888] mt-1">
                    {team.projectTitle || "No project title"}
                    {team.domain && ` - ${team.domain}`}
                  </p>
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
    </div>
  );
}
