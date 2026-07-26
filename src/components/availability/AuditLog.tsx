"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { to12h } from "@/lib/format";
import type { AuditLogEntry } from "@/services/api/availability";

interface AuditLogProps {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onUnblock: (data: { date: string; time?: string }) => Promise<void>;
  isUnblocking: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDayList(days?: string[] | null): string {
  if (!days || days.length === 0) return "";
  if (days.length === 7) return "every day";
  if (
    days.length === 5 &&
    ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => days.includes(d))
  )
    return "weekdays";
  if (
    days.length === 2 &&
    ["Sat", "Sun"].every((d) => days.includes(d))
  )
    return "weekends";
  return days.join(", ");
}

function formatParts(parts?: string[] | null): string {
  if (!parts || parts.length === 0) return "";
  if (parts.length === 3) return "";
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" & ");
}

function describeEntry(entry: AuditLogEntry): string {
  const dayStr = formatDayList(entry.daysOfWeek ?? []);
  const partStr = formatParts(entry.partsOfDay ?? []);
  const scope = entry.scope ?? "";
  const dateTo = entry.dateTo ?? entry.date;

  let label = "";
  if (entry.time) {
    label = `Blocked at ${to12h(entry.time)} on ${formatDate(entry.date)}`;
  } else if (scope === "specific") {
    label = `Blocked on ${formatDate(entry.date)}`;
  } else if (scope === "recurring") {
    label = `Blocked ${formatDate(entry.date)} – ${formatDate(dateTo)}`;
    if (dayStr) label += ` · ${dayStr}`;
  } else {
    label = `Blocked ${formatDate(entry.date)} – ${formatDate(dateTo)}`;
  }

  if (partStr) label += ` · ${partStr}`;

  return label;
}

export function AuditLog({ entries, total, page, limit, onPageChange, onDelete, onUnblock, isUnblocking }: AuditLogProps) {
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const totalPages = Math.ceil(total / limit);

  const handleUndo = async (entry: AuditLogEntry) => {
    setUndoingId(entry.id);
    try {
      await onUnblock({ date: entry.date, time: entry.time ?? undefined });
      await onDelete(entry.id);
    } finally {
      setUndoingId(null);
    }
  };

  if (total === 0) {
    return (
      <p className="proto-preview-note">
        No time blocked yet — anything you block will show up here so you can undo it in one tap.
      </p>
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <div key={entry.id} className="proto-audit-item">
            <div>
              <div className="font-medium text-[13px]">
                {describeEntry(entry)}
              </div>
              <div className="proto-audit-meta">
                {entry.reason}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[12px] text-text-muted">
            {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="proto-nav-btn"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="proto-nav-btn"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
