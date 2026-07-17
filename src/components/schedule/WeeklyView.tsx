"use client";

import { useMemo } from "react";
import { to12h } from "@/lib/format";
import { generateTimeSlots, isDateInPast, type WorkingHours } from "@/lib/availability-utils";
import type { ScheduleAppointment, ScheduleAppointmentStatus } from "@/hooks/useTherapistSchedule";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function getMonday(d: Date): Date {
  const nd = new Date(d);
  const day = weekdayIndex(nd);
  nd.setDate(nd.getDate() - day);
  return nd;
}

function dateKeyStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SLOT_CARD: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "bg-[#e4efe9] border-secondary text-secondary",
  reschedule_requested: "bg-[#e8eaf6] border-[#5b6ea8] text-[#5b6ea8]",
  decline_requested: "bg-[#f7e4e4] border-[#b0454b] text-[#b0454b]",
  completed: "bg-[#eeece6] border-[#8b8f87] text-[#8b8f87]",
};

interface WeeklyViewProps {
  cursorDate: Date;
  appointments: ScheduleAppointment[];
  workingHours: WorkingHours;
  onSelectAppointment: (appointment: ScheduleAppointment, e: React.MouseEvent) => void;
}

export function WeeklyView({
  cursorDate,
  appointments,
  workingHours,
  onSelectAppointment,
}: WeeklyViewProps) {
  const monday = getMonday(cursorDate);
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [monday]);

  const interval = workingHours.slotInterval || 60;
  const allSlots = useMemo(
    () => generateTimeSlots(workingHours.start, workingHours.end, interval),
    [workingHours, interval]
  );

  const apptMap = useMemo(() => {
    const map: Record<string, ScheduleAppointment> = {};
    for (const a of appointments) {
      map[`${a.date}_${a.time}`] = a;
    }
    return map;
  }, [appointments]);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white min-w-[780px]">
      <div
        className="grid border-b border-border"
        style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}
      >
        <div className="p-2.5 border-r border-border" />
        {days.map((d, i) => {
          const past = isDateInPast(dateKeyStr(d));
          const today =
            dateKeyStr(d) === dateKeyStr(new Date());
          return (
            <div
              key={i}
              className={`p-2.5 text-center border-r border-border last:border-r-0 ${
                today ? "bg-primary/[0.05]" : ""
              } ${past ? "opacity-50" : ""}`}
            >
              <div
                className={`text-xs font-semibold ${
                  today ? "text-primary" : "text-text"
                }`}
              >
                {DOW[i]}
              </div>
              <div
                className={`text-sm mt-0.5 ${
                  today ? "text-primary font-bold" : "text-text-muted"
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {allSlots.length === 0 ? (
        <div className="py-10 text-center text-sm text-text-light">
          No working hours set for this week — set them in Manage Availability.
        </div>
      ) : (
        allSlots.map((t) => (
          <div
            key={t}
            className="grid border-b border-border last:border-b-0"
            style={{ gridTemplateColumns: "70px repeat(7, 1fr)" }}
          >
            <div className="px-2 py-2.5 text-[11px] text-text-light text-right border-r border-border flex items-start justify-center pt-2">
              {to12h(t)}
            </div>
            {days.map((d, di) => {
              const dk = dateKeyStr(d);
              const key = `${dk}_${t}`;
              const apt = apptMap[key];
              const past = isDateInPast(dk);
              const today = dk === dateKeyStr(new Date());
              return (
                <div
                  key={di}
                  className={`border-r border-border last:border-r-0 p-1.5 min-h-[60px] ${
                    past ? "bg-[#f1efe7]" : today ? "bg-primary/[0.02]" : ""
                  }`}
                >
                  {apt && (
                    <div
                      onClick={(e) => onSelectAppointment(apt, e)}
                      className={`rounded-lg p-2 text-[11px] border-l-3 cursor-pointer transition-all hover:shadow-sm ${SLOT_CARD[apt.status]}`}
                    >
                      <p className="font-semibold text-[11.5px] truncate">
                        {apt.patient.split(" ")[0]}
                      </p>
                      <p className="opacity-70 mt-0.5 truncate">{apt.type}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
