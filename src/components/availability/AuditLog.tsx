"use client";

import { Undo2 } from "lucide-react";
import { to12h } from "@/lib/format";
import type { AuditLogEntry } from "@/services/api/availability";

interface AuditLogProps {
  entries: AuditLogEntry[];
  onDelete: (id: string) => void;
}

export function AuditLog({ entries, onDelete }: AuditLogProps) {
  const visible = entries.slice(0, 8);

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
                <strong>{entry.date}</strong> · {entry.slotKey}
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
            onClick={() => onDelete(entry.id)}
          >
            Undo
          </button>
        </div>
      ))}
    </div>
  );
}
