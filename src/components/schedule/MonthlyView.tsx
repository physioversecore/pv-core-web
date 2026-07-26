"use client";

import { useMemo } from "react";
import { isDateInPast } from "@/lib/availability-utils";
import type { ScheduleAppointment, ScheduleAppointmentStatus } from "@/hooks/useTherapistSchedule";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CHIP_CLASSES: Record<ScheduleAppointmentStatus, string> = {
  confirmed: "bg-[#e4efe9] text-secondary border-secondary",
  reschedule_requested: "bg-[#e8eaf6] text-[#5b6ea8] border-[#5b6ea8]",
  decline_requested: "bg-[#f7e4e4] text-[#b0454b] border-[#b0454b]",
  completed: "bg-[#eeece6] text-[#8b8f87] border-[#8b8f87]",
};

interface MonthCell {
  date: string;
  dayNum: number;
  isCurrentMonth: boolean;
}

function dateKeyStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getDaysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function getFirstDayOfMonth(y: number, m: number): number {
  const day = new Date(y, m, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getMonthWeeks(
  year: number,
  month: number
): MonthCell[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weeks: MonthCell[][] = [];
  let current: MonthCell[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrev = getDaysInMonth(prevYear, prevMonth);

  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrev - firstDay + 1 + i;
    current.push({
      date: dateKeyStr(prevYear, prevMonth, d),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    current.push({
      date: dateKeyStr(year, month, day),
      dayNum: day,
      isCurrentMonth: true,
    });
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    let nextDay = 1;
    while (current.length < 7) {
      const nm = month === 11 ? 0 : month + 1;
      const ny = month === 11 ? year + 1 : year;
      current.push({
        date: dateKeyStr(ny, nm, nextDay),
        dayNum: nextDay,
        isCurrentMonth: false,
      });
      nextDay++;
    }
    weeks.push(current);
  }

  return weeks;
}

interface MonthlyViewProps {
  year: number;
  month: number;
  appointments: ScheduleAppointment[];
  onSelectAppointment: (appointment: ScheduleAppointment, e: React.MouseEvent) => void;
  onShowMore: (appointments: ScheduleAppointment[], anchorRect: DOMRect) => void;
}

export function MonthlyView({
  year,
  month,
  appointments,
  onSelectAppointment,
  onShowMore,
}: MonthlyViewProps) {
  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month]);
  const todayStr = dateKeyStr(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  const apptMap = useMemo(() => {
    const map: Record<string, ScheduleAppointment[]> = {};
    for (const a of appointments) {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    }
    for (const key of Object.keys(map)) {
      map[key].sort(
        (a, b) =>
          (b.requestPending ? 1 : 0) - (a.requestPending ? 1 : 0) ||
          a.time.localeCompare(b.time)
      );
    }
    return map;
  }, [appointments]);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white min-w-[780px]">
      <div className="grid grid-cols-7 border-b border-border">
        {DOW.map((d) => (
          <div
            key={d}
            className="p-2.5 text-center border-r border-border last:border-r-0"
          >
            <div className="text-xs font-semibold text-text-light">{d}</div>
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div
          key={wi}
          className="grid grid-cols-7 border-b border-border last:border-b-0"
        >
          {week.map((day, di) => {
            const dayAppts = apptMap[day.date] ?? [];
            const isToday = day.date === todayStr;
            const past = isDateInPast(day.date);
            const shown = dayAppts.slice(0, 3);
            const rest = dayAppts.slice(3);

            return (
              <div
                key={di}
                className={`border-r border-border last:border-r-0 p-1.5 min-h-[88px] ${
                  !day.isCurrentMonth ? "bg-[#fafafa]" : ""
                } ${isToday ? "bg-primary/[0.03]" : ""} ${
                  past && day.isCurrentMonth ? "bg-[#f1efe7]" : ""
                }`}
              >
                <div
                  className={`text-[11px] font-semibold mb-1 text-center ${
                    !day.isCurrentMonth
                      ? "text-text-muted"
                      : isToday
                        ? "text-primary"
                        : "text-text"
                  }`}
                >
                  {isToday ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px]">
                      {day.dayNum}
                    </span>
                  ) : (
                    day.dayNum
                  )}
                </div>
                {day.isCurrentMonth && (
                  <div className="space-y-0.5">
                    {shown.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => onSelectAppointment(apt, e)}
                        className={`text-[11px] px-1.5 py-1 rounded cursor-pointer border-l-3 transition-all hover:shadow-sm leading-tight ${
                          past ? "opacity-60" : ""
                        } ${CHIP_CLASSES[apt.status]}`}
                      >
                        <p className="font-semibold truncate">
                          {apt.patient.split(" ")[0]}
                        </p>
                        <p className="opacity-70">{apt.time.slice(0, 5)}</p>
                      </div>
                    ))}
                    {rest.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = (
                            e.target as HTMLElement
                          ).getBoundingClientRect();
                          onShowMore(rest, rect);
                        }}
                        className="w-full text-[10px] font-bold text-secondary bg-[#eef2ee] rounded px-1.5 py-1 cursor-pointer border border-dashed border-[#c7d3cb] hover:bg-[#e2e8e0] transition-colors"
                      >
                        +{rest.length} more
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
