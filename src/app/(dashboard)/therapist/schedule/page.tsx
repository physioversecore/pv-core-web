"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { to12h } from "@/lib/format";
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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const HOURS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  patient: string;
  phone: string;
  address: string;
  type: "home_visit" | "follow_up" | "assessment";
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "a1", date: "2026-07-06", time: "09:00", status: "confirmed", patient: "Ramesh Adhikari", phone: "+977 9841-234567", address: "Baneshwor, Kathmandu", type: "home_visit" },
  { id: "a2", date: "2026-07-06", time: "11:00", status: "completed", patient: "Sita Lama", phone: "+977 9851-345678", address: "Lalitpur, Patan", type: "follow_up" },
  { id: "a3", date: "2026-07-07", time: "10:00", status: "pending", patient: "Anita Sharma", phone: "+977 9861-456789", address: "New Baneshwor, Kathmandu", type: "home_visit" },
  { id: "a4", date: "2026-07-07", time: "14:00", status: "confirmed", patient: "Hari Prasad", phone: "+977 9871-567890", address: "Bhaktapur Durbar Area", type: "assessment" },
  { id: "a5", date: "2026-07-08", time: "09:00", status: "completed", patient: "Krishna Bahadur", phone: "+977 9881-678901", address: "Patan Dhoka, Lalitpur", type: "home_visit" },
  { id: "a6", date: "2026-07-08", time: "15:00", status: "pending", patient: "Gita Thapa", phone: "+977 9841-789012", address: "Kamaladi, Kathmandu", type: "follow_up" },
  { id: "a7", date: "2026-07-09", time: "11:00", status: "confirmed", patient: "Ram Khatri", phone: "+977 9851-890123", address: "Lagankhel, Lalitpur", type: "home_visit" },
  { id: "a8", date: "2026-07-10", time: "08:00", status: "completed", patient: "Sarita Karki", phone: "+977 9861-901234", address: "Jhamsikhel, Lalitpur", type: "assessment" },
  { id: "a9", date: "2026-07-10", time: "16:00", status: "confirmed", patient: "Bikash Gurung", phone: "+977 9871-012345", address: "Thimi, Bhaktapur", type: "home_visit" },
  { id: "a10", date: "2026-07-11", time: "10:00", status: "pending", patient: "Laxmi Rai", phone: "+977 9881-123456", address: "Madhyapur Thimi", type: "follow_up" },
  { id: "a11", date: "2026-07-12", time: "09:00", status: "confirmed", patient: "Deepak Shrestha", phone: "+977 9841-234568", address: "Swotha, Lalitpur", type: "home_visit" },
  { id: "a12", date: "2026-07-13", time: "14:00", status: "completed", patient: "Nirmala Tamang", phone: "+977 9851-345679", address: "Chabahil, Kathmandu", type: "assessment" },
  { id: "a13", date: "2026-07-14", time: "10:00", status: "confirmed", patient: "Prakash Adhikari", phone: "+977 9861-456780", address: "Gongabu, Kathmandu", type: "home_visit" },
  { id: "a14", date: "2026-07-14", time: "13:00", status: "pending", patient: "Mina Maharjan", phone: "+977 9871-567891", address: "Kirtipur, Kathmandu", type: "follow_up" },
  { id: "a15", date: "2026-07-15", time: "09:00", status: "confirmed", patient: "Rajesh Karki", phone: "+977 9881-678902", address: "Baluwatar, Kathmandu", type: "home_visit" },
  { id: "a16", date: "2026-07-16", time: "11:00", status: "completed", patient: "Sunita Poudel", phone: "+977 9841-789013", address: "Pulchowk, Lalitpur", type: "assessment" },
  { id: "a17", date: "2026-07-17", time: "08:00", status: "confirmed", patient: "Kamala Poudel", phone: "+977 9851-890124", address: "Budhanilkantha, Kathmandu", type: "home_visit" },
  { id: "a18", date: "2026-07-18", time: "15:00", status: "pending", patient: "Bibek Thapa", phone: "+977 9861-901235", address: "Satdobato, Lalitpur", type: "follow_up" },
  { id: "a19", date: "2026-07-19", time: "10:00", status: "confirmed", patient: "Anisha Shrestha", phone: "+977 9871-012346", address: "Dillibazar, Kathmandu", type: "home_visit" },
  { id: "a20", date: "2026-07-20", time: "09:00", status: "completed", patient: "Suman Basnet", phone: "+977 9881-123457", address: "Syuchatar, Kathmandu", type: "assessment" },
  { id: "a21", date: "2026-07-21", time: "14:00", status: "confirmed", patient: "Rita Sharma", phone: "+977 9841-234569", address: "Maharajgunj, Kathmandu", type: "home_visit" },
  { id: "a22", date: "2026-07-22", time: "11:00", status: "pending", patient: "Sunil Tamrakar", phone: "+977 9851-345670", address: "Patan, Lalitpur", type: "follow_up" },
  { id: "a23", date: "2026-07-24", time: "09:00", status: "confirmed", patient: "Kavita Joshi", phone: "+977 9861-456781", address: "Sanepa, Lalitpur", type: "home_visit" },
  { id: "a24", date: "2026-07-25", time: "16:00", status: "completed", patient: "Arun Mehta", phone: "+977 9871-567892", address: "Gatthaghar, Bhaktapur", type: "assessment" },
  { id: "a25", date: "2026-07-27", time: "10:00", status: "confirmed", patient: "Srijana Koirala", phone: "+977 9881-678903", address: "Mangal Bazaar, Lalitpur", type: "home_visit" },
  { id: "a26", date: "2026-07-28", time: "13:00", status: "pending", patient: "Nabin Bhattarai", phone: "+977 9841-789014", address: "Thankot, Kathmandu", type: "follow_up" },
  { id: "a27", date: "2026-07-29", time: "08:00", status: "confirmed", patient: "Sabina Khadka", phone: "+977 9851-890125", address: "Balkhu, Kathmandu", type: "home_visit" },
  { id: "a28", date: "2026-07-30", time: "11:00", status: "completed", patient: "Dipak KC", phone: "+977 9861-901236", address: "Kalanki, Kathmandu", type: "assessment" },
  { id: "a29", date: "2026-07-31", time: "14:00", status: "confirmed", patient: "Pooja Magar", phone: "+977 9871-012347", address: "Imadole, Lalitpur", type: "home_visit" },
];

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

function getFirstWeekWithAppointments(weeks: string[][], appointments: Appointment[]): number {
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].some((d) => d && appointments.some((a) => a.date === d))) return i;
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

export default function Schedule() {
  const { t } = useLang();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [slots, setSlots] = useState(MOCK_APPOINTMENTS);

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
    (dateStr: string) => slots.filter((s) => s.date === dateStr),
    [slots]
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
    const prevWeeks = getWeeksInMonth(prevYear, prevMonth);
    const idx = getFirstWeekWithAppointments(prevWeeks, slots);
    setCurrentWeekIndex(idx);
  };

  const handleNextMonth = () => {
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    const nextWeeks = getWeeksInMonth(nextYear, nextMonth);
    const idx = getFirstWeekWithAppointments(nextWeeks, slots);
    setCurrentWeekIndex(idx);
  };

  const handleDecide = (id: string, accept: boolean) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: accept ? "confirmed" : "cancelled" } : s
      )
    );
    toast.success(accept ? t("therapist_dashboard.slotAccepted") : t("therapist_dashboard.slotDeclined"));
  };

  const formatWeekLabel = () => {
    if (!weekStart || !weekEnd) return "";
    const s = new Date(weekStart + "T00:00:00");
    const e = new Date(weekEnd + "T00:00:00");
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}, ${selectedYear}`;
  };

  const statusColor = (status: string, isPast: boolean) => {
    if (isPast) return { bg: "bg-[#e5e7eb]", text: "text-[#6b7280]", border: "border-[#d1d5db]" };
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

  const AppointmentCard = ({ apt }: { apt: Appointment }) => {
    const past = isPastDate(apt.date);
    const colors = statusColor(apt.status, past);
    const truncatedAddr = apt.address.length > 16 ? apt.address.slice(0, 16) + "…" : apt.address;

    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
            className={`rounded-lg p-2 text-xs cursor-pointer transition-all duration-150 hover:shadow-md border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-semibold truncate leading-tight">{apt.patient.split(" ")[0]}</span>
              {apt.status === "pending" && !past && (
                <span className="ml-auto flex gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDecide(apt.id, true); }}
                    className="w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-secondary-hover transition-colors"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDecide(apt.id, false); }}
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
              {apt.patient}
            </p>
            <p className={`text-xs mt-0.5 ${past ? "text-text-light" : apt.status === "confirmed" ? "text-white/75" : "text-primary/70"}`}>
              {apt.type === "home_visit" ? t("therapist_dashboard.homeVisit") : apt.type === "follow_up" ? "Follow-up" : "Assessment"} · {to12h(apt.time)}
            </p>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-text-light">
              <Phone className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <span>{apt.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-light">
              <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <span>{apt.address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-light">
              <Calendar className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <span>{new Date(apt.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}</span>
            </div>
            {apt.status === "pending" && !past && (
              <div className="flex gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => handleDecide(apt.id, true)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary-hover transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t("therapist_dashboard.confirmAction")}
                </button>
                <button
                  onClick={() => handleDecide(apt.id, false)}
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
        <button
          onClick={() => {
            const today = new Date();
            if (isPastDate(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()))) {
              toast.error(t("therapist_dashboard.blockFutureOnly"));
              return;
            }
            toast.success(t("therapist_dashboard.blockedTimeSuccess"));
          }}
          className="btn-outline !py-1.5 !px-3 text-xs"
        >
          <Ban className="w-3.5 h-3.5 mr-1" />
          {t("therapist_dashboard.blockOffTime")}
        </button>
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
                const w = getWeeksInMonth(selectedYear, m);
                setCurrentWeekIndex(getFirstWeekWithAppointments(w, slots));
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
                const w = getWeeksInMonth(y, selectedMonth);
                setCurrentWeekIndex(getFirstWeekWithAppointments(w, slots));
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

      {viewMode === "weekly" ? (
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
