"use client";

import { useMemo, Fragment } from "react";
import { cn } from "@/utils/cn";
import { to12h } from "@/lib/format";
import { dateKeyStr, isDateInPast, isSlotInPast, type SlotInfo } from "@/lib/availability-utils";
import type { SessionBlock } from "@/lib/availability-utils";
import { Lock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface WeeklyViewProps {
  weekStart: Date;
  sessionBlocks: SessionBlock[];
  availability: Record<string, SlotInfo>;
  blockedDates: Record<string, { parts: string[]; reason: string }>;
  onToggleSlot: (dateKey: string, time: string) => void;
  onShowSlotInfo: (slot: SlotInfo) => void;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function WeeklyView({
  weekStart,
  sessionBlocks,
  availability,
  blockedDates,
  onToggleSlot,
  onShowSlotInfo,
}: WeeklyViewProps) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
      {/* Header row */}
      <div />
      {days.map((d) => {
        const dow = DAYS[d.getDay()];
        const dk = dateKeyStr(d.getFullYear(), d.getMonth(), d.getDate());
        return (
          <div key={dk} className="text-center text-[11px] text-text-light font-semibold pb-1.5">
            {dow}
            <span className="block text-[14px] text-text mt-0.5">{d.getDate()}</span>
          </div>
        );
      })}

      {/* Session block rows */}
      {sessionBlocks.map((block, ri) => (
        <Fragment key={`row-${ri}`}>
          <div className="text-[11px] text-text-light text-right pr-1.5 pt-2.5">
            {to12h(block.startTime)}
          </div>
          {days.map((d, di) => {
            const dk = dateKeyStr(d.getFullYear(), d.getMonth(), d.getDate());
            const blocked = blockedDates[dk];
            const slotKey = `${dk}_${block.startTime}`;
            const slot = availability[slotKey];
            const status: string = slot?.status ?? "off";
            const past = isDateInPast(dk);
            const slotPast = !past && isSlotInPast(dk, block.startTime);
            const readOnly = past || slotPast;
            const isBooked = status === "booked";
            const isOpen = status === "open";

            const cellClass = cn(
              "rounded-lg min-h-[52px] flex items-center justify-center text-[11.5px] font-semibold text-center p-1",
              readOnly && "hatch-past text-text-light cursor-default",
              isBooked && !readOnly && "bg-slot-booked text-white",
              isOpen && !readOnly && "bg-slot-open text-slot-open-text cursor-pointer",
              !readOnly && !isBooked && !isOpen && "bg-slot-off border-[1.5px] border-dashed border-border text-text-light cursor-pointer"
            );

            const handleClick = () => {
              if (readOnly || isBooked || blocked) return;
              onToggleSlot(dk, block.startTime);
            };

            const clickBooked = () => {
              if (isBooked && slot) onShowSlotInfo(slot);
            };

            return (
              <div
                key={`${ri}-${di}`}
                className={cellClass}
                onClick={isBooked ? clickBooked : handleClick}
              >
                {isBooked ? slot?.patientName : ""}
              </div>
            );
          })}
        </Fragment>
      ))}

      {/* Blocked day overlays */}
      {days.map((d, di) => {
        const dk = dateKeyStr(d.getFullYear(), d.getMonth(), d.getDate());
        const blocked = blockedDates[dk];
        if (!blocked) return null;
        const col = di + 2;
        return (
          <div
            key={`blocked-overlay-${dk}`}
            className="hatch-blocked rounded-lg relative flex flex-col items-center justify-center text-danger-ink text-[11px] font-bold text-center p-1.5"
            style={{
              gridColumn: col,
              gridRow: `2 / span ${sessionBlocks.length + 1}`,
            }}
          >
            <Lock className="w-3.5 h-3.5 mb-1" />
            Blocked
            <br />
            <span className="font-normal text-[10px]">{blocked.reason}</span>
          </div>
        );
      })}
    </div>
  );
}
