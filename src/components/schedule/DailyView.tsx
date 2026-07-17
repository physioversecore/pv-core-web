"use client";

import { useMemo } from "react";
import { to12h } from "@/lib/format";
import { generateTimeSlots, isDateInPast, isSlotInPast } from "@/lib/availability-utils";
import type { ScheduleAppointment, ScheduleAppointmentStatus } from "@/hooks/useTherapistSchedule";
import type { WorkingHours } from "@/lib/availability-utils";

const DOW_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

const CARD_CLASSES: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "bg-[#e4efe9] border-secondary text-secondary",
  reschedule_requested: "bg-[#e8eaf6] border-[#5b6ea8] text-[#5b6ea8]",
  decline_requested: "bg-[#f7e4e4] border-[#b0454b] text-[#b0454b]",
  completed: "bg-[#eeece6] border-[#8b8f87] text-[#8b8f87]",
};

const PILL_CLASSES: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "bg-secondary text-white",
  reschedule_requested: "bg-[#5b6ea8] text-white",
  decline_requested: "bg-[#b0454b] text-white",
  completed: "bg-[#8b8f87] text-white",
};

const STATUS_LABELS: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "Confirmed",
  reschedule_requested: "Reschedule requested",
  decline_requested: "Decline requested",
  completed: "Completed",
};

interface DailyViewProps {
  date: Date;
  appointments: ScheduleAppointment[];
  workingHours: WorkingHours;
  onSelectAppointment: (appointment: ScheduleAppointment, e: React.MouseEvent) => void;
}

export function DailyView({
  date,
  appointments,
  workingHours,
  onSelectAppointment,
}: DailyViewProps) {
  const past = isDateInPast(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  );
  const dow = weekdayIndex(date);

  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const dayAppts = useMemo(
    () =>
      appointments
        .filter((a) => a.date === dateKey)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, dateKey]
  );

  const allSlots = useMemo(() => {
    const interval = workingHours.slotInterval || 60;
    return generateTimeSlots(workingHours.start, workingHours.end, interval);
  }, [workingHours]);

  const hasSlots = allSlots.length > 0;

  return (
    <div
      className={`border border-border rounded-xl overflow-hidden ${
        past ? "bg-[#fbfaf7]" : "bg-white"
      }`}
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-[15px] font-display font-semibold">
          {DOW_FULL[dow]},{" "}
          {date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          {past && (
            <span className="ml-2 text-[11px] font-bold text-[#a8763a] bg-[#fbf1de] border border-[#ecd9ac] px-2.5 py-0.5 rounded-full">
              Past date · view only
            </span>
          )}
        </h3>
        <span className="text-xs text-text-light">
          {dayAppts.length} appointment{dayAppts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {!hasSlots ? (
        <div className="py-10 text-center text-sm text-text-light">
          No working hours set for {DOW_FULL[dow]} — set them in Manage
          Availability.
        </div>
      ) : (
        <div>
          {(() => {
            const rows: React.ReactNode[] = [];
            let i = 0;
            while (i < allSlots.length) {
              const t = allSlots[i];
              const match = dayAppts.find((a) => a.time === t);
              if (match) {
                rows.push(
                  <div
                    key={t}
                    className="grid grid-cols-[70px_1fr] border-b border-border last:border-b-0"
                  >
                    <div className="px-2.5 py-3 text-[11px] text-text-light text-right border-r border-border">
                      {to12h(t)}
                    </div>
                    <div className="px-3 py-2.5">
                      <div
                        onClick={(e) => onSelectAppointment(match, e)}
                        className={`rounded-lg px-3 py-2.5 border-l-4 cursor-pointer transition-all hover:shadow-sm ${CARD_CLASSES[match.status]}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold truncate">
                              {match.patient}
                            </p>
                            <p className="text-[11px] opacity-70 mt-0.5">
                              {match.type} · {match.address}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${PILL_CLASSES[match.status]}`}
                          >
                            {STATUS_LABELS[match.status]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                i++;
              } else {
                const rangeStart = t;
                let j = i;
                while (
                  j < allSlots.length &&
                  !dayAppts.find((a) => a.time === allSlots[j])
                )
                  j++;
                const rangeEnd = allSlots[j - 1];
                const [endH, endM] = rangeEnd.split(":").map(Number);
                const endMin = endH * 60 + endM + (workingHours.slotInterval || 60);
                const endHour = Math.floor(endMin / 60);
                const endMinute = endMin % 60;
                const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

                rows.push(
                  <div
                    key={`gap-${rangeStart}`}
                    className="grid grid-cols-[70px_1fr] border-b border-border last:border-b-0"
                  >
                    <div className="px-2.5 py-3 text-[11px] text-text-light text-right border-r border-border">
                      {to12h(rangeStart)}
                    </div>
                    <div className="px-3 py-3 text-[11px] text-[#9aa196] italic">
                      {past
                        ? "No appointment"
                        : `Free until ${to12h(endTimeStr)}`}
                    </div>
                  </div>
                );
                i = j;
              }
            }
            return rows;
          })()}
        </div>
      )}
    </div>
  );
}
