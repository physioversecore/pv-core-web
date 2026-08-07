"use client";

import { SmartBadge } from "./SmartBadge";
import { formatWhen, formatType, npr, mapSessionStatus, isPast } from "@/lib/format";
import type { SessionData } from "@/services/api/sessions";
import { CheckCircle2, XCircle, RefreshCw, X, Clock, IndianRupee, Star } from "lucide-react";

interface SessionTableProps {
  sessions: SessionData[];
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
  onRate: (id: string) => void;
  onClick: (id: string) => void;
  rateableIds?: Set<string>;
}

const statusStyles: Record<string, string> = {
  Confirmed: "!bg-blue-600/75 !text-white",
  Completed: "!bg-amber/15 !text-amber",
  Cancelled: "!bg-danger !text-white",
};

const statusIconStyles: Record<string, string> = {
  Confirmed: "text-blue-600/75",
  Completed: "text-success",
  Cancelled: "text-danger",
};

export function SessionTable({ sessions, onCancel, onReschedule, onRate, onClick, rateableIds }: SessionTableProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide font-mono text-text-light text-left border-b border-border bg-surface/60">
            <th className="py-2.5 px-3 md:px-4 font-medium">Therapist</th>
            <th className="py-2.5 px-3 md:px-4 font-medium">Date & time</th>
            <th className="py-2.5 px-3 md:px-4 font-medium hidden md:table-cell">Type</th>
            <th className="py-2.5 px-3 md:px-4 font-medium hidden md:table-cell">Fee</th>
            <th className="py-2.5 px-3 md:px-4 font-medium text-center md:text-left">Status</th>
            <th className="py-2.5 px-3 md:px-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sessions.map((s) => {
            const displayStatus = mapSessionStatus(s.status);
            const isUpcoming = s.status === "SCHEDULED" || s.status === "IN_PROGRESS";
            const isOverdue = isPast(s.date, s.time);
            const showActions = isUpcoming && !isOverdue;
            const canRate = displayStatus === "Completed" && rateableIds?.has(s.id);
            return (
              <tr
                key={s.id}
                className="cursor-pointer hover:bg-surface/50 transition-colors"
                onClick={() => onClick(s.id)}
              >
                <td className="py-3.5 px-3 md:px-4 max-w-[140px] md:max-w-none">
                  <div className="text-sm font-medium text-secondary truncate">{s.therapistName || "Therapist"}</div>
                  <div className="text-[10px] text-text-light truncate md:hidden">{formatType(s.type)}</div>
                </td>
                <td className="py-3.5 px-3 md:px-4 text-text-light whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} className="opacity-60 shrink-0 hidden md:inline" />
                    {formatWhen(s.date, s.time)}
                  </span>
                </td>
                <td className="py-3.5 px-3 md:px-4 text-text-light truncate hidden md:table-cell">
                  {formatType(s.type)}
                </td>
                <td className="py-3.5 px-3 md:px-4 text-text-light whitespace-nowrap hidden md:table-cell">
                  <span className="inline-flex items-center gap-1">
                    {npr(s.fee)}
                  </span>
                </td>
                <td className="py-3.5 px-3 md:px-4 text-center md:text-left">
                  {/* Desktop: badge + chip */}
                  <span className="hidden md:inline-flex items-center gap-1.5 text-[10px]">
                    <SmartBadge date={s.date} time={s.time} status={s.status} />
                    <span className={`chip text-[10px] ${statusStyles[displayStatus] ?? ""}`}>
                      {displayStatus}
                    </span>
                  </span>
                  {/* Mobile: centered icon */}
                  <span className="md:hidden flex items-center justify-center">
                    {displayStatus === "Confirmed" && <CheckCircle2 size={20} className={statusIconStyles.Confirmed} />}
                    {displayStatus === "Completed" && <CheckCircle2 size={20} className={statusIconStyles.Completed} />}
                    {displayStatus === "Cancelled" && <XCircle size={20} className={statusIconStyles.Cancelled} />}
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
                        <RefreshCw size={11} />
                        Reschedule
                      </button>
                      <button
                        onClick={() => onCancel(s.id)}
                        className="hidden md:inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-danger text-danger text-[11px] font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all whitespace-nowrap"
                      >
                        <X size={11} />
                        Cancel
                      </button>
                      {/* Mobile: icon-only buttons, 36px touch target */}
                      <button
                        onClick={() => onReschedule(s.id)}
                        aria-label="Reschedule"
                        className="md:hidden w-6 h-6 rounded-xl border border-primary text-primary flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => onCancel(s.id)}
                        aria-label="Cancel"
                        className="md:hidden w-6 h-6 rounded-xl border border-danger text-danger flex items-center justify-center cursor-pointer hover:bg-danger hover:text-white transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {canRate && (
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRate(s.id)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary text-[11px] font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                      >
                        <Star size={11} />
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
