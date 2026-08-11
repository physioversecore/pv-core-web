"use client";

import { Avatar } from "@/components/common/Avatar";
import { SmartBadge } from "./SmartBadge";
import { formatWhen, formatType, npr, mapSessionStatus, isPast, isOverdueSession } from "@/lib/format";
import type { SessionData } from "@/services/api/sessions";

interface SessionRowProps {
  session: SessionData;
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
  Overdue: "!bg-danger/15 !text-danger",
};

export function SessionRow({ session, onCancel, onReschedule, onRate, onClick, rateableIds }: SessionRowProps) {
  const isUpcoming = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";
  const isOverdue = isOverdueSession(session.status, session.date, session.time);
  const displayStatus = isOverdue ? "Overdue" : mapSessionStatus(session.status);
  const showActions = isUpcoming && !isPast(session.date, session.time);
  const canRate = displayStatus === "Completed" && rateableIds?.has(session.id);

  return (
    <div className="card-soft p-4 cursor-pointer hover:shadow-md transition" onClick={() => onClick(session.id)}>
      <div className="flex items-start gap-3.5">
        <Avatar name={session.therapistName || "T"} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[15px] leading-tight truncate">{session.therapistName || "Therapist"}</div>
              <div className="text-xs text-text-light mt-1 leading-relaxed">
                {formatWhen(session.date, session.time)} · {formatType(session.type)}
              </div>
              <div className="text-[13px] text-text-light/80 mt-0.5 font-medium">
                {npr(session.fee)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              {!isOverdue && <SmartBadge date={session.date} time={session.time} status={session.status} />}
              <span className={`chip ${statusStyles[displayStatus] ?? ""}`}>
                {displayStatus}
              </span>
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onReschedule(session.id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border border-primary text-primary text-xs font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all"
              >
                Reschedule
              </button>
              <button
                onClick={() => onCancel(session.id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border border-danger text-danger text-xs font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all"
              >
                Cancel Session
              </button>
            </div>
          )}

          {canRate && (
            <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onRate(session.id)}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border border-primary text-primary text-[11px] font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all"
              >
                Rate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
