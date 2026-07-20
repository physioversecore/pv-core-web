"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/utils/cn";
import { getTherapistSlots } from "@/services/api/therapists";
import { to12h } from "@/components/modals/BookingModal";

interface RescheduleModalProps {
  therapistId: string;
  therapistName: string;
  sessionId: string;
  currentDate: string;
  currentTime: string;
  onConfirm: (newDate: string, newTime: string) => void;
  onClose: () => void;
  isPending?: boolean;
  error?: string | null;
}

function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function formatDateLabel(iso: string): string {
  if (!iso) return "Pick a date";
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();
  const formatted = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (isToday) return `Today · ${formatted}`;
  if (isTomorrow) return `Tomorrow · ${formatted}`;
  return formatted;
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface TimeSlot {
  time: string;
  status: "open" | "booked" | "off" | "past";
}

export function RescheduleModal({
  therapistId,
  therapistName,
  sessionId,
  currentDate,
  currentTime,
  onConfirm,
  onClose,
  isPending,
  error,
}: RescheduleModalProps) {
  const todayStr = localDateStr();
  const originalDateStr = currentDate?.slice(0, 10) ?? "";

  const [selectedDate, setSelectedDate] = useState(() =>
    originalDateStr >= todayStr ? originalDateStr : todayStr
  );
  const [selectedTime, setSelectedTime] = useState(
    originalDateStr >= todayStr ? currentTime : ""
  );
  const [apiError, setApiError] = useState<string | null>(null);

  const canGoPrev = selectedDate > todayStr;

  const queryDate = selectedDate || todayStr;

  const { data: slotData, isLoading: slotsLoading } = useQuery({
    queryKey: ["therapist-slots", queryDate, therapistId],
    queryFn: () => getTherapistSlots(therapistId, queryDate, queryDate),
    enabled: !!therapistId && !!selectedDate,
  });

  useEffect(() => {
    setApiError(error ?? null);
  }, [error]);

  const timeSlots: TimeSlot[] = (() => {
    if (!slotData?.slots || slotData.slots.length === 0) return [];
    const isToday = selectedDate === todayStr;
    const isPastDate = selectedDate < todayStr;
    const isOriginalDate = selectedDate === originalDateStr;

    return slotData.slots
      .filter((s) => s.date === selectedDate)
      .map((s) => {
        if (isPastDate) return { time: s.time, status: "past" as const };
        if (isToday) {
          const [h, m] = s.time.split(":").map(Number);
          const slotTime = new Date();
          slotTime.setHours(h, m, 0, 0);
          if (slotTime <= new Date()) return { time: s.time, status: "past" as const };
        }
        if (isOriginalDate && s.time === currentTime) {
          return { time: s.time, status: "open" as const };
        }
        if (s.status === "booked") return { time: s.time, status: "booked" as const };
        if (s.status === "off") return { time: s.time, status: "off" as const };
        return { time: s.time, status: "open" as const };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  })();

  const canSubmit = selectedDate && selectedTime && selectedDate === originalDateStr
    ? selectedTime !== currentTime
    : !!selectedDate && !!selectedTime;

  const handlePrevDay = () => {
    if (!canGoPrev) return;
    const prev = shiftDate(selectedDate, -1);
    setSelectedDate(prev);
    setSelectedTime("");
    setApiError(null);
  };

  const handleNextDay = () => {
    const next = shiftDate(selectedDate, 1);
    setSelectedDate(next);
    setSelectedTime("");
    setApiError(null);
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    setApiError(null);
    onConfirm(selectedDate, selectedTime);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#FAF9F5] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-3 top-3 z-10 p-2 rounded-full hover:bg-black/5">
          <X size={18} className="text-gray-500" />
        </button>

        <div className="p-6">
          <h3 className="text-xl font-bold text-[#1E2A2E]">Reschedule session</h3>
          <p className="text-sm text-gray-500 mt-1">
            with {therapistName} · Currently {formatDateLabel(currentDate.slice(0, 10))} at {to12h(currentTime)}
          </p>
          {/* <button onClick={onClose} className="text-sm text-gray-500 hover:text-[#1F3D2B] mt-1 flex items-center gap-1">
            ← Back
          </button> */}

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1E2A2E]">Pick a new date</label>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  disabled={!canGoPrev}
                  className={cn(
                    "w-9 h-9 rounded-lg border bg-white flex items-center justify-center transition-colors shrink-0",
                    canGoPrev ? "border-gray-200 hover:bg-gray-50" : "border-gray-100 opacity-40 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft size={16} className="text-gray-500" />
                </button>
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-[#1E2A2E]">
                  <CalendarDays size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">{formatDateLabel(selectedDate)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleNextDay}
                  className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0"
                >
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-[#1E2A2E]">New time</label>
                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-11 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : timeSlots.length === 0 ? (
                  <p className="text-sm text-gray-400 mt-2">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((slot) => {
                      const isOpen = slot.status === "open";
                      const isBooked = slot.status === "booked";
                      const isOff = slot.status === "off";
                      const isPast = slot.status === "past";
                      const isSelected = selectedTime === slot.time;
                      const endTime = addMinutesToTime(slot.time, 60);

                      return (
                        <button
                          key={slot.time}
                          disabled={!isOpen}
                          onClick={() => isOpen && setSelectedTime(slot.time)}
                          className={cn(
                            "py-2.5 rounded-xl text-sm font-medium border transition-all",
                            isOpen && isSelected && "border-[#2F5D50] bg-[#2F5D50]/10 text-[#2F5D50] ring-1 ring-[#2F5D50]/30",
                            isOpen && !isSelected && "border-[#2F5D50]/30 bg-[#2F5D50]/5 text-[#2F5D50] hover:bg-[#2F5D50]/10 hover:border-[#2F5D50]/50",
                            isBooked && "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed",
                            isOff && "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed",
                            isPast && "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                          )}
                        >
                          <span className="block leading-tight">{to12h(slot.time)}</span>
                          {isOpen && <span className="block text-[10px] font-normal opacity-60">to {to12h(endTime)}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  <span className="text-[#2F5D50]">Green</span> = available · <span className="line-through">Grey</span> = booked · Light grey = off
                </p>
              </div>
            )}

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {apiError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 text-[#1E2A2E] hover:bg-gray-50 transition">
                Keep original
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending || !canSubmit}
                className={cn(
                  "flex-1 py-3 rounded-xl font-semibold transition",
                  canSubmit && !isPending
                    ? "bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rescheduling...
                  </span>
                ) : (
                  "Confirm reschedule"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
