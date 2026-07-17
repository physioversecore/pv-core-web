"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { to12h } from "@/lib/format";
import { isDateInPast, type WorkingHours } from "@/lib/availability-utils";
import type {
  ScheduleAppointment,
  ScheduleAppointmentStatus,
} from "@/hooks/useTherapistSchedule";
import { DailyView } from "./DailyView";
import { WeeklyView } from "./WeeklyView";
import { MonthlyView } from "./MonthlyView";
import { ScheduleLegend } from "./ScheduleLegend";
import { AppointmentDetailPopover } from "./AppointmentDetailPopover";
import { RequestModal } from "./RequestModal";
import { MonthMorePopover } from "./MonthMorePopover";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function dateKeyStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function getMonday(d: Date): Date {
  const nd = new Date(d);
  const day = weekdayIndex(nd);
  nd.setDate(nd.getDate() - day);
  return nd;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

type ViewMode = "daily" | "weekly" | "monthly";

export interface ScheduleCalendarProps {
  appointments: ScheduleAppointment[];
  workingHours: WorkingHours;
  isLoading?: boolean;
  isAdmin?: boolean;
  onRequestReschedule?: (appointment: ScheduleAppointment) => void;
  onRequestDecline?: (appointment: ScheduleAppointment) => void;
  emptyMessage?: string;
}

function DaySkeleton() {
  return (
    <div className="card-soft overflow-x-auto">
      <div className="px-4 py-3 border-b border-border flex justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[70px_1fr] border-b border-border">
          <Skeleton className="h-16 m-2.5" />
          <Skeleton className="h-16 m-2.5" />
        </div>
      ))}
    </div>
  );
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
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="contents">
            <div className="border-r border-b border-border p-2.5 flex items-start justify-center pt-3">
              <Skeleton className="h-3 w-12" />
            </div>
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="border-b border-r border-border p-1.5 min-h-[60px]">
                {Math.random() > 0.6 && <Skeleton className="h-12 w-full rounded-lg" />}
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
  workingHours,
  isLoading = false,
  isAdmin = false,
  onRequestReschedule,
  onRequestDecline,
  emptyMessage,
}: ScheduleCalendarProps) {
  const now = new Date();
  const [view, setView] = useState<ViewMode>("monthly");
  const [cursor, setCursor] = useState(() => new Date());

  // Popover state
  const [detailApt, setDetailApt] = useState<{
    apt: ScheduleAppointment;
    rect: DOMRect;
  } | null>(null);
  const [requestModal, setRequestModal] = useState<{
    apt: ScheduleAppointment;
    mode: "reschedule_requested" | "decline_requested";
  } | null>(null);
  const [morePopover, setMorePopover] = useState<{
    apts: ScheduleAppointment[];
    rect: DOMRect;
  } | null>(null);

  // Date navigation
  const handleNav = useCallback(
    (dir: number) => {
      if (view === "daily") {
        setCursor((c) => addDays(c, dir));
      } else if (view === "weekly") {
        setCursor((c) => addDays(c, dir * 7));
      } else {
        setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
      }
    },
    [view]
  );

  const handleToday = useCallback(() => setCursor(new Date()), []);

  // Date label
  const dateLabel = useMemo(() => {
    if (view === "monthly") {
      return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    }
    if (view === "weekly") {
      const monday = getMonday(cursor);
      const sunday = addDays(monday, 6);
      const opts: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
      };
      return `Week of ${monday.toLocaleDateString("en-US", opts)} – ${sunday.toLocaleDateString("en-US", opts)}`;
    }
    return `${DAYS[weekdayIndex(cursor)]}, ${cursor.getDate()} ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [view, cursor]);

  // Availability note
  const availNote = useMemo(() => {
    if (view === "daily") {
      const dow = weekdayIndex(cursor);
      const active = workingHours.start && workingHours.end;
      return active
        ? `Working hours: ${to12h(workingHours.start)} – ${to12h(workingHours.end)}`
        : "No working hours set";
    }
    if (view === "weekly") {
      return "Hours vary by day — set in Manage Availability";
    }
    return "Booking hours come from Manage Availability";
  }, [view, cursor, workingHours]);

  // Handlers
  const handleSelectAppointment = useCallback(
    (apt: ScheduleAppointment, e: React.MouseEvent) => {
      e.stopPropagation();
      closeAll();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDetailApt({ apt, rect });
    },
    []
  );

  const handleShowMore = useCallback(
    (apts: ScheduleAppointment[], rect: DOMRect) => {
      closeAll();
      setMorePopover({ apts, rect });
    },
    []
  );

  const handleRequestReschedule = useCallback((apt: ScheduleAppointment) => {
    closeAll();
    setRequestModal({ apt, mode: "reschedule_requested" });
  }, []);

  const handleRequestDecline = useCallback((apt: ScheduleAppointment) => {
    closeAll();
    setRequestModal({ apt, mode: "decline_requested" });
  }, []);

  const handleSubmitRequest = useCallback(
    async (reason: string) => {
      if (!requestModal) return;
      if (onRequestReschedule && requestModal.mode === "reschedule_requested") {
        await onRequestReschedule(requestModal.apt);
      } else if (onRequestDecline && requestModal.mode === "decline_requested") {
        await onRequestDecline(requestModal.apt);
      }
      setRequestModal(null);
    },
    [requestModal, onRequestReschedule, onRequestDecline]
  );

  const closeAll = useCallback(() => {
    setDetailApt(null);
    setMorePopover(null);
  }, []);

  const hasAppointments = appointments.length > 0;

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-surface rounded-lg p-0.5">
          {(["daily", "weekly", "monthly"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => { setView(v); setCursor(new Date()); closeAll(); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-150 ${
                view === v
                  ? "bg-white text-secondary shadow-sm"
                  : "text-text-light hover:text-text"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNav(-1)}
            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-surface transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-text-light" />
          </button>
          <p className="text-sm font-semibold min-w-[200px] text-center">
            {dateLabel}
          </p>
          <button
            onClick={() => handleNav(1)}
            className="w-8 h-8 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-surface transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-text-light" />
          </button>
          <button
            onClick={handleToday}
            className="ml-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-primary bg-primary-light hover:bg-primary/20 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="text-xs text-text-light bg-white border border-border px-3 py-1.5 rounded-lg">
          {availNote}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        view === "daily" ? (
          <DaySkeleton />
        ) : view === "weekly" ? (
          <WeekSkeleton />
        ) : (
          <MonthSkeleton />
        )
      ) : !hasAppointments && view !== "daily" ? (
        <div className="card-soft p-12 text-center">
          <Calendar className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-text">
            {emptyMessage || "No appointments scheduled"}
          </p>
          <p className="text-xs text-text-light mt-1">
            Appointments booked by patients will appear here.
          </p>
        </div>
      ) : view === "daily" ? (
        <DailyView
          date={cursor}
          appointments={appointments}
          workingHours={workingHours}
          onSelectAppointment={handleSelectAppointment}
        />
      ) : view === "weekly" ? (
        <WeeklyView
          cursorDate={cursor}
          appointments={appointments}
          workingHours={workingHours}
          onSelectAppointment={handleSelectAppointment}
        />
      ) : (
        <MonthlyView
          year={cursor.getFullYear()}
          month={cursor.getMonth()}
          appointments={appointments}
          onSelectAppointment={handleSelectAppointment}
          onShowMore={handleShowMore}
        />
      )}

      {/* Legend */}
      {!isLoading && <ScheduleLegend />}

      {/* Detail popover */}
      {detailApt && (
        <AppointmentDetailPopover
          appointment={detailApt.apt}
          anchorRect={detailApt.rect}
          onClose={closeAll}
          onRequestReschedule={handleRequestReschedule}
          onRequestDecline={handleRequestDecline}
        />
      )}

      {/* More popover */}
      {morePopover && (
        <MonthMorePopover
          appointments={morePopover.apts}
          anchorRect={morePopover.rect}
          onClose={closeAll}
          onSelectAppointment={handleSelectAppointment}
        />
      )}

      {/* Request modal */}
      {requestModal && (
        <RequestModal
          appointment={requestModal.apt}
          mode={requestModal.mode}
          onSubmit={handleSubmitRequest}
          onCancel={() => setRequestModal(null)}
        />
      )}
    </div>
  );
}
