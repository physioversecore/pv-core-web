"use client";

import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { to12h } from "@/lib/format";
import { dateKeyStr, isDateInPast, isSlotInPast, type SlotInfo } from "@/lib/availability-utils";
import type { SessionBlock } from "@/lib/availability-utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface MonthlyViewProps {
  year: number;
  month: number;
  sessionBlocks: SessionBlock[];
  availability: Record<string, SlotInfo>;
  blockedDates: Record<string, { parts: string[]; reason: string }>;
  onToggleSlot: (dateKey: string, time: string) => void;
  onShowSlotInfo: (slot: SlotInfo) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isTodayStr(dk: string): boolean {
  const n = new Date();
  const today = dateKeyStr(n.getFullYear(), n.getMonth(), n.getDate());
  return dk === today;
}

export function MonthlyView({
  year,
  month,
  sessionBlocks,
  availability,
  blockedDates,
  onToggleSlot,
  onShowSlotInfo,
}: MonthlyViewProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);
  const todayKey = dateKeyStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const cells = useMemo(() => {
    const result: (null | {
      day: number;
      dateKey: string;
      isPast: boolean;
      isToday: boolean;
      isBlocked: boolean;
      slots: { block: SessionBlock; status: string; slot?: SlotInfo }[];
    })[] = [];

    for (let i = 0; i < firstDayOffset; i++) result.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dk = dateKeyStr(year, month, day);
      const isPast = isDateInPast(dk);
      const isToday = dk === todayKey;
      const blocked = blockedDates[dk];
      const daySlots = sessionBlocks.map((block) => {
        const slotKey = `${dk}_${block.startTime}`;
        const slot = availability[slotKey];
        return { block, status: slot?.status ?? "off", slot };
      });
      result.push({ day, dateKey: dk, isPast, isToday, isBlocked: !!blocked, slots: daySlots });
    }

    return result;
  }, [year, month, daysInMonth, firstDayOffset, todayKey, sessionBlocks, availability, blockedDates]);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {/* Day headers */}
      {DAYS.map((d) => (
        <div key={d} className="text-center text-[11px] text-text-light font-semibold pb-1">
          {d}
        </div>
      ))}

      {/* Day cells */}
      {cells.map((cell, idx) => {
        if (!cell) return <div key={`empty-${idx}`} className="min-h-[96px]" />;

        const isHovered = hoveredCell === cell.dateKey;
        const maxVisible = 3;
        const shownSlots = cell.slots.slice(0, maxVisible);
        const restSlots = cell.slots.slice(maxVisible);

        const cellClass = cn(
          "border rounded-lg min-h-[96px] p-1.5 text-[10.5px] relative",
          cell.isPast && "bg-background text-text-light",
          !cell.isPast && "bg-white border-border",
          cell.isToday && !cell.isPast && "border-2 border-gold-dark",
          cell.isBlocked && "hatch-blocked"
        );

        return (
          <div
            key={cell.dateKey}
            className={cellClass}
            onMouseEnter={() => setHoveredCell(cell.dateKey)}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div
              className={cn(
                "text-[11px] font-bold mb-1",
                cell.isToday && !cell.isPast ? "text-gold-dark" : cell.isPast ? "text-text-muted" : "text-text-soft"
              )}
            >
              {cell.day}
            </div>

            {cell.isBlocked ? (
              <div className="text-danger-ink font-bold text-[10.5px] mt-5 text-center">
                Blocked
              </div>
            ) : (
              <>
                {shownSlots.map(({ block, status, slot }, si) => {
                  const stateClass =
                    status === "booked"
                      ? "bg-slot-booked text-white"
                      : status === "off"
                        ? "bg-slot-off text-text-light border border-dashed border-border"
                        : "bg-slot-open text-slot-open-text";

                  const isClickable =
                    !cell.isPast &&
                    (status === "open" || status === "off");

                  const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (status === "booked" && slot) {
                      onShowSlotInfo(slot);
                    } else if (isClickable) {
                      onToggleSlot(cell.dateKey, block.startTime);
                    }
                  };

                  return (
                    <div
                      key={si}
                      className={cn(
                        "rounded-[5px] px-1 py-0.5 mb-[3px] font-semibold cursor-pointer truncate",
                        stateClass,
                        isClickable && "hover:opacity-80"
                      )}
                      onClick={handleClick}
                    >
                      {status === "booked"
                        ? `${to12h(block.startTime)} · ${slot?.patientName}`
                        : `${to12h(block.startTime)}${status === "off" ? " · off" : ""}`}
                    </div>
                  );
                })}

                {restSlots.length > 0 && (
                  <div className="relative">
                    <div
                      className={cn(
                        "rounded-[5px] px-1 py-0.5 font-bold cursor-pointer border border-border bg-background text-text-light",
                        isHovered && "bg-white shadow-md"
                      )}
                    >
                      +{restSlots.length} more
                    </div>
                    {isHovered && (
                      <div className="absolute top-full left-0 z-20 bg-white border border-border rounded-lg shadow-lg p-2 min-w-[150px] mt-1">
                        {restSlots.map(({ block, status, slot }, ri) => {
                          const stateClass =
                            status === "booked"
                              ? "bg-slot-booked text-white"
                              : status === "off"
                                ? "bg-slot-off text-text-light border border-dashed border-border"
                                : "bg-slot-open text-slot-open-text";

                          const isClickable =
                            !cell.isPast &&
                            (status === "open" || status === "off");

                          return (
                            <div
                              key={ri}
                              className={cn(
                                "rounded-[5px] px-1 py-0.5 mb-1 font-semibold cursor-pointer",
                                stateClass
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (status === "booked" && slot) {
                                  onShowSlotInfo(slot);
                                } else if (isClickable) {
                                  onToggleSlot(cell.dateKey, block.startTime);
                                }
                              }}
                            >
                              {status === "booked"
                                ? `${to12h(block.startTime)} · ${slot?.patientName}`
                                : `${to12h(block.startTime)}${status === "off" ? " · off" : ""}`}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
