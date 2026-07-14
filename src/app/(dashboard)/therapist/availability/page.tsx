"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { cn } from "@/utils/cn";
import { to12h } from "@/lib/format";
import { ChevronLeft, ChevronRight, CalendarDays, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  generateTimeSlots,
  sessionPeriodForTime,
  getTherapistWorkingHours,
  getAvailability,
  setSlotStatus as setSlotStatusApi,
  applyRecurringPattern as applyRecurringApi,
  openFullMonth as openFullMonthApi,
  blockDate as blockDateApi,
  countOpenSlotsForMonth,
  isDateInPast,
  isSlotInPast,
  SLOT_INTERVAL_MINUTES,
  type SlotInfo,
  type SlotStatus,
  type WorkingHours,
} from "@/services/availability";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const SESSION_PILLS = ["Morning", "Afternoon", "Evening"] as const;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const THERAPIST_ID = "therapist-1";

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

export default function ManageAvailability() {
  const { t } = useLang();

  const [workingHours, setWorkingHours] = useState<WorkingHours>({ start: "08:00", end: "18:00" });

  const timeSlots = useMemo(
    () => generateTimeSlots(workingHours.start, workingHours.end, SLOT_INTERVAL_MINUTES),
    [workingHours]
  );

  const sessionPeriods = useMemo(() => {
    const periods = new Set<string>();
    for (const ts of timeSlots) periods.add(sessionPeriodForTime(ts));
    return [...periods];
  }, [timeSlots]);

  const timeRowMap = useMemo(() => {
    const map: Record<string, number[]> = { Morning: [], Afternoon: [], Evening: [] };
    timeSlots.forEach((ts, i) => {
      const p = sessionPeriodForTime(ts);
      if (map[p]) map[p].push(i);
    });
    return map;
  }, [timeSlots]);

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

  // ════════════════════════════════════════════════════════════════
  // SINGLE SOURCE OF TRUTH — keyed by "YYYY-MM-DD_HH:mm" → SlotInfo
  // Both Weekly and Monthly views derive their display from this.
  // ════════════════════════════════════════════════════════════════
  const [availability, setAvailability] = useState<Record<string, SlotInfo>>({});
  const [dirtySlots, setDirtySlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Monthly summaries derived from the single store (no separate fetch)
  const monthDaySummaries = useMemo(() => {
    const result: Record<string, { open: number; booked: number; off: number }> = {};
    for (const cellDate of monthGrid) {
      if (!cellDate) continue;
      const dk = toDateKey(cellDate);
      const counts = { open: 0, booked: 0, off: 0 };
      for (const time of timeSlots) {
        const key = `${dk}_${time}`;
        const slot = availability[key];
        counts[(slot?.status ?? "off") as keyof typeof counts]++;
      }
      result[dk] = counts;
    }
    return result;
  }, [availability, monthGrid, timeSlots]);

  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [blockDateVal, setBlockDateVal] = useState("");
  const [flashingCols, setFlashingCols] = useState<Set<number>>(new Set());

  const [showOfmModal, setShowOfmModal] = useState(false);
  const [ofmMonth, setOfmMonth] = useState(new Date().getMonth());
  const [ofmYear, setOfmYear] = useState(new Date().getFullYear());
  const [ofmDays, setOfmDays] = useState<Set<number>>(new Set([1, 3, 5]));
  const [ofmSessions, setOfmSessions] = useState<Set<string>>(new Set(["Morning"]));
  const [ofmConfirmData, setOfmConfirmData] = useState<{ total: number; booked: number; skippedPast: number } | null>(null);
  const [ofmApplying, setOfmApplying] = useState(false);

  const [showSlotDetail, setShowSlotDetail] = useState<SlotInfo | null>(null);

  const [drillDownDate, setDrillDownDate] = useState<Date | null>(null);
  const [drillDownDirty, setDrillDownDirty] = useState<Set<string>>(new Set());
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  const pendingCount = dirtySlots.size;

  // ─── SINGLE LOADING EFFECT — loads any month not yet in the store ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const wh = await getTherapistWorkingHours(THERAPIST_ID);
      if (cancelled) return;
      setWorkingHours(wh);

      const monthsToLoad = new Set<string>();
      if (viewMode === "week") {
        for (const day of weekDays) {
          monthsToLoad.add(`${day.getFullYear()}-${day.getMonth()}`);
        }
      } else {
        monthsToLoad.add(`${monthYear}-${monthMonth}`);
      }

      for (const mk of monthsToLoad) {
        const [y, m] = mk.split("-").map(Number);
        const grid = await getAvailability(THERAPIST_ID, m, y, wh);
        if (cancelled) return;
        setAvailability((prev) => {
          const next = { ...prev };
          for (const slot of grid.slots) next[`${slot.date}_${slot.time}`] = slot;
          return next;
        });
      }

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [viewMode, weekStart.getMonth(), weekStart.getFullYear(), monthMonth, monthYear]);

  // ─── Refresh a specific month into the store (after mutations) ───
  const refreshMonth = useCallback(
    async (year: number, month: number) => {
      const grid = await getAvailability(THERAPIST_ID, month, year, workingHours);
      setAvailability((prev) => {
        const next = { ...prev };
        for (const slot of grid.slots) next[`${slot.date}_${slot.time}`] = slot;
        return next;
      });
    },
    [workingHours]
  );

  const commitChanges = useCallback(async () => {
    const promises: Promise<void>[] = [];
    for (const key of dirtySlots) {
      const slot = availability[key];
      if (slot) {
        promises.push(setSlotStatusApi(THERAPIST_ID, slot.date, slot.time, slot.status));
      }
    }
    await Promise.all(promises);
    setDirtySlots(new Set());
  }, [dirtySlots, availability]);

  // ─── Weekly view: toggle cell ───
  const toggleCell = useCallback((row: number, col: number) => {
    const day = weekDays[col];
    const time = timeSlots[row];
    const dk = toDateKey(day);

    if (isDateInPast(dk)) return;
    if (isSlotInPast(dk, time)) return;

    const key = `${dk}_${time}`;
    const current = availability[key];
    if (!current) return;
    if (current.status === "booked") {
      setShowSlotDetail(current);
      return;
    }
    const next: SlotStatus = current.status === "open" ? "off" : "open";
    setAvailability((prev) => ({ ...prev, [key]: { ...current, status: next } }));
    setDirtySlots((prev) => { const s = new Set(prev); s.add(key); return s; });
  }, [weekDays, timeSlots, availability]);

  // ─── Weekly view: block whole day ───
  const blockWholeDay = useCallback(
    async (col: number) => {
      const day = weekDays[col];
      const dk = toDateKey(day);
      if (isDateInPast(dk)) {
        toast.info("Can't edit availability in the past");
        return;
      }
      const updates: Record<string, SlotInfo> = {};
      for (const time of timeSlots) {
        if (isSlotInPast(dk, time)) continue;
        const key = `${dk}_${time}`;
        const current = availability[key];
        if (current?.status === "booked") continue;
        updates[key] = { ...current, date: dk, time, status: "off", sessionType: sessionPeriodForTime(time) };
      }
      setAvailability((prev) => ({ ...prev, ...updates }));
      setDirtySlots((prev) => { const s = new Set(prev); for (const k in updates) s.add(k); return s; });

      const promises = Object.values(updates).map((s) =>
        setSlotStatusApi(THERAPIST_ID, s.date, s.time, s.status)
      );
      await Promise.all(promises);

      setFlashingCols(new Set([col]));
      setTimeout(() => setFlashingCols(new Set()), 400);
      toast.success(`${FULL_DAYS[day.getDay()]} marked as off`);
    },
    [weekDays, timeSlots, availability]
  );

  const togglePill = (setter: React.Dispatch<React.SetStateAction<Set<number>>>) => (idx: number) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleSessionPill = (label: string) => {
    setSelectedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  // ─── Save recurring ───
  const saveRecurring = useCallback(async () => {
    if (selectedDays.size === 0 || selectedSessions.size === 0) {
      toast.error("Select at least one day and one session period");
      return;
    }
    const { affected, skippedPast } = await applyRecurringApi(THERAPIST_ID, {
      days: [...selectedDays],
      sessions: [...selectedSessions],
    }, workingHours);

    // Refresh current month into the unified store
    const now = new Date();
    await refreshMonth(now.getFullYear(), now.getMonth());

    const dayNames = [...selectedDays].map((i) => DAYS[i]).join(", ");
    let msg = `Recurring pattern saved: ${dayNames} — ${[...selectedSessions].join(", ")} (${affected} slots)`;
    if (skippedPast > 0) msg += `. ${skippedPast} past slot(s) were skipped.`;
    toast.success(msg);
    setSelectedDays(new Set());
    setSelectedSessions(new Set());
  }, [selectedDays, selectedSessions, workingHours, refreshMonth]);

  // ─── Block date (respects day-part pills) ───
  const handleBlockDate = useCallback(async () => {
    if (!blockDateVal) {
      toast.error("Pick a date to block");
      return;
    }
    if (isDateInPast(blockDateVal)) {
      toast.info("Can't block a date in the past");
      return;
    }
    const dk = blockDateVal;
    const sessions = selectedSessions.size > 0 ? [...selectedSessions] : undefined;
    await blockDateApi(THERAPIST_ID, dk, workingHours, sessions);

    // Refresh the month containing this date into the unified store
    const d = new Date(dk + "T00:00:00");
    await refreshMonth(d.getFullYear(), d.getMonth());

    let msg = `${FULL_DAYS[d.getDay()]} ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} marked as off`;
    if (sessions) msg += ` (${sessions.join(", ")})`;
    toast.success(msg);
    setBlockDateVal("");
  }, [blockDateVal, selectedSessions, workingHours, refreshMonth]);

  const computeOfmPreview = useCallback(() => {
    const result = countOpenSlotsForMonth(ofmYear, ofmMonth, [...ofmDays], [...ofmSessions], workingHours);
    setOfmConfirmData(result);
  }, [ofmYear, ofmMonth, ofmDays, ofmSessions, workingHours]);

  const executeOpenFullMonth = useCallback(async () => {
    setOfmApplying(true);
    const result = await openFullMonthApi(THERAPIST_ID, {
      days: [...ofmDays],
      sessions: [...ofmSessions],
      month: ofmMonth,
      year: ofmYear,
    }, workingHours);

    // Refresh the target month into the unified store
    await refreshMonth(ofmYear, ofmMonth);

    const data = ofmConfirmData ?? { total: 0, booked: 0, skippedPast: 0 };
    let msg = `Opened ${data.total - data.booked} slots in ${MONTH_NAMES[ofmMonth]}. ${data.booked} booking(s) left untouched.`;
    if (data.skippedPast > 0) msg += ` Past dates were skipped (${data.skippedPast} slot${data.skippedPast > 1 ? "s" : ""}).`;
    toast.success(msg);
    setShowOfmModal(false);
    setOfmConfirmData(null);
    setOfmApplying(false);
  }, [ofmDays, ofmSessions, ofmMonth, ofmYear, workingHours, refreshMonth, ofmConfirmData]);

  const handleFinishUpdate = useCallback(async () => {
    if (pendingCount === 0) {
      toast.info("No pending changes to save");
      return;
    }
    await commitChanges();
    toast.success(`${pendingCount} slot(s) updated successfully`);
  }, [pendingCount, commitChanges]);

  // ─── Drill-down: open a day from monthly view ───
  const openDrillDown = useCallback(async (date: Date) => {
    const dk = toDateKey(date);
    if (isDateInPast(dk)) return;

    setDrillDownDate(date);
    setDrillDownDirty(new Set());

    // Ensure data is loaded for this month
    const hasData = timeSlots.some((t) => availability[`${dk}_${t}`]);
    if (!hasData) {
      setDrillDownLoading(true);
      const grid = await getAvailability(THERAPIST_ID, date.getMonth(), date.getFullYear(), workingHours);
      setAvailability((prev) => {
        const next = { ...prev };
        for (const slot of grid.slots) next[`${slot.date}_${slot.time}`] = slot;
        return next;
      });
      setDrillDownLoading(false);
    }
  }, [workingHours, timeSlots]);

  const toggleDrillDownCell = useCallback((time: string) => {
    if (!drillDownDate) return;
    const dk = toDateKey(drillDownDate);
    if (isDateInPast(dk)) return;
    if (isSlotInPast(dk, time)) return;

    const key = `${dk}_${time}`;
    const current = availability[key];
    if (!current) return;
    if (current.status === "booked") {
      setShowSlotDetail(current);
      return;
    }
    const next: SlotStatus = current.status === "open" ? "off" : "open";
    setAvailability((prev) => ({ ...prev, [key]: { ...current, status: next } }));
    setDrillDownDirty((prev) => { const s = new Set(prev); s.add(key); return s; });
    setDirtySlots((prev) => { const s = new Set(prev); s.add(key); return s; });
  }, [drillDownDate, availability]);

  const commitDrillDown = useCallback(async () => {
    const promises: Promise<void>[] = [];
    for (const key of drillDownDirty) {
      const slot = availability[key];
      if (slot) {
        promises.push(setSlotStatusApi(THERAPIST_ID, slot.date, slot.time, slot.status));
      }
    }
    await Promise.all(promises);
    // Remove committed slots from main dirty tracking
    setDirtySlots((prev) => {
      const s = new Set(prev);
      for (const k of drillDownDirty) s.delete(k);
      return s;
    });
    setDrillDownDirty(new Set());
    toast.success(`${drillDownDirty.size} slot(s) updated`);
    setDrillDownDate(null);
  }, [drillDownDirty, availability]);

  const slotBg = (status: SlotStatus) => {
    if (status === "booked") return "bg-[#16332A] text-white";
    if (status === "open") return "bg-[#D1E8DF] text-[#1E2A2E]";
    return "bg-[#FBFBF8] border-[1.5px] border-[rgba(30,42,46,.12)] text-[#4A5854]";
  };

  const todayStr = useMemo(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  }, []);

  // Block date min = today
  const blockDateMin = todayStr;

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3">
        <div>
          <p className="eyebrow mb-2">{t("availability.schedule")}</p>
          <h1 className="text-[28px] font-display text-text leading-tight mb-1">
            {t("availability.title")}
          </h1>
          <p className="text-sm text-text-light">{t("availability.instruction")}</p>
        </div>
        <button
          onClick={handleFinishUpdate}
          className={cn(
            "btn-secondary !py-2 !px-5 text-sm shrink-0 self-start",
            pendingCount === 0 && "opacity-50 cursor-not-allowed"
          )}
          disabled={pendingCount === 0}
        >
          <Check className="w-4 h-4 mr-1" />
          Finish update{pendingCount > 0 ? ` (${pendingCount})` : ""}
        </button>
      </div>

      {/* ─── NAVIGATION BAR: view toggle + date nav ─── */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <button
          onClick={() => viewMode === "week" ? setWeekOffset((p) => p - 1) : setMonthOffset((p) => p - 1)}
          className="p-2 rounded-full hover:bg-surface text-text-light hover:text-text transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="tabs-filter">
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "px-4 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150",
                viewMode === "week"
                  ? "tab-active"
                  : "text-text-light hover:text-text"
              )}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "px-4 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150",
                viewMode === "month"
                  ? "tab-active"
                  : "text-text-light hover:text-text"
              )}
            >
              Monthly
            </button>
          </div>

          {/* Date range label */}
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-text-light">
            {viewMode === "week" ? weekLabel : monthLabel}
          </span>
        </div>

        <button
          onClick={() => viewMode === "week" ? setWeekOffset((p) => p + 1) : setMonthOffset((p) => p + 1)}
          className="p-2 rounded-full hover:bg-surface text-text-light hover:text-text transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ═══════════════ WEEKLY GRID ═══════════════ */}
      {viewMode === "week" && (
        <div className="card-soft p-4 sm:p-6 mb-8 overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Column headers */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-[5px] mb-[5px]">
              <div />
              {DAYS.map((day, ci) => {
                const dk = toDateKey(weekDays[ci]);
                const past = isDateInPast(dk);
                return (
                  <button
                    key={day}
                    onClick={() => blockWholeDay(ci)}
                    disabled={past}
                    className={cn(
                      "py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] transition-colors rounded-lg",
                      past
                        ? "text-text-muted cursor-not-allowed opacity-50"
                        : "text-text-light hover:text-text hover:bg-surface"
                    )}
                  >
                    {day}
                    <span className="block text-[10px] normal-case tracking-normal text-text-muted mt-0.5">
                      {weekDays[ci].getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid rows */}
            {loading ? (
              <div className="py-12 text-center text-sm text-text-light">Loading availability…</div>
            ) : (
              timeSlots.map((time, ri) => (
                <div key={time} className="grid grid-cols-[64px_repeat(7,1fr)] gap-[5px] mb-[5px]">
                  <div className="flex items-start justify-end pr-2 pt-1 font-mono text-[11px] text-text-light">
                    {to12h(time)}
                  </div>
                  {weekDays.map((day, ci) => {
                    const dk = toDateKey(day);
                    const key = `${dk}_${time}`;
                    const slot = availability[key];
                    const state: SlotStatus = slot?.status ?? "off";
                    const isFlashing = flashingCols.has(ci);
                    const past = isDateInPast(dk);
                    const slotPast = !past && isSlotInPast(dk, time);
                    const locked = past || slotPast;
                    return (
                      <button
                        key={`${ri}-${ci}`}
                        onClick={() => toggleCell(ri, ci)}
                        disabled={locked}
                        className={cn(
                          "h-[52px] rounded-lg transition-all duration-200",
                          locked
                            ? "opacity-40 cursor-not-allowed bg-[#e8e8e8] relative"
                            : "active:scale-95 active:opacity-80",
                          !locked && slotBg(state),
                          isFlashing && !locked && "animate-pulse"
                        )}
                        style={locked ? {
                          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)",
                        } : undefined}
                        aria-label={`${DAYS[ci]} ${to12h(time)} — ${locked ? "past, not editable" : state}`}
                        title={locked ? "Can't edit availability in the past" : state === "booked" ? `Booked: ${slot?.patientName}` : state}
                      />
                    );
                  })}
                </div>
              ))
            )}
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
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
              <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#e8e8e8]" style={{
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
              }} />
              Past
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════ MONTHLY GRID ═══════════════ */}
      {viewMode === "month" && (
        <div className="card-soft p-4 sm:p-6 mb-8">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-light">Loading month summary…</div>
          ) : (
            <>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-[5px] mb-[5px]">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-text-light"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-[5px]">
                {monthGrid.map((cellDate, idx) => {
                  if (!cellDate) {
                    return <div key={`empty-${idx}`} className="h-[80px]" />;
                  }

                  const dk = toDateKey(cellDate);
                  const past = isDateInPast(dk);
                  const summary = monthDaySummaries[dk];
                  const openCount = summary?.open ?? 0;
                  const bookedCount = summary?.booked ?? 0;
                  const offCount = summary?.off ?? 0;
                  const totalSlots = openCount + bookedCount + offCount;
                  const isToday = dk === todayStr;

                  return (
                    <button
                      key={dk}
                      onClick={() => openDrillDown(cellDate)}
                      disabled={past}
                      className={cn(
                        "h-[80px] rounded-lg p-2 flex flex-col items-start text-left transition-all duration-200",
                        past
                          ? "opacity-45 cursor-not-allowed bg-[#e8e8e8]"
                          : "hover:shadow-md hover:scale-[1.02] cursor-pointer bg-white border border-border",
                        isToday && !past && "ring-2 ring-primary/40"
                      )}
                      style={past ? {
                        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)",
                      } : undefined}
                      title={past ? "Can't edit availability in the past" : `${openCount} open · ${bookedCount} booked`}
                    >
                      <span className={cn(
                        "font-mono text-[11px] leading-none mb-1",
                        isToday && !past ? "text-primary font-bold" : past ? "text-text-muted" : "text-text"
                      )}>
                        {cellDate.getDate()}
                      </span>

                      {totalSlots > 0 && !past && (
                        <div className="flex-1 flex flex-col justify-end w-full">
                          {/* Proportional colored segments */}
                          <div className="flex h-[6px] rounded-full overflow-hidden gap-px mb-1">
                            {bookedCount > 0 && (
                              <div
                                className="bg-[#16332A] rounded-full"
                                style={{ width: `${(bookedCount / totalSlots) * 100}%` }}
                              />
                            )}
                            {openCount > 0 && (
                              <div
                                className="bg-[#D1E8DF] rounded-full"
                                style={{ width: `${(openCount / totalSlots) * 100}%` }}
                              />
                            )}
                            {offCount > 0 && (
                              <div
                                className="bg-[#FBFBF8] border border-[rgba(30,42,46,.15)] rounded-full"
                                style={{ width: `${(offCount / totalSlots) * 100}%` }}
                              />
                            )}
                          </div>
                          <span className="font-mono text-[9px] text-text-light leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full">
                            {openCount > 0 && `${openCount} open`}
                            {bookedCount > 0 && `${openCount > 0 ? " · " : ""}${bookedCount} booked`}
                          </span>
                        </div>
                      )}

                      {totalSlots > 0 && past && (
                        <div className="flex-1 flex flex-col justify-end w-full">
                          <span className="font-mono text-[9px] text-text-muted leading-tight">
                            {bookedCount > 0 ? `${bookedCount} booked` : "—"}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
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
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-light">
                  <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#e8e8e8]" style={{
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
                  }} />
                  Past
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── RECURRING AVAILABILITY CARD ─── */}
      <div className="mb-8">
        <p className="eyebrow mb-3">{t("availability.recurringLabel")}</p>
        <div className="card-soft p-5 sm:p-6">
          {/* Day-of-week pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => togglePill(setSelectedDays)(i)}
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

          {/* Session-period pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {SESSION_PILLS.map((label) => (
              <button
                key={label}
                onClick={() => toggleSessionPill(label)}
                className={cn(
                  "px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-150",
                  selectedSessions.has(label)
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
                value={blockDateVal}
                min={blockDateMin}
                onChange={(e) => setBlockDateVal(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-border text-sm font-sans text-text bg-white outline-none focus:border-secondary transition-colors"
              />
              <button onClick={handleBlockDate} className="btn-outline !py-2 !px-5 text-sm">
                {t("availability.blockDate")}
              </button>
            </div>

            <button
              onClick={() => { setShowOfmModal(true); computeOfmPreview(); }}
              className="btn-outline !py-2 !px-5 text-sm"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Open full month
            </button>
          </div>
        </div>
      </div>

      {/* ─── SLOT DETAIL POPUP ─── */}
      {showSlotDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowSlotDetail(null)}
        >
          <div
            className="card-soft p-6 w-[320px] animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow mb-2">Booking details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-light">Patient</span>
                <span className="font-medium text-text">{showSlotDetail.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Phone</span>
                <span className="font-mono text-text">{showSlotDetail.patientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Date</span>
                <span className="text-text">{showSlotDetail.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Time</span>
                <span className="text-text">{to12h(showSlotDetail.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Session</span>
                <span className="text-text">{showSlotDetail.sessionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Fee</span>
                <span className="font-medium text-text">Rs {showSlotDetail.fee?.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[11px] text-text-muted mt-3 pt-3 border-t border-border">
              Booked slots cannot be edited here. Use schedule management to reschedule or cancel.
            </p>
            <button
              onClick={() => setShowSlotDetail(null)}
              className="btn-outline !py-1.5 !px-4 text-xs w-full mt-3"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── DAY DRILL-DOWN MODAL (from Monthly view) ─── */}
      <Dialog open={!!drillDownDate} onOpenChange={(open) => { if (!open) setDrillDownDate(null); }}>
        <DialogContent className="sm:max-w-[400px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {drillDownDate && `${FULL_DAYS[drillDownDate.getDay()]}, ${drillDownDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            </DialogTitle>
            <DialogDescription className="text-sm text-text-light">
              Tap a slot to open or block it. Booked slots are view-only.
            </DialogDescription>
          </DialogHeader>

          {drillDownLoading ? (
            <div className="py-8 text-center text-sm text-text-light">Loading slots…</div>
          ) : drillDownDate ? (
            <div className="space-y-[5px]">
              {timeSlots.map((time) => {
                const dk = toDateKey(drillDownDate);
                const key = `${dk}_${time}`;
                const slot = availability[key];
                const state: SlotStatus = slot?.status ?? "off";
                const slotPast = isSlotInPast(dk, time);
                const locked = slotPast;

                return (
                  <div key={time} className="grid grid-cols-[72px_1fr] gap-2 items-center">
                    <span className="font-mono text-[11px] text-text-light text-right pr-1">
                      {to12h(time)}
                    </span>
                    <button
                      onClick={() => toggleDrillDownCell(time)}
                      disabled={locked}
                      className={cn(
                        "h-[42px] rounded-lg transition-all duration-200",
                        locked
                          ? "opacity-40 cursor-not-allowed bg-[#e8e8e8]"
                          : "active:scale-[0.98] active:opacity-80",
                        !locked && slotBg(state)
                      )}
                      style={locked ? {
                        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)",
                      } : undefined}
                      title={locked ? "Can't edit availability in the past" : state === "booked" ? `Booked: ${slot?.patientName}` : state}
                    >
                      {!locked && state === "booked" && slot?.patientName && (
                        <span className="text-[10px] font-mono opacity-80">{slot.patientName}</span>
                      )}
                      {!locked && state !== "booked" && (
                        <span className="text-[11px] font-mono capitalize">{state}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Drill-down legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-light">
              <span className="inline-block w-2 h-2 rounded-full bg-[#16332A]" />
              Booked
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-light">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D1E8DF]" />
              Open
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-light">
              <span className="inline-block w-2 h-2 rounded-full border border-[rgba(30,42,46,.25)] bg-[#FBFBF8]" />
              Off
            </span>
          </div>

          {/* Drill-down actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDrillDownDate(null)}
              className="btn-outline !py-1.5 !px-4 text-xs"
            >
              Cancel
            </button>
            {drillDownDirty.size > 0 && (
              <button
                onClick={commitDrillDown}
                className="btn-secondary !py-1.5 !px-4 text-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Save ({drillDownDirty.size})
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── OPEN FULL MONTH MODAL ─── */}
      <Dialog open={showOfmModal} onOpenChange={setShowOfmModal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Open full month</DialogTitle>
            <DialogDescription className="text-sm text-text-light">
              Bulk-open slots for every matching day in a chosen month.
            </DialogDescription>
          </DialogHeader>

          {/* Month / Year selector */}
          <div className="flex gap-3">
            <select
              value={ofmMonth}
              onChange={(e) => { setOfmMonth(+e.target.value); setOfmConfirmData(null); }}
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={ofmYear}
              onChange={(e) => { setOfmYear(+e.target.value); setOfmConfirmData(null); }}
              className="w-24 px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {[new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Day-of-week pills */}
          <div>
            <p className="text-xs font-medium text-text-light mb-2">Days of week</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => {
                    setOfmDays((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i); else next.add(i);
                      return next;
                    });
                    setOfmConfirmData(null);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150",
                    ofmDays.has(i)
                      ? "bg-secondary text-white"
                      : "bg-white border-[1.5px] border-[rgba(30,42,46,.14)] text-text-light hover:border-secondary hover:text-secondary"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Session-period pills */}
          <div>
            <p className="text-xs font-medium text-text-light mb-2">Session periods</p>
            <div className="flex flex-wrap gap-2">
              {SESSION_PILLS.map((label) => (
                <button
                  key={label}
                  onClick={() => {
                    setOfmSessions((prev) => {
                      const next = new Set(prev);
                      if (next.has(label)) next.delete(label); else next.add(label);
                      return next;
                    });
                    setOfmConfirmData(null);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-all duration-150",
                    ofmSessions.has(label)
                      ? "bg-secondary text-white"
                      : "bg-white border-[1.5px] border-[rgba(30,42,46,.14)] text-text-light hover:border-secondary hover:text-secondary"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Confirmation summary */}
          {ofmConfirmData && (
            <div className="p-3 rounded-xl bg-surface/60 text-sm text-text">
              This will open{" "}
              <span className="font-semibold text-secondary">
                {ofmConfirmData.total - ofmConfirmData.booked} slot{ofmConfirmData.total - ofmConfirmData.booked !== 1 ? "s" : ""}
              </span>{" "}
              across {MONTH_NAMES[ofmMonth]}.{" "}
              {ofmConfirmData.booked > 0 && (
                <>
                  <span className="font-semibold text-text-light">
                    {ofmConfirmData.booked} existing booking(s)
                  </span>{" "}
                  will be left untouched.{" "}
                </>
              )}
              {ofmConfirmData.skippedPast > 0 && (
                <span className="font-semibold text-text-light">
                  Past dates were skipped ({ofmConfirmData.skippedPast} slot{ofmConfirmData.skippedPast > 1 ? "s" : ""}).
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {!ofmConfirmData ? (
              <button
                onClick={computeOfmPreview}
                className="btn-secondary !py-2 !px-5 text-sm"
              >
                Preview
              </button>
            ) : (
              <button
                onClick={executeOpenFullMonth}
                disabled={ofmApplying}
                className="btn-secondary !py-2 !px-5 text-sm"
              >
                {ofmApplying ? "Applying…" : "Confirm & apply"}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
