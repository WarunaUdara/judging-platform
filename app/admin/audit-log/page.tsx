'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Competition } from '@/lib/types';

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  details: string;
  timestamp: string;
}

export default function AuditLogPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'competitions'));
        const comps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Competition));
        setCompetitions(comps);
      } catch (error) {
        console.error('Error fetching competitions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (!selectedCompetition) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(
          query(
            collection(db, `competitions/${selectedCompetition}/audit_logs`),
            orderBy('timestamp', 'desc'),
            limit(100)
          )
        );
        setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [selectedCompetition]);

  if (loading && competitions.length === 0) {
    return <div className="p-6 lg:p-8 text-[#888888]">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <p className="text-[#888888] text-sm mt-1">Track all actions and changes</p>
        </div>
        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          className="h-10 bg-[#0a0a0a] border border-[#333333] px-3 text-sm text-white"
        >
          <option value="">Select competition...</option>
          {competitions.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCompetition && logs.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-[#222222]">
              {logs.map(log => (
                <div key={log.id} className="p-4 hover:bg-[#0a0a0a]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      <p className="text-sm text-[#888888] mt-1">{log.details}</p>
                    </div>
                    <span className="text-xs text-[#555555] whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCompetition && logs.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-[#888888]">
            No audit logs found for this competition
          </CardContent>
        </Card>
      )}

      {!selectedCompetition && (
        <Card>
          <CardContent className="p-8 text-center text-[#888888]">
            Select a competition to view audit logs
          </CardContent>
        </Card>
      )}
    </div>
  );
}