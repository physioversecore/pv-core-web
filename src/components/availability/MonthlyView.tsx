"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { to12h } from "@/lib/format";
import { isSlotInPast, sessionEndTime, DAY_PART_RANGES } from "@/lib/availability-utils";
import type { SlotInfo, DayPart } from "@/lib/availability-utils";
import { ConfirmModal } from "./ConfirmModal";

interface MonthlyViewProps {
  cursor: string;
  slotsByDate: Record<string, SlotInfo[]>;
  blockedDates: Set<string>;
  blockedPartsByDate: Record<string, DayPart[]>;
  sessionDuration: number;
  onToggleSlot: (data: {
    date: string;
    time: string;
    currentStatus: string;
  }) => Promise<void>;
  isToggling: boolean;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MAX_VISIBLE = 3;

interface MonthDay {
  date: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

function getMonthGrid(cursor: string): MonthDay[] {
  const d = new Date(cursor + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const grid: MonthDay[] = [];

  for (let i = 0; i < startOffset; i++) {
    grid.push({
      date: "",
      dayNum: 0,
      isCurrentMonth: false,
      isToday: false,
      isPast: true,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const md = new Date(year, month, day);
    const isToday =
      md.getFullYear() === today.getFullYear() &&
      md.getMonth() === today.getMonth() &&
      md.getDate() === today.getDate();
    const isPast =
      md < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    grid.push({
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayNum: day,
      isCurrentMonth: true,
      isToday,
      isPast,
    });
  }

  const remaining = 42 - grid.length;
  for (let i = 1; i <= remaining; i++) {
    const nd = new Date(year, month + 1, i);
    grid.push({
      date: `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-${String(nd.getDate()).padStart(2, "0")}`,
      dayNum: nd.getDate(),
      isCurrentMonth: false,
      isToday: false,
      isPast: false,
    });
  }

  return grid;
}

export function MonthlyView({
  cursor,
  slotsByDate,
  blockedDates,
  blockedPartsByDate,
  sessionDuration,
  onToggleSlot,
  isToggling,
}: MonthlyViewProps) {
  const [infoSlot, setInfoSlot] = useState<SlotInfo | null>(null);
  const grid = useMemo(() => getMonthGrid(cursor), [cursor]);

  return (
    <div className="card-proto">
      <div className="proto-monthgrid">
        {DAY_NAMES.map((name) => (
          <div key={name} className="proto-mo-head">
            {name}
          </div>
        ))}

        {grid.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} className="proto-mo-cell pastcell"></div>;
          }

          const daySlots = slotsByDate[cell.date] ?? [];
          const isFullyBlocked = blockedDates.has(cell.date);
          const blockedParts = blockedPartsByDate[cell.date] ?? [];
          const isPartiallyBlocked =
            !isFullyBlocked && blockedParts.length > 0 && blockedParts.length < 3;
          const cellTimeRanges = isPartiallyBlocked
            ? blockedParts.map((p) => DAY_PART_RANGES[p])
            : null;

          let cls = "proto-mo-cell";
          if (cell.isPast) cls += " pastcell";
          if (cell.isToday) cls += " today";
          if (isFullyBlocked) cls += " blockedday";

          const visibleSlots = daySlots.slice(0, MAX_VISIBLE);
          const rest = daySlots.slice(MAX_VISIBLE);

          return (
            <div key={cell.date} className={cls}>
              <div className="proto-mo-num">{cell.dayNum}</div>
              {isFullyBlocked ? (
                <div className="proto-mo-blocklabel">Blocked</div>
              ) : (
                <>
                  {visibleSlots.map((slot) => {
                    const past = isSlotInPast(slot.date, slot.time);
                    const slotBlocked =
                      cellTimeRanges !== null &&
                      cellTimeRanges.some(([start, end]) => {
                        const [h] = slot.time.split(":").map(Number);
                        return h >= start && h < end;
                      });
                    const chipCls =
                      slot.status === "booked"
                        ? "booked"
                        : slot.status === "off" || slotBlocked
                          ? "offslot"
                          : "";

                    return (
                      <button
                        key={`${slot.date}_${slot.time}`}
                        disabled={isToggling || past || slot.status === "booked" || slotBlocked}
                        className={`proto-mo-slot ${chipCls}`}
                        onClick={() => {
                          if (slot.status === "booked") {
                            setInfoSlot(slot);
                          } else if (!past && !slotBlocked) {
                            onToggleSlot({
                              date: slot.date,
                              time: slot.time,
                              currentStatus: slot.status,
                            });
                          }
                        }}
                      >
                        {to12h(slot.time)} – {to12h(sessionEndTime(slot.time, sessionDuration))}
                        {(slot.status === "off" || slotBlocked) && " · off"}
                      </button>
                    );
                  })}
                  {rest.length > 0 && (
                    <div className="proto-mo-more">
                      +{rest.length} more
                      <div className="proto-mo-pop">
                        {rest.map((slot) => {
                          const past = isSlotInPast(slot.date, slot.time);
                          const slotBlocked =
                            cellTimeRanges !== null &&
                            cellTimeRanges.some(([start, end]) => {
                              const [h] = slot.time.split(":").map(Number);
                              return h >= start && h < end;
                            });
                          const chipCls =
                            slot.status === "booked"
                              ? "booked"
                              : slot.status === "off" || slotBlocked
                                ? "offslot"
                                : "";
                          return (
                            <button
                              key={`${slot.date}_${slot.time}`}
                              disabled={isToggling || past || slot.status === "booked" || slotBlocked}
                              className={`proto-mo-slot ${chipCls}`}
                              onClick={() => {
                                if (slot.status === "booked") {
                                  setInfoSlot(slot);
                                } else if (!past && !slotBlocked) {
                                  onToggleSlot({
                                    date: slot.date,
                                    time: slot.time,
                                    currentStatus: slot.status,
                                  });
                                }
                              }}
                            >
                              {to12h(slot.time)} – {to12h(sessionEndTime(slot.time, sessionDuration))}
                              {(slot.status === "off" || slotBlocked) && " · off"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
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
