"use client";

import { Avatar } from "@/components/common/Avatar";
import { SmartBadge } from "./SmartBadge";
import { formatWhen, formatType, mapSessionStatus, npr } from "@/lib/format";
import type { SessionData } from "@/services/api/sessions";

interface SessionCardProps {
  session: SessionData;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
  onRate: (id: string) => void;
  onClick: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  Confirmed: "!bg-success/15 !text-success",
  Completed: "!bg-amber/15 !text-amber",
  Cancelled: "!bg-danger !text-white",
};

export function SessionCard({ session, onCancel, onReschedule, onRate, onClick }: SessionCardProps) {
  const displayStatus = mapSessionStatus(session.status);
  const isUpcoming = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";

  return (
    <div
      className="card-soft p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition"
      onClick={() => onClick(session.id)}
    >
      <div className="flex items-start gap-3">
        <Avatar name={session.therapistName || "T"} size={44} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] leading-tight truncate">{session.therapistName || "Therapist"}</div>
          <div className="text-xs text-text-light mt-0.5 truncate">{formatType(session.type)}</div>
        </div>
        <SmartBadge date={session.date} time={session.time} status={session.status} />
      </div>

      <div className="text-xs text-text-light/80 leading-relaxed">
        {formatWhen(session.date, session.time)}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[13px] font-semibold text-text">{npr(session.fee)}</span>
        <span className={`chip ${statusStyles[displayStatus] ?? ""}`}>
          {displayStatus}
        </span>
      </div>

      {isUpcoming && (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onReschedule(session.id)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border border-primary text-primary text-xs font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all flex-1"
          >
            Reschedule
          </button>
          <button
            onClick={() => onCancel(session.id)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border border-danger text-danger text-xs font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all flex-1"
          >
            Cancel
          </button>
        </div>
      )}

      {displayStatus === "Completed" && (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onRate(session.id)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border border-primary text-primary text-[11px] font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all w-full"
          >
            Rate
          </button>
        </div>
      )}
    </div>
  );
}
