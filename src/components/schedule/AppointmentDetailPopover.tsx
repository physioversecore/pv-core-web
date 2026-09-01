"use client";

import { useEffect, useRef } from "react";
import { Clock, MapPin, Phone, Calendar, AlertTriangle, User } from "lucide-react";
import { to12h } from "@/lib/format";
import { isDateInPast } from "@/lib/availability-utils";
import type { ScheduleAppointment, ScheduleAppointmentStatus } from "@/hooks/useTherapistSchedule";

const STATUS_LABELS: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "Confirmed",
  reschedule_requested: "Reschedule requested",
  decline_requested: "Decline requested",
  completed: "Completed",
};

const STATUS_CLASSES: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "bg-secondary text-white",
  reschedule_requested: "bg-[#5b6ea8] text-white",
  decline_requested: "bg-[#b0454b] text-white",
  completed: "bg-[#8b8f87] text-white",
};

interface AppointmentDetailPopoverProps {
  appointment: ScheduleAppointment;
  anchorRect: DOMRect;
  onClose: () => void;
  onRequestReschedule?: (appointment: ScheduleAppointment) => void;
  onRequestDecline?: (appointment: ScheduleAppointment) => void;
}

export function AppointmentDetailPopover({
  appointment: a,
  anchorRect,
  onClose,
  onRequestReschedule,
  onRequestDecline,
}: AppointmentDetailPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const past = isDateInPast(a.date);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const left = Math.min(anchorRect.right + 8, window.innerWidth - 320);
  const top = Math.max(10, Math.min(anchorRect.top - 20, window.innerHeight - 280));

  return (
    <div
      ref={ref}
      className="fixed z-[60] bg-white rounded-xl shadow-lg border border-border w-[300px] p-4"
      style={{ left, top }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="font-display text-[15px] font-semibold">{a.patient}</h4>
          <p className="text-xs text-text-light mt-0.5">
            {a.type} · {to12h(a.time)}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_CLASSES[a.status]}`}>
          {STATUS_LABELS[a.status]}
        </span>
      </div>

      <div className="space-y-2 mt-3 text-xs text-text-light">
        {a.familyMemberName && (
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <span>For: {a.familyMemberName}</span>
          </div>
        )}
        {a.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <span>{a.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <span>{a.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <span>
            {new Date(a.date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <span>{to12h(a.time)}</span>
        </div>
      </div>

      {a.requestPending && (
        <div className="mt-3 bg-[#fef8ec] border border-[#ecd9ac] text-[#8a5a17] text-[11px] px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-semibold">Waiting on admin</span>
          </div>
          <span>{a.requestReason || "Request submitted — awaiting admin decision."}</span>
        </div>
      )}

      {past && !a.requestPending && (
        <div className="mt-3 bg-surface text-text-light text-[11px] px-3 py-2 rounded-lg">
          This date has passed — no reschedule or decline requests can be made.
        </div>
      )}

      {!past && !a.requestPending && a.status !== "completed" && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={() => onRequestReschedule?.(a)}
            className="flex-1 py-2 rounded-lg bg-[#5b6ea8] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Request reschedule
          </button>
          <button
            onClick={() => onRequestDecline?.(a)}
            className="flex-1 py-2 rounded-lg bg-[#b0454b] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Request decline
          </button>
        </div>
      )}
    </div>
  );
}
