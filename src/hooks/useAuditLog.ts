"use client";

import { useEffect, useState } from "react";
import { getAuditLog, deleteAuditEntry, type AuditLogEntry } from "@/services/api/availability";

const SOURCE_LABEL: Record<string, string> = {
  "block-mode": "Block time off",
  daily: "Daily view",
  weekly: "Weekly view",
  monthly: "Monthly view",
};

export function useAuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    getAuditLog().then(setEntries).catch(() => {});
  }, []);

  const addEntry = (entry: AuditLogEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const removeEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteAuditEntry(id);
    } catch {
      // re-fetch on failure
      getAuditLog().then(setEntries).catch(() => {});
    }
  };

  return { entries, addEntry, removeEntry };
}
