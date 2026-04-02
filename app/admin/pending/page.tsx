"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface PendingUser {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
}

export default function PendingRegistrationsPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // States to hold the selected role for a given user uid
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(
    {},
  );

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch("/api/users/pending");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load pending registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleRoleChange = (uid: string, newRole: string) => {
    setSelectedRoles((prev) => ({ ...prev, [uid]: newRole }));
  };

  const confirmRegistration = async (uid: string) => {
    const roleToAssign = selectedRoles[uid] || "evaluator"; // default fallback
    setProcessingId(uid);

    try {
      const res = await fetch("/api/users/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, role: roleToAssign }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm user");

      toast.success("User registration confirmed");
      // Remove from the local state list immediately
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (error) {
      console.error("Confirmation error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to confirm registration",
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-[#888888]">Loading registrations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-yellow-500" /> Pending
            Registrations
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            Review and assign roles to newly registered users
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[#888888]">No pending registrations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-[#333333]">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] text-sm text-[#888888]">
            <div className="col-span-5">User Details</div>
            <div className="col-span-4">Assign Role</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {users.map((pendingUser) => (
            <div
              key={pendingUser.uid}
              className="grid grid-cols-12 gap-4 p-4 border-b border-[#333333] last:border-b-0 items-center hover:bg-[#0a0a0a] transition-colors"
            >
              <div className="col-span-5">
                <p className="font-medium text-white truncate">
                  {pendingUser.displayName || "No Name"}
                </p>
                <p className="text-xs text-[#888888] mt-1 truncate">
                  {pendingUser.email}
                </p>
              </div>

              <div className="col-span-4">
                <select
                  value={selectedRoles[pendingUser.uid] || "evaluator"}
                  onChange={(e) =>
                    handleRoleChange(pendingUser.uid, e.target.value)
                  }
                  className="w-full h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white focus:border-[#c0c0c0] focus:outline-none"
                >
                  <option value="evaluator">Evaluator</option>
                  <option value="organizer">Organizer</option>
                  {role === "superadmin" && (
                    <option value="superadmin">Super Admin</option>
                  )}
                </select>
              </div>

              <div className="col-span-3 flex justify-end gap-2 relative">
                <Button
                  onClick={() => confirmRegistration(pendingUser.uid)}
                  disabled={processingId === pendingUser.uid}
                  className="gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {processingId === pendingUser.uid
                    ? "Confirming..."
                    : "Confirm"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
