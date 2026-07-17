"use client";

import type { AuditLogEntry } from "@/services/api/availability";

interface AuditLogProps {
  entries: AuditLogEntry[];
  onReopen?: (entry: AuditLogEntry) => void;
  onUnblock?: (entry: AuditLogEntry) => void;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AuditLog({ entries, onReopen, onUnblock }: AuditLogProps) {
  const visible = entries.slice(0, 8);

  return (
    <div className="card-soft p-5 sm:p-6">
      <p className="eyebrow mb-3">Recent blocks</p>
      {visible.length === 0 ? (
        <p className="text-xs text-text-light">
          No time blocked yet — anything you block will show up here so you can undo it in one tap.
        </p>
      ) : (
        <div>
          {visible.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0 text-[13px]"
            >
              <div>
                <span className="font-semibold">{formatDateShort(entry.date)}</span> · {entry.who}
                <div className="text-xs text-text-light">
                  {entry.reason} · <span className="font-semibold">{entry.source}</span>
                </div>
              </div>
              {entry.time ? (
                <button
                  onClick={() => onReopen?.(entry)}
                  className="bg-transparent border-none text-gold-dark font-bold text-[12.5px] cursor-pointer"
                >
                  Reopen
                </button>
              ) : (
                <button
                  onClick={() => onUnblock?.(entry)}
                  className="bg-transparent border-none text-gold-dark font-bold text-[12.5px] cursor-pointer"
                >
                  Unblock day
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
