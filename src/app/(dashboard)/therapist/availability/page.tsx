"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { cn } from "@/utils/cn";
import { to12h } from "@/lib/format";
import { ChevronLeft, ChevronRight, CalendarOff, Clock, Ban } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import {
  dateKeyStr,
  isDateInPast,
  isSlotInPast,
  DEFAULT_SLOT_INTERVAL,
  generateSessionBlocks,
  sessionBlockTimes,
  breakBlockTimes,
  blockHourTimes,
  blockDurationMins,
  DAY_PART_RANGES,
  type SlotInfo,
  type SlotStatus,
  type SessionBreakConfig,
  type SessionBlock,
  type DayPart,
} from "@/lib/availability-utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekStart(offset: number): Date {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + offset * 7);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getMonthOffset(offset: number): { year: number; month: number } {
  const now = new Date();
  const month = now.getMonth() + offset;
  const year = now.getFullYear() + Math.floor(month / 12);
  const normalizedMonth = ((month % 12) + 12) % 12;
  return { year, month: normalizedMonth };
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
  while (grid.length < 42) grid.push(null);
  return grid;
}

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

const TIME_OPTIONS = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    opts.push(`${String(h).padStart(2, "0")}:00`);
  }
  return opts;
})();

const DAY_PARTS_OPTIONS: { key: DayPart; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

export default function ManageAvailability() {
  const { t } = useLang();

  const {
    workingHours,
    updateWorkingHours,
    timeSlots,
    availability,
    setAvailability,
    setDirtySlots,
    loading,
    loadMonth,
    setSlotStatus: setSlotStatusHook,
    blockWholeDay: blockWholeDayApi,
    handleBlockDate: handleBlockDateApi,
    applyScheduleConfig,
    blockDaysOff: blockDaysOffApi,
    unblockDaysOff: unblockDaysOffApi,
    hasBookingsOnDays,
  } = useAvailability();

  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; }),
    [weekStart]
  );
  const weekLabel = useMemo(() => {
    const s = weekDays[0];
    const e = weekDays[6];
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return `${fmt(s)} – ${fmt(e)}, ${s.getFullYear()}`;
  }, [weekDays]);

  const { year: monthYear, month: monthMonth } = useMemo(() => getMonthOffset(monthOffset), [monthOffset]);
  const monthGrid = useMemo(() => buildMonthGrid(monthYear, monthMonth), [monthYear, monthMonth]);
  const monthLabel = useMemo(() => `${MONTH_NAMES[monthMonth]} ${monthYear}`, [monthMonth, monthYear]);

  useEffect(() => {
    const monthsNeeded = new Set<string>();
    if (viewMode === "week") {
      for (const day of weekDays) {
        monthsNeeded.add(`${day.getFullYear()}-${day.getMonth()}`);
      }
    } else {
      monthsNeeded.add(`${monthYear}-${monthMonth}`);
    }
    for (const mk of monthsNeeded) {
      const [y, m] = mk.split("-").map(Number);
      loadMonth(y, m);
    }
  }, [viewMode, weekDays, monthYear, monthMonth, loadMonth]);

  const [flashingCols, setFlashingCols] = useState<Set<number>>(new Set());
  const [showSlotDetail, setShowSlotDetail] = useState<SlotInfo | null>(null);
  const [whStart, setWhStart] = useState(workingHours.start);
  const [whEnd, setWhEnd] = useState(workingHours.end);
  const [whInterval, setWhInterval] = useState(workingHours.slotInterval ?? DEFAULT_SLOT_INTERVAL);

  const [sbSessionDuration, setSbSessionDuration] = useState(120);
  const [sbBreakDuration, setSbBreakDuration] = useState(30);
  const [sbStartTime, setSbStartTime] = useState("08:00");
  const [sbEndTime, setSbEndTime] = useState("18:00");
  const [sbDays, setSbDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));

  const [showBlockDateModal, setShowBlockDateModal] = useState(false);
  const [blockDateVal, setBlockDateVal] = useState("");
  const [daysOff, setDaysOff] = useState<Set<number>>(new Set([0]));
  const [daysOffParts, setDaysOffParts] = useState<Set<DayPart>>(new Set(["morning", "afternoon", "evening"]));
  const [blockedDows, setBlockedDows] = useState<Set<number>>(new Set());
  const [scheduleGenerated, setScheduleGenerated] = useState(false);

  const visibleWeekDays = useMemo(
    () => weekDays.filter((_, i) => !blockedDows.has(i)),
    [weekDays, blockedDows]
  );
  const visibleWeekDayIndices = useMemo(
    () => Array.from({ length: 7 }, (_, i) => i).filter((i) => !blockedDows.has(i)),
    [blockedDows]
  );

  useEffect(() => {
    setWhStart(workingHours.start);
    setWhEnd(workingHours.end);
    setWhInterval(workingHours.slotInterval ?? DEFAULT_SLOT_INTERVAL);
  }, [workingHours]);

  const sbConfig: SessionBreakConfig = useMemo(
    () => ({ sessionDuration: sbSessionDuration, breakDuration: sbBreakDuration, startTime: sbStartTime, endTime: sbEndTime }),
    [sbSessionDuration, sbBreakDuration, sbStartTime, sbEndTime],
  );

  const sbBlocks = useMemo(() => generateSessionBlocks(sbConfig), [sbConfig]);
  const sbSessionBlocks = useMemo(() => sbBlocks.filter((b) => b.type === "session"), [sbBlocks]);
  const sbSessionTimes = useMemo(() => new Set(sessionBlockTimes(sbBlocks)), [sbBlocks]);
  const sbBreakTimes = useMemo(() => new Set(breakBlockTimes(sbBlocks)), [sbBlocks]);

  const todayStr = useMemo(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  }, []);

  const saveAndApplyHandler = useCallback(async () => {
    if (whStart >= whEnd) {
      toast.error("Start time must be before end time");
      return;
    }
    try {
      await updateWorkingHours({ start: whStart, end: whEnd, slotInterval: whInterval });
      const count = await applyScheduleConfig(sbConfig, [...sbDays]);
      setScheduleGenerated(true);
      let msg = `Schedule applied: ${count} slot(s) updated`;
      toast.success(msg);
    } catch {
      toast.error("Failed to save schedule");
    }
  }, [whStart, whEnd, whInterval, sbConfig, sbDays, updateWorkingHours, applyScheduleConfig]);

  const toggleSessionBlock = useCallback((row: number, col: number) => {
    const day = weekDays[col];
    const block = sbSessionBlocks[row];
    if (!block) return;
    const dk = toDateKey(day);
    const hours = blockHourTimes(block);
    if (isDateInPast(dk) || isSlotInPast(dk, hours[0])) return;
    const hasBooked = hours.some((h) => availability[`${dk}_${h}`]?.status === "booked");
    if (hasBooked) {
      const bookedSlot = hours.reduce<SlotInfo | undefined>((found, h) => found ?? availability[`${dk}_${h}`], undefined);
      if (bookedSlot) setShowSlotDetail(bookedSlot);
      return;
    }
    const hasOpen = hours.some((h) => availability[`${dk}_${h}`]?.status === "open");
    const next: SlotStatus = hasOpen ? "off" : "open";
    for (const h of hours) {
      setSlotStatusHook(dk, h, next);
    }
  }, [weekDays, sbSessionBlocks, availability, setSlotStatusHook]);

  const blockWholeDay = useCallback(
    async (col: number) => {
      const day = weekDays[col];
      const dk = toDateKey(day);
      if (isDateInPast(dk)) { toast.info("Can't edit availability in the past"); return; }
      const updates: { date: string; time: string; status: SlotStatus }[] = [];
      for (const block of sbSessionBlocks) {
        for (const time of blockHourTimes(block)) {
          if (isSlotInPast(dk, time)) continue;
          const key = `${dk}_${time}`;
          const current = availability[key];
          if (current?.status === "booked") continue;
          updates.push({ date: dk, time, status: "off" });
        }
      }
      setAvailability((prev) => {
        const next = { ...prev };
        for (const u of updates) {
          const k = `${u.date}_${u.time}`;
          const existing = next[k];
          next[k] = { ...existing, date: u.date, time: u.time, status: u.status };
        }
        return next;
      });
      setDirtySlots((prev) => { const s = new Set(prev); for (const u of updates) s.add(`${u.date}_${u.time}`); return s; });
      try {
        const { bulkUpdateSlots } = await import("@/services/api/availability");
        await bulkUpdateSlots(updates);
      } catch { /* silent */ }
      setFlashingCols(new Set([col]));
      setTimeout(() => setFlashingCols(new Set()), 400);
      toast.success(`${FULL_DAYS[day.getDay()]} marked as off`);
    },
    [weekDays, sbSessionBlocks, availability, setAvailability, setDirtySlots]
  );

  const handleBlockDate = useCallback(async () => {
    if (!blockDateVal) { toast.error("Pick a date to block"); return; }
    if (isDateInPast(blockDateVal)) { toast.info("Can't block a date in the past"); return; }
    try {
      await handleBlockDateApi(blockDateVal);
      const d = new Date(blockDateVal + "T00:00:00");
      toast.success(`${FULL_DAYS[d.getDay()]} ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} marked as off`);
      setBlockDateVal("");
      setShowBlockDateModal(false);
    } catch {
      toast.error("Failed to block date");
    }
  }, [blockDateVal, handleBlockDateApi]);

  const ALL_PARTS: DayPart[] = ["morning", "afternoon", "evening"];

  const handleBlockDaysOff = useCallback(async () => {
    if (daysOff.size === 0) { toast.error("Select at least one day to block"); return; }
    if (daysOffParts.size === 0) { toast.error("Select at least one time of day"); return; }
    const parts = [...daysOffParts];
    if (hasBookingsOnDays([...daysOff], parts)) {
      toast.error("Cannot block days with existing bookings. Reschedule or cancel those sessions first.");
      return;
    }
    const count = await blockDaysOffApi([...daysOff], parts);
    const isFullBlock = ALL_PARTS.every((p) => daysOffParts.has(p));
    if (count > 0 && isFullBlock) {
      setBlockedDows((prev) => { const n = new Set(prev); for (const d of daysOff) n.add(d); return n; });
    }
    toast.success(`${count} slot(s) blocked for selected days`);
  }, [daysOff, daysOffParts, blockDaysOffApi, hasBookingsOnDays]);

  const handleUnblockDaysOff = useCallback(async (dows: number[]) => {
    const parts = [...daysOffParts];
    if (parts.length === 0) { toast.error("Select at least one time of day to unblock"); return; }
    const count = await unblockDaysOffApi(dows, parts);
    const isFullUnblock = ALL_PARTS.every((p) => daysOffParts.has(p));
    if (count > 0 && isFullUnblock) {
      setBlockedDows((prev) => { const n = new Set(prev); for (const d of dows) n.delete(d); return n; });
    }
    toast.success(`${count} slot(s) unblocked`);
  }, [daysOffParts, unblockDaysOffApi]);

  const slotBg = (status: SlotStatus, isBreak: boolean = false) => {
    if (isBreak && status === "off") return "bg-[#F5F0EB] border border-dashed border-[rgba(139,115,85,.2)] text-[#8B7355]";
    if (status === "booked") return "bg-[#16332A] text-white";
    if (status === "open") return "bg-[#D1E8DF] text-[#1E2A2E]";
    return "bg-[#FBFBF8] border-[1.5px] border-[rgba(30,42,46,.12)] text-[#4A5854]";
  };

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <p className="eyebrow mb-2">{t("availability.schedule")}</p>
          <h1 className="text-[28px] font-display text-text leading-tight">{t("availability.title")}</h1>
        </div>
      </div>

      {/* ═══════════════ SCHEDULE BUILDER ═══════════════ */}
      <div className="card-soft p-5 sm:p-6 mb-6">
        <p className="eyebrow mb-4">{t("availability.scheduleBuilder")}</p>

        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.startTime")}</label>
            <select value={sbStartTime} onChange={(e) => setSbStartTime(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary">
              {TIME_OPTIONS.map((t) => <option key={`sb-s-${t}`} value={t}>{t}</option>)}
            </select>
          </div>
          <span className="text-text-light pb-2">—</span>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.endTime")}</label>
            <select value={sbEndTime} onChange={(e) => setSbEndTime(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary">
              {TIME_OPTIONS.map((t) => <option key={`sb-e-${t}`} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.sessionDuration")}</label>
            <select value={sbSessionDuration} onChange={(e) => setSbSessionDuration(+e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary">
              {SESSION_DURATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.breakDuration")}</label>
            <select value={sbBreakDuration} onChange={(e) => setSbBreakDuration(+e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary">
              {BREAK_DURATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-text-light mb-2">{t("availability.daysOfWeek")}</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, i) => (
              <button key={`sb-day-${day}`} onClick={() => setSbDays((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                className={cn("px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150",
                  sbDays.has(i) ? "bg-accent text-white" : "bg-white border-[1.5px] border-[rgba(30,42,46,.14)] text-text-light hover:border-secondary hover:text-secondary"
                )}>
                {day}
              </button>
            ))}
          </div>
        </div>

        {sbSessionBlocks.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-light mb-2">{t("availability.sessionChart")}</p>
            <div className="flex flex-wrap gap-[5px]">
              {sbSessionBlocks.map((block, i) => (
                <div key={`session-${i}`}
                  className="h-[52px] rounded-lg bg-[#D1E8DF] text-[#1E2A2E] flex items-center justify-center flex-1 min-w-[100px] px-3">
                  <span className="text-[11px] font-mono font-semibold">
                    {to12h(block.startTime)} – {to12h(block.endTime)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 font-mono">
              {sbSessionBlocks.length} session(s) · {sbBreakDuration > 0 ? `${BREAK_DURATION_OPTIONS.find((o) => o.value === sbBreakDuration)?.label} break between` : "no break"}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
          <button onClick={saveAndApplyHandler} className="btn-primary !py-2 !px-6 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t("availability.generateAndApply")}
          </button>
        </div>
      </div>

      {/* ─── NAVIGATION BAR ─── */}
      {scheduleGenerated && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <button onClick={() => viewMode === "week" ? setWeekOffset((p) => p - 1) : setMonthOffset((p) => p - 1)}
            className="p-2 rounded-full hover:bg-surface text-text-light hover:text-text transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col-reverse items-center gap-0.5">
            <div className=" font-mono text-xs uppercase tracking-[0.1em] text-text-light">
              {viewMode === "week" ? weekLabel : monthLabel}
            </div>
            <div className="tabs-filter">
              <button onClick={() => setViewMode("week")}
                className={cn("px-4 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150",
                  viewMode === "week" ? "tab-active" : "text-text-light hover:text-text"
                )}>{t("availability.weekly")}</button>
              <button onClick={() => setViewMode("month")}
                className={cn("px-4 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150",
                  viewMode === "month" ? "tab-active" : "text-text-light hover:text-text"
                )}>{t("availability.monthly")}</button>
            </div>

          </div>
          <button onClick={() => viewMode === "week" ? setWeekOffset((p) => p + 1) : setMonthOffset((p) => p + 1)}
            className="p-2 rounded-full hover:bg-surface text-text-light hover:text-text transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ═══════════════ WEEKLY GRID ═══════════════ */}
      {scheduleGenerated && viewMode === "week" && (
        <div className="card-soft p-4 sm:p-6 mb-8 overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid gap-[5px] mb-[5px]" style={{ gridTemplateColumns: `64px repeat(${visibleWeekDays.length}, 1fr)` }}>
              <div />
              {visibleWeekDays.map((day, vi) => {
                const ci = visibleWeekDayIndices[vi];
                const dk = toDateKey(day);
                const past = isDateInPast(dk);
                return (
                  <button key={toDateKey(day)} onClick={() => blockWholeDay(ci)} disabled={past}
                    className={cn("py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] transition-colors rounded-lg",
                      past ? "text-text-muted cursor-not-allowed opacity-50" : "text-text-light hover:text-text hover:bg-surface"
                    )}>
                    {DAYS[ci]}
                    <span className="block text-[10px] normal-case tracking-normal text-text-muted mt-0.5">{day.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-text-light">{t("availability.loading")}</div>
            ) : (
              sbSessionBlocks.map((block, ri) => {
                const hours = blockHourTimes(block);
                const mins = blockDurationMins(block);
                const rowH = Math.max(52, Math.round((mins / 60) * 36));
                return (
                  <div key={`block-${ri}`} className="grid gap-[5px] mb-[5px]" style={{ gridTemplateColumns: `64px repeat(${visibleWeekDays.length}, 1fr)` }}>
                    <div className="flex items-center justify-center pr-2 font-mono text-[11px] text-text-light leading-tight">
                      {to12h(block.startTime)} <span className="text-text-muted mx-0.5">|</span> {to12h(block.endTime)}
                    </div>
                    {visibleWeekDays.map((day, vi) => {
                      const ci = visibleWeekDayIndices[vi];
                      const dk = toDateKey(day);
                      const firstKey = `${dk}_${hours[0]}`;
                      const firstSlot = availability[firstKey];
                      const hasBooked = hours.some((h) => availability[`${dk}_${h}`]?.status === "booked");
                      const hasOpen = hours.some((h) => availability[`${dk}_${h}`]?.status === "open");
                      const state: SlotStatus = hasBooked ? "booked" : hasOpen ? "open" : (firstSlot?.status ?? "off");
                      const isFlashing = flashingCols.has(ci);
                      const past = isDateInPast(dk);
                      const slotPast = !past && isSlotInPast(dk, hours[0]);
                      const locked = past || slotPast;
                      return (
                        <button key={`${ri}-${ci}`} onClick={() => toggleSessionBlock(ri, ci)} disabled={locked}
                          className={cn("rounded-lg transition-all duration-200 relative",
                            locked ? "opacity-40 cursor-not-allowed bg-[#e8e8e8]" : "active:scale-95 active:opacity-80",
                            !locked && slotBg(state),
                            isFlashing && !locked && "animate-pulse"
                          )}
                          style={{ height: `${rowH}px`, ...(locked ? { backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)" } : undefined) }}
                          title={locked ? "Can't edit availability in the past" : state === "booked" ? `Booked: ${firstSlot?.patientName}` : state}>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#16332A]" /> {t("availability.booked")}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D1E8DF]" /> {t("availability.open")}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-[rgba(30,42,46,.25)] bg-[#FBFBF8]" /> {t("availability.off")}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
              <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#e8e8e8]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)" }} /> {t("availability.past")}
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════ MONTHLY GRID ═══════════════ */}
      {scheduleGenerated && viewMode === "month" && (
        <div className="card-soft p-4 sm:p-6 mb-8">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-light">{t("availability.loadingMonth")}</div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-[5px] mb-[5px]">
                {DAYS.map((day) => (
                  <div key={day} className="py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-text-light">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-[5px]">
                {monthGrid.map((cellDate, idx) => {
                  if (!cellDate) return <div key={`empty-${idx}`} className="h-[100px]" />;
                  const dk = toDateKey(cellDate);
                  const dow = cellDate.getDay();
                  if (blockedDows.has(dow)) return <div key={`blocked-${dk}`} className="h-[100px] rounded-lg bg-transparent" />;
                  const past = isDateInPast(dk);
                  const isToday = dk === todayStr;
                  const dayBlocks = sbSessionBlocks.map((block) => {
                    const hours = blockHourTimes(block);
                    const hasBooked = hours.some((h) => availability[`${dk}_${h}`]?.status === "booked");
                    const hasOpen = hours.some((h) => availability[`${dk}_${h}`]?.status === "open");
                    const state: SlotStatus = hasBooked ? "booked" : hasOpen ? "open" : "off";
                    return { block, state };
                  });
                  const hasAnySlots = dayBlocks.some(({ state }) => state === "open" || state === "booked");

                  return (
                    <div key={dk}
                      className={cn("h-[100px] rounded-lg p-1.5 flex flex-col items-start text-left transition-all duration-200 gap-[3px] overflow-hidden",
                        past ? "opacity-45 bg-[#e8e8e8]" : "bg-white border border-border",
                        isToday && !past && "ring-2 ring-primary/40"
                      )}
                      style={past ? { backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)" } : undefined}>
                      <span className={cn("font-mono text-[11px] leading-none",
                        isToday && !past ? "text-primary font-bold" : past ? "text-text-muted" : "text-text"
                      )}>{cellDate.getDate()}</span>
                      {hasAnySlots && !past && dayBlocks.map(({ block, state }, bi) => (
                        <div key={bi} className={cn("w-full rounded px-1 py-0.5 text-center font-mono text-[8px] leading-tight truncate",
                          state === "booked" ? "bg-[#16332A] text-white" : state === "open" ? "bg-[#D1E8DF] text-[#1E2A2E]" : "bg-[#FBFBF8] text-text-muted border border-[rgba(30,42,46,.1)]"
                        )}>
                          {to12h(block.startTime)} | {to12h(block.endTime)}
                        </div>
                      ))}
                      {past && (
                        <div className="flex-1 flex flex-col justify-end w-full">
                          <span className="font-mono text-[9px] text-text-muted leading-tight">—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#16332A]" /> {t("availability.booked")}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D1E8DF]" /> {t("availability.open")}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-[rgba(30,42,46,.25)] bg-[#FBFBF8]" /> {t("availability.off")}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
                  <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#e8e8e8]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)" }} /> {t("availability.past")}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════ DAYS OFF ═══════════════ */}
      <div className="card-soft p-5 sm:p-6 mb-6">
        <p className="eyebrow mb-2">{t("availability.daysOff")}</p>
        <p className="text-sm text-text-light mb-4">{t("availability.daysOffDesc")}</p>

        <div className="mb-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-text-light mb-2">{t("availability.daysOfWeek")}</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, i) => (
              <button key={`doff-${day}`} onClick={() => setDaysOff((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                className={cn("px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer",
                  daysOff.has(i) ? "bg-accent text-white" : "bg-white border-[1.5px] border-[rgba(30,42,46,.14)] text-text-light hover:border-[#C0392B] hover:text-[#C0392B]"
                )}>
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-text-light mb-2">{t("availability.timeOfDay")}</p>
          <div className="flex flex-wrap gap-2">
            {DAY_PARTS_OPTIONS.map(({ key, label }) => {
              const range = DAY_PART_RANGES[key];
              return (
                <button key={`doff-part-${key}`}
                  onClick={() => setDaysOffParts((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; })}
                  className={cn("px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer",
                    daysOffParts.has(key) ? "bg-accent text-white" : "bg-white border-[1.5px] border-[rgba(30,42,46,.14)] text-text-light "
                  )}>
                  {label} <span className="opacity-70">{range[0]}:00–{range[1]}:00</span>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleBlockDaysOff}
          disabled={daysOff.size === 0 || daysOffParts.size === 0}
          className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2 disabled:opacity-40 mb-4"
        >
          <Ban className="w-4 h-4" />
          {t("availability.blockDaysOff")}
        </button>

        {blockedDows.size > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-light mb-2">{t("availability.blockedDays")}</p>
            <div className="flex flex-wrap gap-2">
              {[...blockedDows].sort().map((dow) => (
                <div key={`blocked-${dow}`} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0392B]/10 border border-[#C0392B]/25">
                  <span className="font-mono text-[11px] uppercase text-[#C0392B]">{DAYS[dow]}</span>
                  <button onClick={() => handleUnblockDaysOff([dow])}
                    className="ml-1 text-[10px] font-mono text-[#C0392B]/70 hover:text-[#C0392B] underline">
                    {t("availability.unblock")}
                  </button>
                </div>
              ))}
              <button onClick={() => handleUnblockDaysOff([...blockedDows])}
                className="px-3 py-1 rounded-full font-mono text-[11px] text-text-light hover:text-text border border-border hover:border-text-light transition-colors">
                {t("availability.unblockAll")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── SLOT DETAIL POPUP ─── */}
      {showSlotDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSlotDetail(null)}>
          <div className="card-soft p-6 w-[320px] animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow mb-2">{t("availability.bookingDetails")}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-light">{t("availability.patient")}</span><span className="font-medium text-text">{showSlotDetail.patientName}</span></div>
              <div className="flex justify-between"><span className="text-text-light">{t("availability.phone")}</span><span className="font-mono text-text">{showSlotDetail.patientPhone}</span></div>
              <div className="flex justify-between"><span className="text-text-light">{t("availability.date")}</span><span className="text-text">{showSlotDetail.date}</span></div>
              <div className="flex justify-between"><span className="text-text-light">{t("availability.time")}</span><span className="text-text">{to12h(showSlotDetail.time)}</span></div>
              <div className="flex justify-between"><span className="text-text-light">{t("availability.session")}</span><span className="text-text">{showSlotDetail.sessionType}</span></div>
              <div className="flex justify-between"><span className="text-text-light">{t("availability.fee")}</span><span className="font-medium text-text">Rs {showSlotDetail.fee?.toLocaleString()}</span></div>
            </div>
            <p className="text-[11px] text-text-muted mt-3 pt-3 border-t border-border">{t("availability.bookedEditNote")}</p>
            <button onClick={() => setShowSlotDetail(null)} className="btn-outline !py-1.5 !px-4 text-xs w-full mt-3">{t("availability.close")}</button>
          </div>
        </div>
      )}

    </>
  );
}
