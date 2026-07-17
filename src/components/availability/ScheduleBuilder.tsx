"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/utils/cn";
import { to12h } from "@/lib/format";
import { generateSessionBlocks, type SessionBreakConfig, type DayPart, DAY_PART_RANGES } from "@/lib/availability-utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const TIME_OPTIONS = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    opts.push(`${String(h).padStart(2, "0")}:00`);
  }
  return opts;
})();

const SESSION_DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hr" },
  { value: 90, label: "1.5 hr" },
  { value: 120, label: "2 hr" },
  { value: 150, label: "2.5 hr" },
  { value: 180, label: "3 hr" },
  { value: 240, label: "4 hr" },
];

const BREAK_DURATION_OPTIONS = [
  { value: 0, label: "No break" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hr" },
  { value: 90, label: "1.5 hr" },
  { value: 120, label: "2 hr" },
];

const DAY_PARTS: { key: DayPart; label: string; range: string }[] = [
  { key: "morning", label: "Morning", range: "6:00–12:00" },
  { key: "afternoon", label: "Afternoon", range: "12:00–17:00" },
  { key: "evening", label: "Evening", range: "17:00–22:00" },
];

const ALL_PARTS: DayPart[] = ["morning", "afternoon", "evening"];

type Mode = "avail" | "block";

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function getMonthEnd(year: number, month: number): string {
  const d = new Date(year, month + 1, 0);
  return toDateStr(d);
}

interface ScheduleBuilderProps {
  workingDays: Set<number>;
  availability: Record<string, { status: string; patientName?: string }>;
  onApply: (config: SessionBreakConfig, days: number[]) => void;
  onBlock: (dateRange: { from: string; to: string }, daysOfWeek: number[], parts: DayPart[], reason: string, notifyAffected: boolean) => void;
  onBlockedDatesChange?: (dateRange: { from: string; to: string }, daysOfWeek: number[]) => void;
}

export function ScheduleBuilder({
  workingDays,
  availability,
  onApply,
  onBlock,
  onBlockedDatesChange,
}: ScheduleBuilderProps) {
  const [mode, setMode] = useState<Mode>("avail");

  // Availability mode state
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [sessionDuration, setSessionDuration] = useState(120);
  const [breakDuration, setBreakDuration] = useState(30);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(() => new Set([1, 2, 3, 4, 5]));

  // Block mode state
  const [blockDays, setBlockDays] = useState<Set<number>>(new Set());
  const [selectedParts, setSelectedParts] = useState<Set<DayPart>>(new Set());
  const [reason, setReason] = useState("");
  const [notifyAffected, setNotifyAffected] = useState(true);

  // Shared state
  const today = useMemo(() => new Date(), []);
  const [rangeFrom, setRangeFrom] = useState(() => toDateStr(today));
  const [rangeTo, setRangeTo] = useState(() => toDateStr(addDays(today, 28)));
  const [activePreset, setActivePreset] = useState<string | null>("4w");

  const config: SessionBreakConfig = useMemo(
    () => ({ sessionDuration, breakDuration, startTime, endTime }),
    [sessionDuration, breakDuration, startTime, endTime]
  );

  const sessionBlocks = useMemo(() => {
    const blocks = generateSessionBlocks(config);
    return blocks.filter((b) => b.type === "session");
  }, [config]);

  const breakLabel = useMemo(() => {
    const opt = BREAK_DURATION_OPTIONS.find((o) => o.value === breakDuration);
    return breakDuration > 0 ? `${opt?.label ?? ""} break between` : "no break";
  }, [breakDuration]);

  // Count booked sessions in the block range
  const bookedInRange = useMemo(() => {
    if (mode !== "block") return { count: 0, patients: [] as { name: string; slot: string }[] };
    const from = rangeFrom;
    const to = rangeTo || "2099-12-31";
    let count = 0;
    const patients: { name: string; slot: string }[] = [];
    const activeBlockDays = blockDays.size > 0 ? blockDays : workingDays;

    for (const [key, slot] of Object.entries(availability)) {
      const [dateStr] = key.split("_");
      if (dateStr < from || dateStr > to) continue;
      if (slot.status !== "booked") continue;
      const d = new Date(dateStr + "T00:00:00");
      const dow = d.getDay();
      if (!activeBlockDays.has(dow)) continue;
      count++;
      if (slot.patientName) {
        patients.push({ name: slot.patientName, slot: key });
      }
    }
    return { count, patients };
  }, [mode, rangeFrom, rangeTo, blockDays, workingDays, availability]);

  const applyPreset = useCallback(
    (preset: string) => {
      setActivePreset(preset);
      const t = toDateStr(today);
      if (preset === "today") {
        setRangeFrom(t);
        setRangeTo(t);
      } else if (preset === "4w") {
        setRangeFrom(t);
        setRangeTo(toDateStr(addDays(today, 28)));
      } else if (preset === "month") {
        setRangeFrom(t);
        setRangeTo(getMonthEnd(today.getFullYear(), today.getMonth()));
      } else if (preset === "ongoing") {
        setRangeFrom(t);
        setRangeTo("");
      }
    },
    [today]
  );

  const handleApply = useCallback(() => {
    if (mode === "avail") {
      onApply(config, [...selectedDays]);
    } else {
      const activeBlockDays = blockDays.size > 0 ? blockDays : workingDays;
      const parts: DayPart[] = selectedParts.size > 0 ? [...selectedParts] : [...ALL_PARTS];
      onBlock(
        { from: rangeFrom, to: rangeTo },
        [...activeBlockDays],
        parts,
        reason || "Time off",
        notifyAffected
      );
    }
  }, [mode, config, selectedDays, blockDays, workingDays, rangeFrom, rangeTo, selectedParts, reason, notifyAffected, onApply, onBlock]);

  const toggleDow = useCallback(
    (day: number) => {
      if (mode === "avail") {
        setSelectedDays((prev) => {
          const n = new Set(prev);
          n.has(day) ? n.delete(day) : n.add(day);
          return n;
        });
      } else {
        setBlockDays((prev) => {
          const n = new Set(prev);
          n.has(day) ? n.delete(day) : n.add(day);
          return n;
        });
      }
    },
    [mode]
  );

  const togglePart = useCallback((part: DayPart) => {
    setSelectedParts((prev) => {
      const n = new Set(prev);
      n.has(part) ? n.delete(part) : n.add(part);
      return n;
    });
  }, []);

  const activeDowSet = mode === "avail" ? selectedDays : blockDays;

  return (
    <div className="card-soft p-5 sm:p-6 mb-6">
      <p className="eyebrow mb-4">Schedule builder</p>

      {/* Mode switch */}
      <div className="inline-flex bg-background border border-border rounded-full p-[3px] mb-4">
        <button
          onClick={() => setMode("avail")}
          className={cn(
            "px-[18px] py-2 rounded-full text-[13px] font-semibold border-none cursor-pointer transition-all duration-150",
            mode === "avail"
              ? "bg-secondary text-white"
              : "bg-transparent text-text-light"
          )}
        >
          Set availability
        </button>
        <button
          onClick={() => setMode("block")}
          className={cn(
            "px-[18px] py-2 rounded-full text-[13px] font-semibold border-none cursor-pointer transition-all duration-150",
            mode === "block"
              ? "bg-danger text-white"
              : "bg-transparent text-text-light"
          )}
        >
          Block time off
        </button>
      </div>

      {/* Availability fields */}
      {mode === "avail" && (
        <div className="flex gap-[22px] flex-wrap mb-4">
          <div className="flex flex-col gap-1.5 min-w-[130px]">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold">Start time</label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-2.5 py-[9px] border border-border rounded-lg text-[13.5px] bg-white text-text"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={`s-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[130px]">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold">End time</label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-2.5 py-[9px] border border-border rounded-lg text-[13.5px] bg-white text-text"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={`e-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[130px]">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold">Session duration</label>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(+e.target.value)}
              className="px-2.5 py-[9px] border border-border rounded-lg text-[13.5px] bg-white text-text"
            >
              {SESSION_DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[130px]">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold">Break between sessions</label>
            <select
              value={breakDuration}
              onChange={(e) => setBreakDuration(+e.target.value)}
              className="px-2.5 py-[9px] border border-border rounded-lg text-[13.5px] bg-white text-text"
            >
              {BREAK_DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Date range (shared) */}
      <div className="mb-4">
        <label className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold">Applies to</label>
        <div className="flex items-center gap-2 mt-1.5">
          <input
            type="date"
            value={rangeFrom}
            onChange={(e) => { setRangeFrom(e.target.value); setActivePreset(null); }}
            className="px-2.5 py-[9px] border border-border rounded-lg text-[13.5px] bg-white text-text"
          />
          <span className="text-text-light text-[13px]">to</span>
          <input
            type="date"
            value={rangeTo}
            onChange={(e) => { setRangeTo(e.target.value); setActivePreset(null); }}
            className="px-2.5 py-[9px] border border-border rounded-lg text-[13.5px] bg-white text-text"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap mt-1.5">
          {[
            { key: "today", label: "Today" },
            { key: "4w", label: "Next 4 weeks" },
            { key: "month", label: "This month" },
            { key: "ongoing", label: "Ongoing (no end date)" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={cn(
                "border rounded-full px-[11px] py-[5px] text-xs cursor-pointer transition-all duration-150",
                activePreset === p.key
                  ? "bg-secondary border-secondary text-white"
                  : "bg-white border-border text-text-light"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days of week */}
      <div className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold mb-2">
        {mode === "avail" ? "Days of week" : "Days of week to block"}
      </div>
      <div className="flex gap-2 flex-wrap">
        {DAYS.map((day, i) => {
          const isWorkingDay = workingDays.has(i);
          const isSelected = activeDowSet.has(i);
          const isDisabled = mode === "block" && !isWorkingDay;

          return (
            <button
              key={`dow-${day}`}
              onClick={() => !isDisabled && toggleDow(i)}
              disabled={isDisabled}
              title={isDisabled ? "Not a working day — nothing to block" : ""}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-semibold border cursor-pointer transition-all duration-150",
                isSelected && mode === "avail" && "bg-gold border-gold text-gold-dark",
                isSelected && mode === "block" && "bg-danger border-danger text-white",
                !isSelected && !isDisabled && "bg-white border-border text-text-light hover:border-secondary hover:text-secondary",
                isDisabled && "bg-white border-border text-text-light opacity-40 cursor-not-allowed"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-text-light mt-1.5">
        {mode === "avail"
          ? "These are your working days — any day left unselected is automatically your day off."
          : "Pick which of your working days to block for this range. Days you don't work are already off."}
      </div>

      {/* Part-of-day pills (block mode only) */}
      {mode === "block" && (
        <div className="mt-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold mb-2">
            Part of day
          </div>
          <div className="flex gap-2 flex-wrap">
            {DAY_PARTS.map((part) => {
              const isSelected = selectedParts.has(part.key);
              const displayLabel = `${part.label} · ${part.range}`;

              return (
                <button
                  key={part.key}
                  onClick={() => togglePart(part.key)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[13px] font-semibold border cursor-pointer transition-all duration-150",
                    isSelected
                      ? "bg-danger border-danger text-white"
                      : "bg-white border-border text-text-light"
                  )}
                >
                  {displayLabel}
                </button>
              );
            })}
            <button
              onClick={() => setSelectedParts(new Set())}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-semibold border cursor-pointer transition-all duration-150",
                selectedParts.size === 0
                  ? "bg-danger border-danger text-white"
                  : "bg-white border-border text-text-light"
              )}
            >
              Full day
            </button>
          </div>
        </div>
      )}

      {/* Session preview (avail mode only) */}
      {mode === "avail" && sessionBlocks.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold mb-2">
            Session preview
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {sessionBlocks.map((block, i) => (
              <div
                key={i}
                className="bg-slot-open text-slot-open-text rounded-lg px-[18px] py-3 text-[13.5px] font-semibold flex-1 min-w-[150px] text-center"
              >
                {to12h(block.startTime)} – {to12h(block.endTime)}
              </div>
            ))}
          </div>
          <div className="text-xs text-text-light mt-1.5">
            {sessionBlocks.length} session(s) · {breakLabel}
          </div>
        </div>
      )}

      {/* Block mode extras */}
      {mode === "block" && (
        <div className="mt-1.5">
          <div className="mb-4">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light font-semibold block mb-1.5">
              Reason (shown to affected patients)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Personal emergency, clinic closed"
              className="w-full max-w-[480px] px-3 py-[9px] border border-border rounded-lg text-[13.5px]"
            />
          </div>

          {bookedInRange.count > 0 && (
            <div className="bg-warn-bg text-warn-ink border border-warn-border rounded-[10px] px-3.5 py-3 text-[13px] flex justify-between items-center gap-3.5 flex-wrap mb-1">
              <span>
                ⚠ {bookedInRange.count} booked session(s) fall in this range and will be cancelled.
              </span>
              <label className="flex items-center gap-1.5 text-[12.5px] whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyAffected}
                  onChange={(e) => setNotifyAffected(e.target.checked)}
                />
                Notify affected patients
              </label>
            </div>
          )}
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={handleApply}
        className={cn(
          "mt-2 px-[22px] py-3 rounded-[9px] text-sm font-bold cursor-pointer text-white border-none",
          mode === "avail" ? "bg-gold text-gold-dark" : "bg-danger"
        )}
      >
        {mode === "avail" ? "Generate & Apply" : "Block selected time"}
      </button>
    </div>
  );
}
