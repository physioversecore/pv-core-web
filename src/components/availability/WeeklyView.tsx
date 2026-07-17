"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { to12h } from "@/lib/format";
import { isSlotInPast, dateKeyStr, sessionEndTime } from "@/lib/availability-utils";
import type { SlotInfo } from "@/lib/availability-utils";
import { ConfirmModal } from "./ConfirmModal";

interface WeeklyViewProps {
  dateFrom: string;
  slotsByDate: Record<string, SlotInfo[]>;
  blockedDates: Set<string>;
  sessionDuration: number;
  onToggleSlot: (data: {
    date: string;
    time: string;
    currentStatus: string;
  }) => Promise<void>;
  isToggling: boolean;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function getWeekDays(dateFrom: string): { date: string; label: string; dayNum: number }[] {
  const start = new Date(dateFrom + "T00:00:00");
  const days: { date: string; label: string; dayNum: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push({
      date: dateKeyStr(d.getFullYear(), d.getMonth(), d.getDate()),
      label: DAY_LABELS[d.getDay()],
      dayNum: d.getDate(),
    });
  }
  return days;
}

export function WeeklyView({
  dateFrom,
  slotsByDate,
  blockedDates,
  sessionDuration,
  onToggleSlot,
  isToggling,
}: WeeklyViewProps) {
  const [infoSlot, setInfoSlot] = useState<SlotInfo | null>(null);
  const weekDays = useMemo(() => getWeekDays(dateFrom), [dateFrom]);

  const allTimes = useMemo(() => {
    const times = new Set<string>();
    for (const { date } of weekDays) {
      for (const s of slotsByDate[date] ?? []) {
        times.add(s.time);
      }
    }
    return Array.from(times).sort();
  }, [slotsByDate, weekDays]);

  const getSlot = (date: string, time: string): SlotInfo | undefined => {
    return (slotsByDate[date] ?? []).find((s) => s.time === time);
  };

  return (
    <div className="card-proto">
      <div className="proto-weekgrid">
        {/* Header row */}
        <div className="proto-wk-head"></div>
        {weekDays.map((d) => (
          <div key={d.date} className="proto-wk-head">
            {d.label}
            <span className="proto-wk-n">{d.dayNum}</span>
          </div>
        ))}

        {/* Time rows */}
        {allTimes.map((time) => (
          <div key={time} className="contents">
            <div className="proto-wk-time">{to12h(time)}</div>
            {weekDays.map((d) => {
              const slot = getSlot(d.date, time);
              const blocked = blockedDates.has(d.date);
              const past = isSlotInPast(d.date, time);

              if (blocked) {
                return (
                  <div key={`${d.date}_${time}`} className="proto-wk-cell off">
                    <Lock size={10} className="text-danger" />
                  </div>
                );
              }

              if (!slot) {
                return (
                  <div key={`${d.date}_${time}`} className="proto-wk-cell off"></div>
                );
              }

              const cls = past
                ? "past"
                : slot.status === "booked"
                  ? "booked"
                  : slot.status === "open"
                    ? "open"
                    : "off";

              const label =
                slot.status === "booked"
                  ? slot.patientName || "B"
                  : slot.status === "open"
                    ? `${to12h(slot.time)}`
                    : "";

              return (
                <button
                  key={`${d.date}_${time}`}
                  className={`proto-wk-cell ${cls}`}
                  disabled={isToggling || past || slot.status === "booked"}
                  onClick={() => {
                    if (slot.status === "booked") {
                      setInfoSlot(slot);
                    } else if (!past) {
                      onToggleSlot({
                        date: slot.date,
                        time: slot.time,
                        currentStatus: slot.status,
                      });
                    }
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!infoSlot}
        onOpenChange={(o) => !o && setInfoSlot(null)}
        title="Booking details"
        readOnly
        affectedPatients={
          infoSlot?.patientName
            ? [
                {
                  name: infoSlot.patientName,
                  date: infoSlot.date,
                  time: infoSlot.time,
                },
              ]
            : undefined
        }
      />
    </div>
  );
}
