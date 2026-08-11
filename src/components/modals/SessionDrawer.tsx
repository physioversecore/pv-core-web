"use client";

import { X, Calendar, MapPin, Clock, CreditCard, FileText } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { SmartBadge } from "@/components/sessions/SmartBadge";
import { formatDate, formatType, mapSessionStatus, npr, isPast, isOverdueSession } from "@/lib/format";
import type { SessionData } from "@/services/api/sessions";

interface SessionDrawerProps {
  session: SessionData;
  onClose: () => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  Confirmed: "!bg-success/15 !text-success",
  Completed: "!bg-amber/15 !text-amber",
  Cancelled: "!bg-danger !text-white",
  Overdue: "!bg-danger/15 !text-danger",
};

export function SessionDrawer({
  session,
  onClose,
  onCancel,
  onReschedule,
}: SessionDrawerProps) {
  const isOverdue = isOverdueSession(session.status, session.date, session.time);
  const displayStatus = isOverdue ? "Overdue" : mapSessionStatus(session.status);
  const isUpcoming = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";
  const showActions = isUpcoming && !isPast(session.date, session.time);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-text/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md bg-background border-l border-border shadow-2xl h-full overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10 flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-lg">Session details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Therapist header */}
          <div className="flex items-start gap-4">
            <Avatar name={session.therapistName || "T"} size={56} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl truncate">
                {session.therapistName || "Therapist"}
              </div>
              <div className="text-sm text-text-light mt-0.5">{formatType(session.type)}</div>
              <div className="flex items-center gap-2 mt-2">
                {!isOverdue && <SmartBadge date={session.date} time={session.time} status={session.status} />}
                <span className={`chip ${statusStyles[displayStatus] ?? ""}`}>
                  {displayStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            <DetailRow icon={<Calendar size={16} />} label="Date" value={formatDate(session.date)} />
            <DetailRow icon={<Clock size={16} />} label="Time" value={session.time} />
            <DetailRow icon={<MapPin size={16} />} label="Address" value={session.address} />
            <DetailRow icon={<CreditCard size={16} />} label="Fee" value={npr(session.fee)} />
            {session.notes && (
              <DetailRow icon={<FileText size={16} />} label="Notes" value={session.notes} />
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => onReschedule(session.id)}
                className="btn-primary w-full"
              >
                Reschedule session
              </button>
              <button
                onClick={() => onCancel(session.id)}
                className="inline-flex items-center justify-center gap-1 p-3 rounded-xl border border-danger text-danger font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all"
              >
                Cancel session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-3.5 py-3">
      <div className="w-8 h-8 rounded-lg bg-surface grid place-items-center shrink-0 text-text-light">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-text-light uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}
