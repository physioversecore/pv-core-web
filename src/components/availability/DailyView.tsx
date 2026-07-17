"use client";

import { useState } from "react";
import { Lock, Unlock, Eye, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { to12h } from "@/lib/format";
import { isSlotInPast, sessionEndTime } from "@/lib/availability-utils";
import type { SlotInfo } from "@/lib/availability-utils";
import { ConfirmModal } from "./ConfirmModal";

interface DailyViewProps {
  date: string;
  slots: SlotInfo[];
  isBlocked: boolean;
  sessionDuration: number;
  onToggleSlot: (data: {
    date: string;
    time: string;
    currentStatus: string;
  }) => Promise<void>;
  onUnblock: (data: { date: string; time?: string }) => Promise<void>;
  onBlockDay: (data: {
    dateFrom: string;
    dateTo?: string;
    daysOfWeek: string[];
    partsOfDay: string[];
    reason: string;
    notify: boolean;
  }) => Promise<{
    blocked: number;
    cancelledCount: number;
    affectedPatients: { name: string; date: string; time: string }[];
  }>;
  isToggling: boolean;
  isUnblocking: boolean;
  isBlocking: boolean;
}

export function DailyView({
  date,
  slots,
  isBlocked,
  sessionDuration,
  onToggleSlot,
  onUnblock,
  onBlockDay,
  isToggling,
  isUnblocking,
  isBlocking,
}: DailyViewProps) {
  const [infoSlot, setInfoSlot] = useState<SlotInfo | null>(null);
  const [blockDayConfirm, setBlockDayConfirm] = useState(false);
  const [pendingResult, setPendingResult] = useState<{
    affectedPatients: { name: string; date: string; time: string }[];
    cancelledCount: number;
  } | null>(null);

  const handleBlockDay = async () => {
    const result = await onBlockDay({
      dateFrom: date,
      daysOfWeek: [],
      partsOfDay: [],
      reason: "Emergency block",
      notify: false,
    });
    if (result.cancelledCount > 0) {
      setPendingResult({
        affectedPatients: result.affectedPatients,
        cancelledCount: result.cancelledCount,
      });
      setBlockDayConfirm(true);
    }
  };

  if (isBlocked) {
    return (
      <div className="proto-daily-banner">
        <span>This day is blocked</span>
        <button
          onClick={() => onUnblock({ date })}
          disabled={isUnblocking}
        >
          {isUnblocking ? "Unblocking..." : "Unblock day"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="proto-daily-emergency">
        <button
          className="proto-cta block"
          onClick={handleBlockDay}
          disabled={isBlocking}
        >
          {isBlocking ? "Blocking..." : "Block entire day"}
        </button>
      </div>

      <div className="proto-daily-list">
        {slots.length === 0 ? (
          <div className="proto-daily-row">
            <span className="proto-daily-status">
              No slots configured for this day.
            </span>
          </div>
        ) : (
          slots.map((slot) => {
            const past = isSlotInPast(slot.date, slot.time);
            return (
              <div
                key={`${slot.date}_${slot.time}`}
                className="proto-daily-row"
              >
                <span className="proto-daily-time">
                  {to12h(slot.time)} – {to12h(sessionEndTime(slot.time, sessionDuration))}
                </span>

                <span className="proto-daily-status">
                  {slot.status === "booked" ? (
                    <>
                      <span className="proto-badge booked">Booked</span>
                      {slot.patientName && (
                        <strong style={{ marginLeft: "6px" }}>
                          {slot.patientName}
                        </strong>
                      )}
                    </>
                  ) : slot.status === "open" ? (
                    <span className="proto-badge open">Open</span>
                  ) : past ? (
                    <span className="proto-badge off">Past</span>
                  ) : (
                    <span className="proto-badge off">Off</span>
                  )}
                </span>

                {slot.status === "booked" ? (
                  <button
                    className="proto-rowbtn"
                    onClick={() => setInfoSlot(slot)}
                  >
                    View
                  </button>
                ) : slot.status === "open" && !isBlocked ? (
                  <button
                    className="proto-rowbtn"
                    disabled={isToggling || past}
                    onClick={() =>
                      onToggleSlot({
                        date: slot.date,
                        time: slot.time,
                        currentStatus: slot.status,
                      })
                    }
                  >
                    Block
                  </button>
                ) : slot.status === "off" && !isBlocked && !past ? (
                  <button
                    className="proto-rowbtn"
                    disabled={isToggling}
                    onClick={() =>
                      onToggleSlot({
                        date: slot.date,
                        time: slot.time,
                        currentStatus: slot.status,
                      })
                    }
                  >
                    Reopen
                  </button>
                ) : null}
              </div>
            );
          })
        )}
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

      <ConfirmModal
        open={blockDayConfirm}
        onOpenChange={setBlockDayConfirm}
        title="Block day?"
        description={`This will cancel ${pendingResult?.cancelledCount ?? 0} booking(s).`}
        confirmLabel="Confirm block"
        onConfirm={() => {
          setBlockDayConfirm(false);
          setPendingResult(null);
        }}
        affectedPatients={pendingResult?.affectedPatients}
      />
    </>
  );
}
