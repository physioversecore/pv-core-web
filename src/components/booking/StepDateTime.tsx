"use client";

import { useMemo } from "react";
import { Loader2, CalendarDays } from "lucide-react";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { getTherapistSlots } from "@/services/api/therapists";
import type { TimeSlot } from "./types";

interface Props {
  therapistId?: string;
  selectedDate: string;
  selectedTime: string;
  slots: TimeSlot[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onContinue: () => void;
}

function to12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${mStr} ${suffix}`;
}

export function StepDateTime({
  therapistId,
  selectedDate,
  selectedTime,
  slots,
  onDateChange,
  onTimeChange,
  onContinue,
}: Props) {
  const { data: fetched, isLoading, isFetching } = useQuery({
    queryKey: ["booking-slots", therapistId, selectedDate],
    queryFn: async () => {
      if (!therapistId || !selectedDate) return { slots: [] };
      const res = await getTherapistSlots(therapistId, selectedDate, selectedDate);
      return res;
    },
    enabled: !!therapistId && !!selectedDate,
    staleTime: 15_000,
  });

  const realSlots: TimeSlot[] = useMemo(() => {
    if (!selectedDate || !therapistId) return [];
    const daySlots = (fetched?.slots ?? []).filter((s) => s.date === selectedDate);
    return daySlots.map((s) => ({
      time: s.time,
      booked: s.status === "booked" || s.status === "off",
    }));
  }, [fetched, selectedDate, therapistId]);

  const effectiveSlots: TimeSlot[] =
    therapistId && selectedDate ? realSlots : slots;

  const isValid = !!selectedDate && !!selectedTime;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-[#1E2A2E]">Select date</label>
        <div className="mt-1.5">
          <DatePicker
            value={selectedDate}
            onChange={onDateChange}
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-[#1E2A2E]">Available time slots</label>
          {(isLoading || isFetching) && therapistId && selectedDate && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" /> Loading slots...
            </span>
          )}
        </div>

        {therapistId && selectedDate ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {effectiveSlots.length === 0 && !isLoading ? (
              <div className="col-span-3 flex items-center justify-center gap-2 py-6 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                <CalendarDays size={16} />
                No available slots on this date
              </div>
            ) : (
              effectiveSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.booked}
                  onClick={() => onTimeChange(slot.time)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-medium border transition-all",
                    slot.booked && "bg-gray-100 text-gray-400 line-through cursor-not-allowed",
                    !slot.booked && selectedTime === slot.time && "border-[#1F3D2B] bg-[#1F3D2B]/10 text-[#1F3D2B]",
                    !slot.booked && selectedTime !== slot.time && "border-gray-200 bg-white text-[#1E2A2E] hover:border-[#1F3D2B]"
                  )}
                >
                  {to12h(slot.time)}
                </button>
              ))
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">
            Choose a date to see available time slots.
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">Greyed slots are already booked.</p>
      </div>

      <button
        disabled={!isValid}
        onClick={onContinue}
        className={cn(
          "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
          isValid
            ? "bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        Continue
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}
