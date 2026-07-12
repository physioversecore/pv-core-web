"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { to12h } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Check,
  X,
  Ban,
} from "lucide-react";
import type { ScheduleAppointment } from "@/hooks/useTherapistSchedule";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const HOURS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

const WEEKEND_AVAILABLE = true;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isTodayStr(dateStr: string): boolean {
  const today = new Date();
  return toDateStr(today.getFullYear(), today.getMonth(), today.getDate()) === dateStr;
}

function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return d < today;
}

function getWeeksInMonth(year: number, month: number): string[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  for (let i = 0; i < firstDay; i++) {
    currentWeek.push("");
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(toDateStr(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push("");
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function getWeekIndexForDate(year: number, month: number, dateStr: string): number {
  const weeks = getWeeksInMonth(year, month);
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].includes(dateStr)) return i;
  }
  return 0;
}

function getMonthWeeks(year: number, month: number): { date: string; dayNum: number; isCurrentMonth: boolean }[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weeks: { date: string; dayNum: number; isCurrentMonth: boolean }[][] = [];
  let currentWeek: { date: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrevMonth - firstDay + 1 + i;
    currentWeek.push({ date: toDateStr(prevYear, prevMonth, d), dayNum: d, isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push({ date: toDateStr(year, month, day), dayNum: day, isCurrentMonth: true });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      currentWeek.push({ date: toDateStr(nextYear, nextMonth, nextDay), dayNum: nextDay, isCurrentMonth: false });
      nextDay++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export interface ScheduleCalendarProps {
  appointments: ScheduleAppointment[];
  isLoading?: boolean;
  isAdmin?: boolean;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  emptyMessage?: string;
}

function WeekSkeleton() {
  return (
    <div className="card-soft overflow-x-auto">
      <div className="grid grid-cols-[72px_repeat(7,1fr)] min-w-[780px]">
        <div className="border-b border-r border-border p-2.5">
          <Skeleton className="h-3 w-10" />
        </div>
        {DAYS.map((d) => (
          <div key={d} className="border-b border-r border-border p-2.5 text-center">
            <Skeleton className="h-3 w-8 mx-auto" />
          </div>
        ))}
        {HOURS.map((h) => (
          <div key={h} className="contents">
            <div className="border-r border-b border-border p-2.5 flex items-start justify-center pt-3">
              <Skeleton className="h-3 w-12" />
            </div>
            {DAYS.map((_, di) => (
              <div key={di + h} className="border-b border-r border-border p-1.5 min-h-[68px]">
                {Math.random() > 0.6 && (
                  <Skeleton className="h-12 w-full rounded-lg" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthSkeleton() {
  return (
    <div className="card-soft overflow-x-auto">
      <div className="min-w-[780px]">
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d) => (
            <div key={d} className="p-2.5 text-center border-r border-border last:border-r-0">
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {Array.from({ length: 7 }).map((_, di) => (
              <div key={di} className="border-r border-border last:border-r-0 p-1.5 min-h-[88px]">
                <Skeleton className="h-3 w-4 mx-auto mb-1" />
                {Math.random() > 0.5 && <Skeleton className="h-8 w-full rounded mb-0.5" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScheduleCalendar({
  appointments,
  isLoading = false,
  isAdmin = false,
  onAccept,
  onDecline,
  emptyMessage,
}: ScheduleCalendarProps) {
  const { t } = useLang();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");

  const weeks = useMemo(() => getWeeksInMonth(selectedYear, selectedMonth), [selectedYear, selectedMonth]);
  const monthWeeks = useMemo(() => getMonthWeeks(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const defaultWeekIdx = useMemo(
    () => getWeekIndexForDate(selectedYear, selectedMonth, todayStr),
    [selectedYear, selectedMonth, todayStr]
  );

  const [currentWeekIndex, setCurrentWeekIndex] = useState(defaultWeekIdx);

  useEffect(() => {
    const clamped = Math.min(currentWeekIndex, weeks.length - 1);
    if (clamped !== currentWeekIndex) {
      setCurrentWeekIndex(Math.max(0, clamped));
    }
  }, [weeks.length, currentWeekIndex]);

  const safeWeekIndex = Math.min(currentWeekIndex, weeks.length - 1);
  const currentWeekDates = weeks[safeWeekIndex] || [];
  const weekStart = currentWeekDates.find(Boolean);
  const weekEnd = [...currentWeekDates].reverse().find(Boolean);

  const getAppointmentsForDate = useCallback(
    (dateStr: string) => appointments.filter((s) => s.date === dateStr),
    [appointments]
  );

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex((i) => i - 1);
    } else {
      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      setSelectedMonth(prevMonth);
      setSelectedYear(prevYear);
      const prevWeeks = getWeeksInMonth(prevYear, prevMonth);
      setCurrentWeekIndex(prevWeeks.length - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex((i) => i + 1);
    } else {
      const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
      const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      setSelectedMonth(nextMonth);
      setSelectedYear(nextYear);
      setCurrentWeekIndex(0);
    }
  };

  const handlePrevMonth = () => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    setSelectedMonth(prevMonth);
    setSelectedYear(prevYear);
    setCurrentWeekIndex(0);
  };

  const handleNextMonth = () => {
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    setCurrentWeekIndex(0);
  };

  const handleDecideLocal = (id: string, accept: boolean) => {
    if (accept) {
      onAccept?.(id);
    } else {
      onDecline?.(id);
    }
  };

  const formatWeekLabel = () => {
    if (!weekStart || !weekEnd) return "";
    const s = new Date(weekStart + "T00:00:00");
    const e = new Date(weekEnd + "T00:00:00");
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}, ${selectedYear}`;
  };

  const statusColor = (status: string, isPastSess: boolean) => {
    if (isPastSess) return { bg: "bg-[#e5e7eb]", text: "text-[#6b7280]", border: "border-[#d1d5db]" };
    switch (status) {
      case "confirmed": return { bg: "bg-secondary", text: "text-white", border: "border-secondary" };
      case "pending": return { bg: "bg-primary/15", text: "text-primary", border: "border-primary/30" };
      case "completed": return { bg: "bg-[#e5e7eb]", text: "text-[#6b7280]", border: "border-[#d1d5db]" };
      case "cancelled": return { bg: "bg-danger/10", text: "text-danger", border: "border-danger/20" };
      default: return { bg: "bg-surface", text: "text-text", border: "border-border" };
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "home_visit": return <MapPin className="w-3 h-3" />;
      case "follow_up": return <Clock className="w-3 h-3" />;
      case "assessment": return <Calendar className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatTypeLabel = (type: string) => {
    switch (type) {
      case "home_visit": return t("therapist_dashboard.homeVisit");
      case "follow_up": return "Follow-up";
      case "assessment": return "Assessment";
      default: return type;
    }
  };

  const AppointmentCard = ({ apt }: { apt: ScheduleAppointment }) => {
    const past = isPastDate(apt.date);
    const colors = statusColor(apt.status, past);
    const truncatedAddr = apt.address.length > 16 ? apt.address.slice(0, 16) + "…" : apt.address;
    const patientLabel = apt.patient || "Patient";

    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
            className={`rounded-lg p-2 text-xs cursor-pointer transition-all duration-150 hover:shadow-md border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-semibold truncate leading-tight">{patientLabel.split(" ")[0]}</span>
              {apt.status === "pending" && !past && !isAdmin && (
                <span className="ml-auto flex gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDecideLocal(apt.id, true); }}
                    className="w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-secondary-hover transition-colors"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDecideLocal(apt.id, false); }}
                    className="w-4 h-4 rounded-full border border-danger text-danger flex items-center justify-center hover:bg-danger/10 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-75 leading-tight">
              {typeIcon(apt.type)}
              <span>{to12h(apt.time)}</span>
            </div>
            <div className="opacity-50 text-[10px] mt-0.5 truncate leading-tight">
              {truncatedAddr}
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          sideOffset={6}
          className="w-72 p-0 overflow-hidden rounded-xl border-border shadow-lg z-[1100]"
        >
          <div className={`px-4 py-3 ${past ? "bg-[#f3f4f6]" : apt.status === "confirmed" ? "bg-secondary" : apt.status === "pending" ? "bg-primary-light" : "bg-[#f3f4f6]"}`}>
            <p className={`font-semibold text-sm ${past ? "text-text" : apt.status === "confirmed" ? "text-white" : "text-primary"}`}>
              {patientLabel}
            </p>
            <p className={`text-xs mt-0.5 ${past ? "text-text-light" : apt.status === "confirmed" ? "text-white/75" : "text-primary/70"}`}>
              {formatTypeLabel(apt.type)} · {to12h(apt.time)}
            </p>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {apt.phone && (
              <div className="flex items-center gap-2 text-xs text-text-light">
                <Phone className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                <span>{apt.phone}</span>
              </div>
            )}
            {apt.address && (
              <div className="flex items-center gap-2 text-xs text-text-light">
                <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                <span>{apt.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-text-light">
              <Calendar className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <span>{new Date(apt.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}</span>
            </div>
            {apt.status === "pending" && !past && (
              <div className="flex gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => handleDecideLocal(apt.id, true)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary-hover transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t("therapist_dashboard.confirmAction")}
                </button>
                <button
                  onClick={() => handleDecideLocal(apt.id, false)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-danger text-danger text-xs font-semibold hover:bg-danger/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {t("therapist_dashboard.declineAction")}
                </button>
              </div>
            )}
            {!past && apt.status === "confirmed" && (
              <div className="pt-1 border-t border-border">
                <span className="badge-success text-[10px]">{t("therapist_dashboard.confirmed")}</span>
              </div>
            )}
            {past && (
              <div className="pt-1 border-t border-border">
                <span className="chip text-[10px]">{t("therapist_dashboard.completed")}</span>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  if (isLoading) {
    return viewMode === "weekly" ? <WeekSkeleton /> : <MonthSkeleton />;
  }

  const hasNoAppointments = appointments.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-surface rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
              viewMode === "weekly" ? "bg-white text-secondary shadow-sm" : "text-text-light hover:text-text"
            }`}
          >
            {t("therapist_dashboard.weeklyView")}
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
              viewMode === "monthly" ? "bg-white text-secondary shadow-sm" : "text-text-light hover:text-text"
            }`}
          >
            {t("therapist_dashboard.monthlyView")}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-surface transition-colors"
            title={t("therapist_dashboard.previousMonth")}
          >
            <ChevronLeft className="w-4 h-4 text-text-light" />
          </button>
          <div className="flex items-center gap-1.5">
            <select
              value={selectedMonth}
              onChange={(e) => {
                const m = Number(e.target.value);
                setSelectedMonth(m);
                setCurrentWeekIndex(0);
              }}
              className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs font-semibold text-text cursor-pointer focus:outline-none focus:border-primary"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                const y = Number(e.target.value);
                setSelectedYear(y);
                setCurrentWeekIndex(0);
              }}
              className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs font-semibold text-text cursor-pointer focus:outline-none focus:border-primary"
            >
              {Array.from({ length: 11 }, (_, i) => now.getFullYear() - 3 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-surface transition-colors"
            title={t("therapist_dashboard.nextMonth")}
          >
            <ChevronRight className="w-4 h-4 text-text-light" />
          </button>
          <button
            onClick={() => {
              setSelectedMonth(now.getMonth());
              setSelectedYear(now.getFullYear());
              setCurrentWeekIndex(getWeekIndexForDate(now.getFullYear(), now.getMonth(), todayStr));
            }}
            className="ml-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-primary bg-primary-light hover:bg-primary/20 transition-colors"
          >
            {t("therapist_dashboard.todayLabel")}
          </button>
        </div>

        {viewMode === "weekly" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-surface transition-colors"
              title={t("therapist_dashboard.previousWeek")}
            >
              <ChevronLeft className="w-4 h-4 text-text-light" />
            </button>
            <p className="eyebrow whitespace-nowrap">
              {t("therapist_dashboard.scheduleWeek")} {formatWeekLabel()}
            </p>
            <button
              onClick={handleNextWeek}
              className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-surface transition-colors"
              title={t("therapist_dashboard.nextWeek")}
            >
              <ChevronRight className="w-4 h-4 text-text-light" />
            </button>
          </div>
        )}
      </div>

      {hasNoAppointments && !isLoading ? (
        <div className="card-soft p-12 text-center">
          <Calendar className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-text">
            {emptyMessage || t("therapist_dashboard.noAppointments")}
          </p>
          <p className="text-xs text-text-light mt-1">
            {t("therapist_dashboard.noAppointmentsDesc")}
          </p>
        </div>
      ) : viewMode === "weekly" ? (
        <div className="card-soft overflow-x-auto">
          <div className="grid grid-cols-[72px_repeat(7,1fr)] min-w-[780px]">
            <div className="border-b border-r border-border p-2.5 text-[10px] font-mono text-text-muted uppercase tracking-wider">
              {t("therapist_dashboard.timeHeader")}
            </div>
            {DAYS.map((d, i) => {
              const dateStr = currentWeekDates[i];
              const isToday = dateStr ? isTodayStr(dateStr) : false;
              const isWeekend = i >= 5;
              const isUnavailable = isWeekend && !WEEKEND_AVAILABLE;
              return (
                <div
                  key={d}
                  className={`border-b border-r border-border p-2.5 text-center ${
                    isToday ? "bg-primary/5" : ""
                  } ${isUnavailable ? "bg-[#f9fafb]" : ""}`}
                >
                  <div className={`text-xs font-semibold ${isToday ? "text-primary" : "text-text"}`}>{d}</div>
                  {dateStr && (
                    <div className={`text-[10px] mt-0.5 ${isToday ? "text-primary font-bold" : "text-text-muted"}`}>
                      {new Date(dateStr + "T00:00:00").getDate()}
                    </div>
                  )}
                  {isUnavailable && (
                    <div className="text-[9px] text-text-muted mt-0.5">{t("therapist_dashboard.unavailable")}</div>
                  )}
                </div>
              );
            })}
            {HOURS.map((h) => (
              <div key={h} className="contents">
                <div className="border-r border-b border-border p-2.5 text-[11px] font-mono text-text-muted text-center flex items-start justify-center pt-3">
                  {to12h(h)}
                </div>
                {DAYS.map((_, di) => {
                  const dateStr = currentWeekDates[di];
                  const apts = dateStr ? getAppointmentsForDate(dateStr).filter((a) => a.time === h) : [];
                  const isToday = dateStr ? isTodayStr(dateStr) : false;
                  const isWeekend = di >= 5;
                  const isUnavailable = isWeekend && !WEEKEND_AVAILABLE;
                  return (
                    <div
                      key={di + h}
                      className={`border-b border-r border-border p-1.5 min-h-[68px] ${
                        isToday ? "bg-primary/[0.03]" : ""
                      } ${isUnavailable ? "bg-[#fafafa]" : ""}`}
                    >
                      {isUnavailable ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-[#e5e7eb]/60 flex items-center justify-center">
                            <Ban className="w-3 h-3 text-text-muted" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {apts.map((apt) => (
                            <AppointmentCard key={apt.id} apt={apt} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-soft overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS.map((d) => (
                  <div
                    key={d}
                    className="p-2.5 text-center border-r border-border last:border-r-0"
                  >
                    <div className="text-xs font-semibold text-text">{d}</div>
                  </div>
                ))}
            </div>
            {monthWeeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
                {week.map((day, di) => {
                  const apts = getAppointmentsForDate(day.date);
                  const isToday = isTodayStr(day.date);
                  const isWeekend = di >= 5;
                  const isUnavailable = isWeekend && !WEEKEND_AVAILABLE;
                  return (
                    <div
                      key={di}
                      className={`border-r border-border last:border-r-0 p-1.5 min-h-[88px] ${
                        !day.isCurrentMonth ? "bg-[#fafafa]" : ""
                      } ${isToday ? "bg-primary/[0.03]" : ""} ${isUnavailable ? "bg-[#f9fafb]" : ""}`}
                    >
                      <div
                        className={`text-[11px] font-semibold mb-1 text-center ${
                          !day.isCurrentMonth ? "text-text-muted" : isToday ? "text-primary" : "text-text"
                        }`}
                      >
                        {isToday ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px]">
                            {day.dayNum}
                          </span>
                        ) : (
                          day.dayNum
                        )}
                      </div>
                      {isUnavailable && day.isCurrentMonth ? (
                        <div className="flex items-center justify-center mt-1">
                          <Ban className="w-3 h-3 text-text-muted/50" />
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {apts.slice(0, 3).map((apt) => (
                            <AppointmentCard key={apt.id} apt={apt} />
                          ))}
                          {apts.length > 3 && (
                            <div className="text-[9px] text-text-muted text-center font-mono">
                              +{apts.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-[11px] text-text-light">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-secondary" />
          <span>{t("therapist_dashboard.confirmed")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary/30 border border-primary/40" />
          <span>{t("therapist_dashboard.pending")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#e5e7eb]" />
          <span>{t("therapist_dashboard.completed")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#f9fafb] border border-border" />
          <span>{t("therapist_dashboard.unavailable")}</span>
        </div>
      </div>
    </div>
  );
}
