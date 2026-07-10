"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/utils/cn";
import type { TimeSlot } from "./types";

interface Props {
  selectedDate: string;
  selectedTime: string;
  slots: TimeSlot[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onContinue: () => void;
}

export function StepDateTime({ selectedDate, selectedTime, slots, onDateChange, onTimeChange, onContinue }: Props) {
  const isValid = !!selectedDate && !!selectedTime;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-[#1E2A2E]">Select date</label>
        <div className="relative mt-1.5">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#1E2A2E]">Available time slots</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              disabled={slot.booked}
              onClick={() => onTimeChange(slot.time)}
              className={cn(
                "py-2.5 rounded-xl text-sm font-medium border transition-all",
                slot.booked && "bg-gray-100 text-gray-400 line-through cursor-not-allowed",
                !slot.booked && selectedTime === slot.time && "border-[#1F3D2B] bg-[#1F3D2B]/10 text-[#1F3D2B]",
                !slot.booked && selectedTime !== slot.time && "border-gray-200 bg-white text-[#1E2A2E] hover:border-[#1F3D2B]"
              )}
            >
              {slot.time}
            </button>
          ))}
        </div>
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
