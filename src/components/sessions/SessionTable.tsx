"use client";

import { SmartBadge } from "./SmartBadge";
import { formatWhen, formatType, npr, mapSessionStatus } from "@/lib/format";
import type { SessionData } from "@/services/api/sessions";
import { CheckCircle2, XCircle, RefreshCw, X } from "lucide-react";

interface SessionTableProps {
  sessions: SessionData[];
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
  onRate: (id: string) => void;
  onClick: (id: string) => void;
  rateableIds?: Set<string>;
}

const statusStyles: Record<string, string> = {
  Confirmed: "!bg-success/15 !text-success",
  Completed: "!bg-amber/15 !text-amber",
  Cancelled: "!bg-danger !text-white",
};

export function SessionTable({ sessions, onCancel, onReschedule, onRate, onClick, rateableIds }: SessionTableProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase font-mono text-text-light text-left border-b border-border bg-surface/50">
            <th className="py-2.5 px-3 md:px-4 font-medium">Therapist</th>
            <th className="py-2.5 px-3 md:px-4 font-medium">Date & time</th>
            <th className="py-2.5 px-3 md:px-4 font-medium hidden md:table-cell">Type</th>
            <th className="py-2.5 px-3 md:px-4 font-medium hidden md:table-cell">Fee</th>
            <th className="py-2.5 px-3 md:px-4 font-medium text-center md:text-left">Status</th>
            <th className="py-2.5 px-3 md:px-4"></th>
            <th className="py-2.5 px-3 md:px-4 md:hidden"></th>
            <th className="py-2.5 px-3 md:px-4 md:hidden"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sessions.map((s) => {
            const displayStatus = mapSessionStatus(s.status);
            const isUpcoming = s.status === "SCHEDULED" || s.status === "IN_PROGRESS";
            const isPast = new Date(s.date) < new Date(new Date().toDateString());
            const showActions = isUpcoming && !isPast;
            const canRate = displayStatus === "Completed" && rateableIds?.has(s.id);
            return (
              <tr
                key={s.id}
                className="cursor-pointer hover:bg-surface/50 transition"
                onClick={() => onClick(s.id)}
              >
                <td className="py-3.5 px-3 md:px-4 font-medium text-secondary truncate">
                  {s.therapistName || "Therapist"}
                </td>
                <td className="py-3.5 px-3 md:px-4 text-text-light whitespace-nowrap text-ellipsis overflow-hidden">
                  {formatWhen(s.date, s.time)}
                </td>
                <td className="py-3.5 px-3 md:px-4 text-text-light truncate table-cell">
                  {formatType(s.type)}
                </td>
                <td className="py-3.5 px-3 md:px-4 text-text-light whitespace-nowrap table-cell">
                  {npr(s.fee)}
                </td>
                <td className="py-3.5 px-3 md:px-4 text-center md:text-left">
                  {/* Desktop: badge + chip */}
                  <span className="hidden md:inline-flex items-center gap-1.5">
                    <SmartBadge date={s.date} time={s.time} status={s.status} />
                    <span className={`chip ${statusStyles[displayStatus] ?? ""}`}>
                      {displayStatus}
                    </span>
                  </span>
                  {/* Mobile: centered icon */}
                  <span className="md:hidden flex items-center justify-center">
                    {displayStatus === "Confirmed" && <CheckCircle2 size={22} className="text-success" />}
                    {displayStatus === "Completed" && <CheckCircle2 size={22} className="text-amber" />}
                    {displayStatus === "Cancelled" && <XCircle size={22} className="text-danger" />}
                  </span>
                </td>
                <td className="py-3.5 px-3 md:px-4 text-right">
                  {showActions && (
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Desktop: text buttons */}
                      <button
                        onClick={() => onReschedule(s.id)}
                        className="hidden md:inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary text-[11px] font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => onCancel(s.id)}
                        className="hidden md:inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-danger text-danger text-[11px] font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all whitespace-nowrap"
                      >
                        Cancel Session
                      </button>
                      {/* Mobile: icon-only buttons */}
                      <button
                        onClick={() => onReschedule(s.id)}
                        className="md:hidden w-8 h-8 rounded-xl border border-primary text-primary flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all"
                      >
                        <RefreshCw size={12} />
                      </button>
                      <button
                        onClick={() => onCancel(s.id)}
                        className="md:hidden w-8 h-8 rounded-xl border border-danger text-danger flex items-center justify-center cursor-pointer hover:bg-danger hover:text-white transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {canRate && (
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRate(s.id)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary text-[11px] font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                      >
                        Rate
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
