"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/context/i18n";
import { cn } from "@/utils/cn";
import { getTherapistSlots } from "@/services/api/therapists";
import { npr } from "@/utils/format";

interface BookingWidgetProps {
  therapistId: string;
  price: number;
  onConfirm: (date: string, time: string) => void;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function BookingWidget({ therapistId, price, onConfirm }: BookingWidgetProps) {
  const { t } = useLang();
  const today = new Date();
  const todayStr = toDateStr(today);

  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const last = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const fromStr = toDateStr(first);
  const toStr = toDateStr(last);

  const { data: slotData, isLoading } = useQuery({
    queryKey: ["therapist-slots", therapistId, fromStr, toStr],
    queryFn: () => getTherapistSlots(therapistId, fromStr, toStr),
    staleTime: 60_000,
  });

  const monthSlots = slotData?.slots ?? [];

  const openDates = useMemo(() => {
    const set = new Set<string>();
    for (const s of monthSlots) {
      if (s.status === "open") set.add(s.date);
    }
    return set;
  }, [monthSlots]);

  const daysInMonth = last.getDate();
  const startOffset = (first.getDay() + 6) % 7; // Monday-first

  const cells: (Date | null)[] = useMemo(() => {
    const out: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    return out;
  }, [viewDate, startOffset, daysInMonth]);

  const isCurrentMonth = viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth();

  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    return monthSlots
      .filter((s) => s.date === selectedDate)
      .map((s) => {
        if (selectedDate < todayStr) return { time: s.time, status: "past" as const };
        if (selectedDate === todayStr) {
          const [h, m] = s.time.split(":").map(Number);
          const slotTime = new Date();
          slotTime.setHours(h, m, 0, 0);
          if (slotTime <= new Date()) return { time: s.time, status: "past" as const };
        }
        if (s.status === "booked") return { time: s.time, status: "booked" as const };
        if (s.status === "off") return { time: s.time, status: "off" as const };
        return { time: s.time, status: "open" as const };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [monthSlots, selectedDate, todayStr]);

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : t("therapistProfile.selectDate");

  return (
    <div className="card-neo p-6 flex flex-col gap-6">
      <div className="border-b-2 border-carbon-soft pb-4 flex justify-between items-end">
        <h2 className="font-display font-extrabold uppercase tracking-tight text-xl">{t("therapistProfile.bookSession")}</h2>
        <span className="font-mono font-bold uppercase text-xs bg-volt border-2 border-carbon-soft px-2 py-1">{npr(price)}</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-surface border-2 border-carbon-soft p-2">
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            disabled={isCurrentMonth}
            className={cn("p-1 border-2 border-carbon-soft transition-colors", isCurrentMonth ? "opacity-40 cursor-not-allowed" : "hover:bg-volt")}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono font-bold uppercase text-xs tracking-wide">
            {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="p-1 border-2 border-carbon-soft hover:bg-volt transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] font-mono font-bold uppercase text-text-light py-1">{w}</div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const dateStr = toDateStr(date);
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const hasOpen = openDates.has(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <button
                key={i}
                type="button"
                disabled={isPast}
                onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center border-2 border-carbon-soft transition-all relative group",
                  isPast && "bg-surface opacity-40 cursor-not-allowed",
                  !isPast && !isSelected && "bg-paper-bright hover:bg-volt cursor-pointer",
                  isSelected && "bg-volt shadow-[1px_1px_0_var(--color-carbon-soft)] -translate-y-0.5 -translate-x-0.5",
                  isToday && !isSelected && "font-bold",
                )}
              >
                <span className="text-[9px] uppercase">{date.toLocaleDateString("en-US", { weekday: "narrow" })}</span>
                <span className="font-bold text-sm">{date.getDate()}</span>
                {hasOpen && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-moss" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono font-bold uppercase text-xs tracking-wide">{t("therapistProfile.availableTimes")}</span>
          <span className="text-xs text-text-light">{selectedDateLabel}</span>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-surface animate-pulse border-2 border-carbon-soft/10" />
            ))}
          </div>
        ) : daySlots.length === 0 ? (
          <p className="text-xs text-text-light text-center py-4 border-2 border-dashed border-carbon-soft rounded-xl">
            {t("therapistProfile.noSlots")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {daySlots.map((slot) => {
              const isOpen = slot.status === "open";
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!isOpen}
                  onClick={() => isOpen && setSelectedTime(slot.time)}
                  className={cn(
                    "py-2.5 rounded-xl border-2 border-carbon-soft font-mono font-bold uppercase text-xs transition-all",
                    isOpen && isSelected && "bg-volt shadow-[1px_1px_0_var(--color-carbon-soft)]",
                    isOpen && !isSelected && "bg-paper-bright hover:bg-volt",
                    !isOpen && "bg-surface text-text-light/50 border-carbon-soft/20 line-through cursor-not-allowed",
                  )}
                >
                  {to12h(slot.time)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!selectedDate || !selectedTime}
        onClick={() => selectedDate && onConfirm(selectedDate, selectedTime)}
        className={cn(
          "w-full py-4 font-display font-bold uppercase flex items-center justify-center gap-2 border-2 border-carbon-soft transition-all",
          selectedDate && selectedTime
            ? "bg-carbon text-paper-bright hover:bg-olive shadow-[1px_1px_0_var(--color-carbon-soft)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            : "bg-surface text-text-light/50 cursor-not-allowed",
        )}
      >
        {t("therapistProfile.confirm")} →
      </button>

      <p className="text-xs text-center text-text-light font-mono font-bold uppercase tracking-wide">
        {t("therapistProfile.freeCancellation")}
      </p>
    </div>
  );
}
