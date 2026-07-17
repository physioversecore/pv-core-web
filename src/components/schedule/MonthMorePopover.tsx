"use client";

import { useEffect, useRef } from "react";
import { to12h } from "@/lib/format";
import { isDateInPast } from "@/lib/availability-utils";
import type { ScheduleAppointment, ScheduleAppointmentStatus } from "@/hooks/useTherapistSchedule";

const DOT_COLORS: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "bg-secondary",
  reschedule_requested: "bg-[#5b6ea8]",
  decline_requested: "bg-[#b0454b]",
  completed: "bg-[#8b8f87]",
};

interface MonthMorePopoverProps {
  appointments: ScheduleAppointment[];
  anchorRect: DOMRect;
  onClose: () => void;
  onSelectAppointment: (appointment: ScheduleAppointment, e: React.MouseEvent) => void;
}

export function MonthMorePopover({
  appointments,
  anchorRect,
  onClose,
  onSelectAppointment,
}: MonthMorePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  const left = Math.min(anchorRect.left, window.innerWidth - 250);
  const top = anchorRect.bottom + 6;

  return (
    <div
      ref={ref}
      className="fixed z-[55] bg-white rounded-xl shadow-lg border border-border p-2.5 w-[230px]"
      style={{ left, top }}
    >
      {appointments.map((a) => (
        <div
          key={a.id}
          onClick={(e) => onSelectAppointment(a, e)}
          className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer hover:bg-surface transition-colors ${
            isDateInPast(a.date) ? "opacity-60" : ""
          }`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[a.status]}`} />
            <span className="truncate font-medium">{a.patient}</span>
          </span>
          <span className="text-text-light flex-shrink-0">{to12h(a.time)}</span>
        </div>
      ))}
    </div>
  );
}
