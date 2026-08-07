"use client";
import { Avatar } from "@/components/common/Avatar";
import { SmartBadge } from "./SmartBadge";
import { formatWhen, formatType, mapSessionStatus, npr, isPast } from "@/lib/format";
import type { SessionData } from "@/services/api/sessions";
import { Clock, RotateCcw, X, Star } from "lucide-react";

interface SessionCardProps {
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
};

export function SessionCard({ session, onCancel, onReschedule, onRate, onClick, rateableIds }: SessionCardProps) {
  const displayStatus = mapSessionStatus(session.status);
  const isUpcoming = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";
  const isOverdue = isPast(session.date, session.time);
  const showActions = isUpcoming && !isOverdue;
  const canRate = displayStatus === "Completed" && rateableIds?.has(session.id);

  return (
    <div
      className="card-soft p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
      onClick={() => onClick(session.id)}
    >
      <div className="flex items-start gap-3">
        <Avatar name={session.therapistName || "T"} size={44} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] leading-tight truncate">
            {session.therapistName || "Therapist"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-light mt-0.5 truncate">
            <span className="truncate">{formatType(session.type)}</span>
          </div>
        </div>
        <SmartBadge date={session.date} time={session.time} status={session.status} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-text-light/90 bg-border/30 rounded-lg px-2.5 py-1.5 leading-relaxed">
        <Clock size={13} className="shrink-0 opacity-70" />
        <span className="truncate">{formatWhen(session.date, session.time)}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-text">
          {npr(session.fee)}
        </span>
        <div className="flex items-center gap-2">
          <span className={`chip ${statusStyles[displayStatus] ?? ""}`}>
            {displayStatus}
          </span>
          {canRate && (
            <button
              onClick={(e) => { e.stopPropagation(); onRate(session.id); }}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all"
            >
              <Star size={12} />
              Rate
            </button>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onReschedule(session.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary text-primary text-xs font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all flex-1"
          >
            <RotateCcw size={13} />
            Reschedule
          </button>
          <button
            onClick={() => onCancel(session.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger text-danger text-xs font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all flex-1"
          >
            <X size={13} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
