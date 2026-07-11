"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { cn } from "@/utils/cn";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const HOURS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"] as const;
const TIME_PILLS = ["Morning", "Afternoon", "Evening"] as const;
const TIME_ROWS: Record<string, number[]> = {
  Morning: [0, 1],
  Afternoon: [2, 3],
  Evening: [4, 5],
};

type SlotState = "open" | "booked" | "off";

function nextState(current: SlotState): SlotState {
  if (current === "open") return "booked";
  if (current === "booked") return "off";
  return "open";
}

function createInitialGrid(): SlotState[][] {
  return HOURS.map(() => DAYS.map(() => "open" as SlotState));
}

export default function ManageAvailability() {
  const { t } = useLang();
  const [grid, setGrid] = useState<SlotState[][]>(createInitialGrid);
  const [flashingCols, setFlashingCols] = useState<Set<number>>(new Set());
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());
  const [blockDate, setBlockDate] = useState("");

  const toggleCell = useCallback((row: number, col: number) => {
    setGrid((prev) =>
      prev.map((r, ri) =>
        ri === row ? r.map((s, ci) => (ci === col ? nextState(s) : s)) : r
      )
    );
  }, []);

  const blockWholeDay = useCallback(
    (col: number) => {
      setGrid((prev) => prev.map((r) => r.map((s, ci) => (ci === col ? "off" : s))));
      setFlashingCols(new Set([col]));
      setTimeout(() => setFlashingCols(new Set()), 400);
      toast.success(`${FULL_DAYS[col]} marked as off`);
    },
    []
  );

  const toggleDayPill = (idx: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleTimePill = (label: string) => {
    setSelectedTimes((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const saveRecurring = () => {
    if (selectedDays.size === 0 || selectedTimes.size === 0) {
      toast.error("Select at least one day and one time slot");
      return;
    }
    const dayNames = [...selectedDays].map((i) => DAYS[i]).join(", ");
    const timeNames = [...selectedTimes].join(", ");
    toast.success(`Recurring availability saved: ${dayNames} — ${timeNames}`);
  };

  const handleBlockDate = () => {
    const hasDays = selectedDays.size > 0;
    const hasTimes = selectedTimes.size > 0;
    const hasDate = blockDate !== "";

    if (!hasDays && !hasTimes && !hasDate) {
      toast.error("Select a day, time slot, or pick a date to block");
      return;
    }

    const targetRows = new Set<number>();
    const targetCols = new Set<number>();

    if (hasTimes) {
      for (const tp of selectedTimes) {
        for (const r of TIME_ROWS[tp]) targetRows.add(r);
      }
    } else {
      for (let r = 0; r < HOURS.length; r++) targetRows.add(r);
    }

    if (hasDays) {
      for (const d of selectedDays) targetCols.add(d);
    } else if (hasDate) {
      targetCols.add(new Date(blockDate + "T00:00:00").getDay());
    } else {
      for (let c = 0; c < DAYS.length; c++) targetCols.add(c);
    }

    setGrid((prev) =>
      prev.map((r, ri) =>
        r.map((s, ci) =>
          targetRows.has(ri) && targetCols.has(ci) ? "off" : s
        )
      )
    );

    for (const c of targetCols) {
      setFlashingCols(new Set(targetCols));
      setTimeout(() => setFlashingCols(new Set()), 400);
    }

    if (hasDays) {
      const names = [...selectedDays].map((i) => DAYS[i]).join(", ");
      toast.success(`${names} marked as off`);
      setSelectedDays(new Set());
    } else if (hasTimes) {
      const names = [...selectedTimes].join(", ");
      toast.success(`${names} slots blocked across the week`);
    } else {
      const col = new Date(blockDate + "T00:00:00").getDay();
      toast.success(`${FULL_DAYS[col]} marked as off`);
    }

    setBlockDate("");
  };

  const slotBg = (state: SlotState) => {
    if (state === "booked") return "bg-[#16332A] text-white";
    if (state === "open") return "bg-[#D1E8DF] text-[#1E2A2E]";
    return "bg-[#FBFBF8] border-[1.5px] border-[rgba(30,42,46,.12)] text-[#4A5854]";
  };

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div className="mb-6">
        <p className="eyebrow mb-2">{t("availability.schedule")}</p>
        <h1 className="text-[28px] font-display text-text leading-tight mb-1">
          {t("availability.title")}
        </h1>
        <p className="text-sm text-text-light">{t("availability.instruction")}</p>
      </div>

      {/* ─── WEEKLY GRID CARD ─── */}
      <div className="card-soft p-4 sm:p-6 mb-8 overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Column headers */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-[5px] mb-[5px]">
            <div />
            {DAYS.map((day, ci) => (
              <button
                key={day}
                onClick={() => blockWholeDay(ci)}
                className="py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-text-light hover:text-text transition-colors rounded-lg hover:bg-surface"
              >
                {day}
              </button>
            ))}
          </div>

          {/* Grid rows */}
          {HOURS.map((hour, ri) => (
            <div key={hour} className="grid grid-cols-[64px_repeat(7,1fr)] gap-[5px] mb-[5px]">
              <div className="flex items-start justify-end pr-2 pt-1 font-mono text-[11px] text-text-light">
                {hour}
              </div>
              {DAYS.map((_, ci) => {
                const state = grid[ri][ci];
                const isFlashing = flashingCols.has(ci);
                return (
                  <button
                    key={`${ri}-${ci}`}
                    onClick={() => toggleCell(ri, ci)}
                    className={cn(
                      "h-[52px] rounded-lg transition-all duration-200 active:scale-95 active:opacity-80",
                      slotBg(state),
                      isFlashing && "animate-pulse"
                    )}
                    aria-label={`${DAYS[ci]} ${hour} — ${state}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#16332A]" />
            {t("availability.booked")}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D1E8DF]" />
            {t("availability.open")}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
            <span className="inline-block w-2.5 h-2.5 rounded-full border border-[rgba(30,42,46,.25)] bg-[#FBFBF8]" />
            {t("availability.off")}
          </span>
        </div>
      </div>

      {/* ─── RECURRING AVAILABILITY CARD ─── */}
      <div>
        <p className="eyebrow mb-3">{t("availability.recurringLabel")}</p>
        <div className="card-soft p-5 sm:p-6">
          {/* Day-of-week pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => toggleDayPill(i)}
                className={cn(
                  "px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-150",
                  selectedDays.has(i)
                    ? "bg-secondary text-white"
                    : "bg-white border-[1.5px] border-[rgba(30,42,46,.14)] text-text-light hover:border-secondary hover:text-secondary"
                )}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Time-of-day pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TIME_PILLS.map((label) => (
              <button
                key={label}
                onClick={() => toggleTimePill(label)}
                className={cn(
                  "px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-150",
                  selectedTimes.has(label)
                    ? "bg-secondary text-white"
                    : "bg-white border-[1.5px] border-[rgba(30,42,46,.14)] text-text-light hover:border-secondary hover:text-secondary"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={saveRecurring} className="btn-secondary !py-2 !px-5 text-sm">
              {t("availability.saveRecurring")}
            </button>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-border text-sm font-sans text-text bg-white outline-none focus:border-secondary transition-colors"
              />
              <button onClick={handleBlockDate} className="btn-outline !py-2 !px-5 text-sm">
                {t("availability.blockDate")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
