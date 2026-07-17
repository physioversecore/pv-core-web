"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";
import { to12h } from "@/lib/format";
import type { AuditLogEntry } from "@/services/api/availability";

interface AuditLogProps {
  entries: AuditLogEntry[];
  onDelete: (id: string) => void;
  onUnblock: (data: { date: string; time?: string }) => Promise<void>;
  isUnblocking: boolean;
}

export function AuditLog({ entries, onDelete, onUnblock, isUnblocking }: AuditLogProps) {
  const visible = entries.slice(0, 8);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const handleUndo = async (entry: AuditLogEntry) => {
    setUndoingId(entry.id);
    try {
      await onUnblock({ date: entry.date, time: entry.time ?? undefined });
      await onDelete(entry.id);
    } finally {
      setUndoingId(null);
    }
  };

  if (visible.length === 0) {
    return (
      <p className="proto-preview-note">
        No time blocked yet — anything you block will show up here so you can undo it in one tap.
      </p>
    );
  }

  return (
    <div>
      {visible.map((entry) => (
        <div key={entry.id} className="proto-audit-item">
            <div>
              <div>
                <strong>{entry.date}</strong>
                {entry.time && (
                  <span style={{ marginLeft: "6px" }}>{to12h(entry.time)}</span>
                )}
              </div>
              <div className="proto-audit-meta">
                {entry.reason} · <span style={{ fontWeight: 600 }}>{entry.source}</span>
              </div>
            </div>
          <button
            className="proto-link-btn"
            disabled={isUnblocking || undoingId === entry.id}
            onClick={() => handleUndo(entry)}
          >
            {undoingId === entry.id ? "Undoing..." : "Undo"}
          </button>
        </div>
      ))}
    </div>
  );
}
