"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { cn } from "@/utils/cn";
import { to12h } from "@/lib/format";
import { ChevronLeft, ChevronRight, CalendarDays, Check, X, Trash2, MoreHorizontal, CalendarClock, CalendarOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAvailability, useCountOpenSlots } from "@/hooks/useAvailability";
import {
  sessionPeriodForTime,
  dateKeyStr,
  isDateInPast,
  isSlotInPast,
  DEFAULT_SLOT_INTERVAL,
  type SlotInfo,
  type SlotStatus,
} from "@/lib/availability-utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const SESSION_PILLS = ["Morning", "Afternoon", "Evening"] as const;
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

export default function ManageAvailability() {
  const { t } = useLang();
  const countOpenSlots = useCountOpenSlots();

  const {
    workingHours,
    updateWorkingHours,
    timeSlots,
    availability,
    setAvailability,
    dirtySlots,
    setDirtySlots,
    loading,
    loadMonth,
    setSlotStatus: setSlotStatusHook,
    blockWholeDay: blockWholeDayApi,
    handleBlockDate: handleBlockDateApi,
    getMonthSummaries,
    recurringPatterns,
    saveRecurring,
    isSavingRecurring,
    deleteRecurring,
    openFullMonth: openFullMonthApi,
    isOpeningMonth,
    applySchedule: applyScheduleApi,
    isApplyingSchedule,
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

  // Load months needed for week view
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

  const monthDaySummaries = useMemo(
    () => getMonthSummaries(monthGrid),
    [getMonthSummaries, monthGrid]
  );

  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [blockDateVal, setBlockDateVal] = useState("");
  const [flashingCols, setFlashingCols] = useState<Set<number>>(new Set());

  const [showOfmModal, setShowOfmModal] = useState(false);
  const [showBlockDateModal, setShowBlockDateModal] = useState(false);
  const [ofmMonth, setOfmMonth] = useState(new Date().getMonth());
  const [ofmYear, setOfmYear] = useState(new Date().getFullYear());
  const [ofmDays, setOfmDays] = useState<Set<number>>(new Set([1, 3, 5]));
  const [ofmSessions, setOfmSessions] = useState<Set<string>>(new Set(["Morning"]));
  const [ofmConfirmData, setOfmConfirmData] = useState<{ total: number; booked: number; skippedPast: number } | null>(null);

  const [showSlotDetail, setShowSlotDetail] = useState<SlotInfo | null>(null);

  const [drillDownDate, setDrillDownDate] = useState<Date | null>(null);
  const [drillDownDirty, setDrillDownDirty] = useState<Set<string>>(new Set());
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  const [whStart, setWhStart] = useState(workingHours.start);
  const [whEnd, setWhEnd] = useState(workingHours.end);
  const [whInterval, setWhInterval] = useState(workingHours.slotInterval ?? DEFAULT_SLOT_INTERVAL);
  const [scheduleRecurrence, setScheduleRecurrence] = useState("weekly");
  const [scheduleDateFrom, setScheduleDateFrom] = useState("");
  const [scheduleDateTo, setScheduleDateTo] = useState("");

  const SLOT_INTERVAL_OPTIONS = [
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hr" },
    { value: 90, label: "1.5 hr" },
    { value: 120, label: "2 hr" },
    { value: 180, label: "3 hr" },
    { value: 240, label: "4 hr" },
    { value: 360, label: "6 hr" },
    { value: 480, label: "8 hr" },
  ];

  const TIME_OPTIONS = useMemo(() => {
    const opts: string[] = [];
    for (let h = 0; h < 24; h++) {
      opts.push(`${String(h).padStart(2, "0")}:00`);
    }
    return opts;
  }, []);

  useEffect(() => {
    setWhStart(workingHours.start);
    setWhEnd(workingHours.end);
    setWhInterval(workingHours.slotInterval ?? DEFAULT_SLOT_INTERVAL);
  }, [workingHours]);

  const saveAndApplyHandler = useCallback(async () => {
    if (whStart >= whEnd) {
      toast.error("Start time must be before end time");
      return;
    }
    try {
      await updateWorkingHours({ start: whStart, end: whEnd, slotInterval: whInterval });
      const result = await applyScheduleApi({
        recurrence: scheduleRecurrence,
        dateFrom: scheduleRecurrence === "range" ? scheduleDateFrom : undefined,
        dateTo: scheduleRecurrence === "range" ? scheduleDateTo : undefined,
      });
      let msg = `Schedule saved & applied: ${result.opened} slot(s) opened`;
      if (result.skippedBooked > 0) msg += `, ${result.skippedBooked} booking(s) kept`;
      if (result.skippedPast > 0) msg += `, ${result.skippedPast} past slot(s) skipped`;
      toast.success(msg);
    } catch {
      toast.error("Failed to save schedule");
    }
  }, [whStart, whEnd, whInterval, scheduleRecurrence, scheduleDateFrom, scheduleDateTo, updateWorkingHours, applyScheduleApi]);

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
    setSlotStatusHook(dk, time, next);
  }, [weekDays, timeSlots, availability, setSlotStatusHook]);

  const blockWholeDay = useCallback(
    async (col: number) => {
      const day = weekDays[col];
      const dk = toDateKey(day);
      if (isDateInPast(dk)) {
        toast.info("Can't edit availability in the past");
        return;
      }
      const updates: { date: string; time: string; status: SlotStatus }[] = [];
      for (const time of timeSlots) {
        if (isSlotInPast(dk, time)) continue;
        const key = `${dk}_${time}`;
        const current = availability[key];
        if (current?.status === "booked") continue;
        updates.push({ date: dk, time, status: "off" });
      }
      setAvailability((prev) => {
        const next = { ...prev };
        for (const u of updates) {
          const k = `${u.date}_${u.time}`;
          const existing = next[k];
          next[k] = { ...existing, date: u.date, time: u.time, status: u.status, sessionType: sessionPeriodForTime(u.time) };
        }
        return next;
      });
      setDirtySlots((prev) => { const s = new Set(prev); for (const u of updates) s.add(`${u.date}_${u.time}`); return s; });

      try {
        const { bulkUpdateSlots } = await import("@/services/api/availability");
        await bulkUpdateSlots(updates);
      } catch {
        // silent
      }

      setFlashingCols(new Set([col]));
      setTimeout(() => setFlashingCols(new Set()), 400);
      toast.success(`${FULL_DAYS[day.getDay()]} marked as off`);
    },
    [weekDays, timeSlots, availability, setAvailability, setDirtySlots]
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

  const saveRecurringHandler = useCallback(async () => {
    if (selectedDays.size === 0 || selectedSessions.size === 0) {
      toast.error("Select at least one day and one session period");
      return;
    }
    try {
      const result = await saveRecurring({
        days: [...selectedDays],
        sessions: [...selectedSessions],
      });
      const dayNames = [...selectedDays].map((i) => DAYS[i]).join(", ");
      let msg = `Recurring pattern saved: ${dayNames} — ${[...selectedSessions].join(", ")} (${result.affected} slots)`;
      if (result.skippedPast > 0) msg += `. ${result.skippedPast} past slot(s) were skipped.`;
      toast.success(msg);
      setSelectedDays(new Set());
      setSelectedSessions(new Set());
    } catch {
      toast.error("Failed to save recurring pattern");
    }
  }, [selectedDays, selectedSessions, saveRecurring]);

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
    try {
      await handleBlockDateApi(dk, sessions);
      const d = new Date(dk + "T00:00:00");
      let msg = `${FULL_DAYS[d.getDay()]} ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} marked as off`;
      if (sessions) msg += ` (${sessions.join(", ")})`;
      toast.success(msg);
      setBlockDateVal("");
    } catch {
      toast.error("Failed to block date");
    }
  }, [blockDateVal, selectedSessions, handleBlockDateApi]);

  const computeOfmPreview = useCallback(() => {
    const result = countOpenSlots(ofmYear, ofmMonth, [...ofmDays], [...ofmSessions], workingHours, availability);
    setOfmConfirmData(result);
  }, [ofmYear, ofmMonth, ofmDays, ofmSessions, workingHours, availability, countOpenSlots]);

  const executeOpenFullMonth = useCallback(async () => {
    try {
      const result = await openFullMonthApi({
        days: [...ofmDays],
        sessions: [...ofmSessions],
        month: ofmMonth,
        year: ofmYear,
      });
      const data = ofmConfirmData ?? { total: 0, booked: 0, skippedPast: 0 };
      let msg = `Opened ${data.total - data.booked} slots in ${MONTH_NAMES[ofmMonth]}. ${data.booked} booking(s) left untouched.`;
      if (data.skippedPast > 0) msg += ` Past dates were skipped (${data.skippedPast} slot${data.skippedPast > 1 ? "s" : ""}).`;
      toast.success(msg);
      setShowOfmModal(false);
      setOfmConfirmData(null);
    } catch {
      toast.error("Failed to open full month");
    }
  }, [ofmDays, ofmSessions, ofmMonth, ofmYear, openFullMonthApi, ofmConfirmData]);

  const openDrillDown = useCallback(async (date: Date) => {
    const dk = toDateKey(date);
    if (isDateInPast(dk)) return;

    setDrillDownDate(date);
    setDrillDownDirty(new Set());

    const hasData = timeSlots.some((t) => availability[`${dk}_${t}`]);
    if (!hasData) {
      setDrillDownLoading(true);
      try {
        await loadMonth(date.getFullYear(), date.getMonth());
      } catch {
        // silent
      }
      setDrillDownLoading(false);
    }
  }, [timeSlots, availability, loadMonth]);

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
    setSlotStatusHook(dk, time, next);
    setDrillDownDirty((prev) => { const s = new Set(prev); s.add(key); return s; });
  }, [drillDownDate, availability, setSlotStatusHook]);

  const commitDrillDown = useCallback(async () => {
    const promises: Promise<void>[] = [];
    for (const key of drillDownDirty) {
      const slot = availability[key];
      if (slot) {
        promises.push(
          import("@/services/api/availability").then((m) =>
            m.setSlotStatus(slot.date, slot.time, slot.status)
          )
        );
      }
    }
    await Promise.all(promises);
    setDirtySlots((prev) => {
      const s = new Set(prev);
      for (const k of drillDownDirty) s.delete(k);
      return s;
    });
    setDrillDownDirty(new Set());
    toast.success(`${drillDownDirty.size} slot(s) updated`);
    setDrillDownDate(null);
  }, [drillDownDirty, availability, setDirtySlots]);

  const slotBg = (status: SlotStatus) => {
    if (status === "booked") return "bg-[#16332A] text-white";
    if (status === "open") return "bg-[#D1E8DF] text-[#1E2A2E]";
    return "bg-[#FBFBF8] border-[1.5px] border-[rgba(30,42,46,.12)] text-[#4A5854]";
  };

  const todayStr = useMemo(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  }, []);

  const blockDateMin = todayStr;

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <p className="eyebrow mb-2">{t("availability.schedule")}</p>
          <h1 className="text-[28px] font-display text-text leading-tight">
            {t("availability.title")}
          </h1>
        </div>
      </div>

      {/* ─── SCHEDULE CONFIG ─── */}
      <div className="card-soft p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.startTime")}</label>
            <select
              value={whStart}
              onChange={(e) => setWhStart(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <span className="text-text-light pb-2">—</span>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.endTime")}</label>
            <select
              value={whEnd}
              onChange={(e) => setWhEnd(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.slotInterval")}</label>
            <select
              value={whInterval}
              onChange={(e) => setWhInterval(+e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {SLOT_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/*<div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.applyScheduleLabel")}</label>
            <select
              value={scheduleRecurrence}
              onChange={(e) => setScheduleRecurrence(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="weekly">{t("availability.thisWeek")}</option>
              <option value="monthly">{t("availability.thisMonth")}</option>
              <option value="yearly">{t("availability.thisYear")}</option>
              <option value="range">{t("availability.dateRange")}</option>
            </select>
          </div>*/}
          {/*{scheduleRecurrence === "range" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.from")}</label>
                <input
                  type="date"
                  value={scheduleDateFrom}
                  onChange={(e) => setScheduleDateFrom(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-text-light">{t("availability.to")}</label>
                <input
                  type="date"
                  value={scheduleDateTo}
                  onChange={(e) => setScheduleDateTo(e.target.value)}
                  min={scheduleDateFrom}
                  className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </>
          )}*/}
          <button
            onClick={saveAndApplyHandler}
            disabled={isApplyingSchedule}
            className="btn-secondary !py-2 !px-6 text-sm"
          >
            {isApplyingSchedule ? (
              <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> {t("availability.saving")}</span>
            ) : t("availability.saveAndApply")}
          </button>
        </div>
        <p className="text-xs text-text-light">{t("availability.workingHoursDesc")}</p>
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
              {t("availability.weekly")}
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
              {t("availability.monthly")}
            </button>
          </div>

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

            {loading ? (
              <div className="py-12 text-center text-sm text-text-light">{t("availability.loading")}</div>
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
              {t("availability.past")}
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════ MONTHLY GRID ═══════════════ */}
      {viewMode === "month" && (
        <div className="card-soft p-4 sm:p-6 mb-8">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-light">{t("availability.loadingMonth")}</div>
          ) : (
            <>
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
                  {t("availability.past")}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── SECONDARY ACTIONS ─── */}
      <div className="mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="btn-outline !py-2 !px-4 text-sm flex items-center gap-2">
              <MoreHorizontal className="w-4 h-4" />
              {t("availability.moreActions")}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => { setShowOfmModal(true); computeOfmPreview(); }}>
              <CalendarClock className="w-4 h-4 mr-2" />
              {t("availability.openFullMonth")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowBlockDateModal(true)}>
              <CalendarOff className="w-4 h-4 mr-2" />
              {t("availability.blockDate")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ─── RECURRING PATTERNS ─── */}
      {recurringPatterns.length > 0 && (
        <div className="mb-8">
          <p className="eyebrow mb-3">{t("availability.savedPatterns")}</p>
          <div className="card-soft p-4">
            <div className="space-y-2">
              {recurringPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors",
                    pattern.isActive
                      ? "border-secondary/30 bg-secondary/5"
                      : "border-border bg-white/50 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {pattern.days.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono text-[10px] uppercase"
                        >
                          {DAYS[d]}
                        </span>
                      ))}
                    </div>
                    <span className="text-text-muted">·</span>
                    <div className="flex gap-1">
                      {pattern.sessions.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-full bg-surface text-text-light font-mono text-[10px] uppercase"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecurring(pattern.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    title={t("availability.deletePattern")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
            <p className="eyebrow mb-2">{t("availability.bookingDetails")}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-light">{t("availability.patient")}</span>
                <span className="font-medium text-text">{showSlotDetail.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">{t("availability.phone")}</span>
                <span className="font-mono text-text">{showSlotDetail.patientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">{t("availability.date")}</span>
                <span className="text-text">{showSlotDetail.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">{t("availability.time")}</span>
                <span className="text-text">{to12h(showSlotDetail.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">{t("availability.session")}</span>
                <span className="text-text">{showSlotDetail.sessionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">{t("availability.fee")}</span>
                <span className="font-medium text-text">Rs {showSlotDetail.fee?.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[11px] text-text-muted mt-3 pt-3 border-t border-border">
              {t("availability.bookedEditNote")}
            </p>
            <button
              onClick={() => setShowSlotDetail(null)}
              className="btn-outline !py-1.5 !px-4 text-xs w-full mt-3"
            >
              {t("availability.close")}
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
              {t("availability.drillDownDesc")}
            </DialogDescription>
          </DialogHeader>

          {drillDownLoading ? (
            <div className="py-8 text-center text-sm text-text-light">{t("availability.loadingSlots")}</div>
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

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-light">
              <span className="inline-block w-2 h-2 rounded-full bg-[#16332A]" />
              {t("availability.booked")}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-light">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D1E8DF]" />
              {t("availability.open")}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-light">
              <span className="inline-block w-2 h-2 rounded-full border border-[rgba(30,42,46,.25)] bg-[#FBFBF8]" />
              {t("availability.off")}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDrillDownDate(null)}
              className="btn-outline !py-1.5 !px-4 text-xs"
            >
              {t("availability.cancel")}
            </button>
            {drillDownDirty.size > 0 && (
              <button
                onClick={commitDrillDown}
                className="btn-secondary !py-1.5 !px-4 text-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                {t("availability.save")} ({drillDownDirty.size})
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── BLOCK DATE MODAL ─── */}
      <Dialog open={showBlockDateModal} onOpenChange={setShowBlockDateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{t("availability.blockDate")}</DialogTitle>
            <DialogDescription className="text-text-light text-sm">Select a date to block all slots.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <input
              type="date"
              value={blockDateVal}
              min={blockDateMin}
              onChange={(e) => setBlockDateVal(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowBlockDateModal(false)}
                className="btn-outline !py-1.5 !px-4 text-xs"
              >
                {t("availability.cancel")}
              </button>
              <button
                onClick={async () => {
                  await handleBlockDate();
                  setShowBlockDateModal(false);
                }}
                className="btn-secondary !py-1.5 !px-4 text-xs"
              >
                {t("availability.blockDate")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── OPEN FULL MONTH MODAL ─── */}
      <Dialog open={showOfmModal} onOpenChange={setShowOfmModal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{t("availability.openFullMonth")}</DialogTitle>
            <DialogDescription className="text-sm text-text-light">
              {t("availability.openFullMonthDesc")}
            </DialogDescription>
          </DialogHeader>

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

          <div>
            <p className="text-xs font-medium text-text-light mb-2">{t("availability.daysOfWeek")}</p>
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

          <div>
            <p className="text-xs font-medium text-text-light mb-2">{t("availability.sessionPeriods")}</p>
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

          {ofmConfirmData && (
            <div className="p-3 rounded-xl bg-surface/60 text-sm text-text">
              {t("availability.willOpen")}{" "}
              <span className="font-semibold text-secondary">
                {ofmConfirmData.total - ofmConfirmData.booked} {t("availability.slots")}
              </span>{" "}
              {t("availability.across")} {MONTH_NAMES[ofmMonth]}.{" "}
              {ofmConfirmData.booked > 0 && (
                <>
                  <span className="font-semibold text-text-light">
                    {ofmConfirmData.booked} {t("availability.existingBookings")}
                  </span>{" "}
                  {t("availability.leftUntouched")}{" "}
                </>
              )}
              {ofmConfirmData.skippedPast > 0 && (
                <span className="font-semibold text-text-light">
                  {t("availability.pastSkipped")} ({ofmConfirmData.skippedPast} {t("availability.slots")}).
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {!ofmConfirmData ? (
              <button
                onClick={computeOfmPreview}
                className="btn-secondary !py-2 !px-5 text-sm"
              >
                {t("availability.preview")}
              </button>
            ) : (
              <button
                onClick={executeOpenFullMonth}
                disabled={isOpeningMonth}
                className="btn-secondary !py-2 !px-5 text-sm"
              >
                {isOpeningMonth ? t("availability.applying") : t("availability.confirmApply")}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
