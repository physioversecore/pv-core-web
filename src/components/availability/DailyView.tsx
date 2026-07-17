"use client";

import { useMemo } from "react";
import { cn } from "@/utils/cn";
import { to12h } from "@/lib/format";
import { isDateInPast, isSlotInPast, type SlotInfo } from "@/lib/availability-utils";
import { Lock } from "lucide-react";

interface SlotWithEnd extends SlotInfo {
  endTime?: string;
}

interface DailyViewProps {
  dateKey: string;
  dateLabel: string;
  slots: SlotWithEnd[];
  blocked: { parts: string[]; reason: string } | null;
  onToggleSlot: (dateKey: string, time: string) => void;
  onBlockDay: (dateKey: string) => void;
  onUnblockDay: (dateKey: string) => void;
  onShowSlotInfo: (slot: SlotInfo) => void;
}

export function DailyView({
  dateKey,
  dateLabel,
  slots,
  blocked,
  onToggleSlot,
  onBlockDay,
  onUnblockDay,
  onShowSlotInfo,
}: DailyViewProps) {
  const isPast = isDateInPast(dateKey);

  return (
    <>
      {blocked ? (
        <div className="flex justify-between items-center bg-danger-bg text-danger-ink rounded-[10px] px-4 py-3 mb-4 text-[13px] font-semibold">
          <span>This day is blocked — {blocked.reason}</span>
          <button
            onClick={() => onUnblockDay(dateKey)}
            className="border border-danger-ink bg-white text-danger-ink rounded-lg px-3 py-[6px] text-xs cursor-pointer font-bold"
          >
            Unblock day
          </button>
        </div>
      ) : (
        <div className="flex justify-end mb-3.5">
          <button
            onClick={() => onBlockDay(dateKey)}
            className="px-5 py-[9px] rounded-[9px] bg-danger text-white text-[13px] font-bold cursor-pointer"
          >
            Block entire day
          </button>
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        {slots.length === 0 ? (
          <div className="flex items-center px-[18px] py-[14px] text-text-light text-[13px]">
            No slots configured for this day.
          </div>
        ) : (
          slots.map((slot) => {
            const isBooked = slot.status === "booked";
            const isOpen = slot.status === "open";
            const isOff = slot.status === "off";
            const slotPast = isSlotInPast(dateKey, slot.time);
            const readOnly = isPast || slotPast;

            const label = slot.endTime
              ? `${to12h(slot.time)} – ${to12h(slot.endTime)}`
              : to12h(slot.time);

            let statusBadge: React.ReactNode;
            if (isBooked) {
              statusBadge = (
                <>
                  <span className="rounded-full px-[11px] py-1 text-[11.5px] font-bold bg-slot-booked text-white">
                    Booked
                  </span>
                  &nbsp;
                  <b className="text-text">{slot.patientName}</b>
                </>
              );
            } else if (isOpen) {
              statusBadge = (
                <span className="rounded-full px-[11px] py-1 text-[11.5px] font-bold bg-slot-open text-slot-open-text">
                  Open
                </span>
              );
            } else if (readOnly) {
              statusBadge = (
                <span className="rounded-full px-[11px] py-1 text-[11.5px] font-bold bg-slot-off border border-border text-text-light">
                  Past
                </span>
              );
            } else {
              statusBadge = (
                <span className="rounded-full px-[11px] py-1 text-[11.5px] font-bold bg-slot-off border border-border text-text-light">
                  Off
                </span>
              );
            }

            let actionButton: React.ReactNode = null;
            if (!readOnly && !blocked) {
              if (isOpen) {
                actionButton = (
                  <button
                    onClick={() => onToggleSlot(dateKey, slot.time)}
                    className="border border-border bg-white rounded-[7px] px-3 py-[6px] text-[12px] cursor-pointer text-text-light font-semibold"
                  >
                    Block
                  </button>
                );
              } else if (isOff) {
                actionButton = (
                  <button
                    onClick={() => onToggleSlot(dateKey, slot.time)}
                    className="border border-border bg-white rounded-[7px] px-3 py-[6px] text-[12px] cursor-pointer text-text-light font-semibold"
                  >
                    Reopen
                  </button>
                );
              }
            }
            if (isBooked) {
              actionButton = (
                <button
                  onClick={() => onShowSlotInfo(slot)}
                  className="border border-border bg-white rounded-[7px] px-3 py-[6px] text-[12px] cursor-pointer text-text-light font-semibold"
                >
                  View
                </button>
              );
            }

            return (
              <div
                key={slot.time}
                className={cn(
                  "flex items-center justify-between px-[18px] py-[14px] border-b border-border last:border-b-0"
                )}
              >
                <span className="text-[13px] font-bold w-[150px]">{label}</span>
                <span className="flex-1 text-[13px] text-text-light">{statusBadge}</span>
                {actionButton}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
