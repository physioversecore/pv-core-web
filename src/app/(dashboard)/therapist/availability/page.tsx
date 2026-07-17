"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useAvailability } from "@/hooks/useAvailability";
import {
  dateKeyStr,
  isDateInPast,
  isSlotInPast,
  generateSessionBlocks,
  blockHourTimes,
  type SessionBreakConfig,
  type SlotInfo,
  type SlotStatus,
  type DayPart,
} from "@/lib/availability-utils";
import { to12h } from "@/lib/format";
import { createAuditEntry } from "@/services/api/availability";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useUndoToast } from "@/components/availability/useUndoToast";
import { ScheduleBuilder } from "@/components/availability/ScheduleBuilder";
import { ViewSwitcher } from "@/components/availability/ViewSwitcher";
import { DailyView } from "@/components/availability/DailyView";
import { WeeklyView } from "@/components/availability/WeeklyView";
import { MonthlyView } from "@/components/availability/MonthlyView";
import { ConfirmBlockModal } from "@/components/availability/ConfirmBlockModal";
import { AuditLog } from "@/components/availability/AuditLog";
import { Legend } from "@/components/availability/Legend";

type ViewMode = "daily" | "weekly" | "monthly";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function toDateKey(d: Date): string {
  return dateKeyStr(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function weekStart(d: Date): Date {
  const day = d.getDay();
  return addDays(d, -day);
}

function inferWorkingDays(availability: Record<string, SlotInfo>): Set<number> {
  const has: Record<number, boolean> = {};
  for (const key of Object.keys(availability)) {
    const [dateStr] = key.split("_");
    const d = new Date(dateStr + "T00:00:00");
    has[d.getDay()] = true;
  }
  return new Set(
    Object.keys(has)
      .map(Number)
      .filter((d) => has[d])
  );
}

export default function ManageAvailability() {
  const { user } = useAuth();
  const {
    workingHours,
    timeSlots,
    availability,
    setAvailability,
    setDirtySlots,
    loading,
    loadMonth,
    setSlotStatus: setSlotStatusHook,
    applyScheduleConfig,
    blockWholeDay: blockWholeDayApi,
    blockDaysOff,
    unblockDaysOff,
    hasBookingsOnDays,
  } = useAvailability();

  const { entries: auditEntries, addEntry: addAuditEntry, removeEntry: removeAuditEntry } = useAuditLog();
  const { toast: undoToast, showToast } = useUndoToast();

  // View state
  const [view, setView] = useState<ViewMode>("daily");
  const [cursor, setCursor] = useState(() => new Date());
  const [scheduleGenerated, setScheduleGenerated] = useState(false);

  // Blocked dates state (dateKey -> block info)
  const [blockedDates, setBlockedDates] = useState<Record<string, { parts: string[]; reason: string }>>({});

  // Working days (inferred from actual availability data)
  const workingDays = useMemo(() => inferWorkingDays(availability), [availability]);

  // Session blocks config (for the weekly/monthly grids)
  const [currentConfig, setCurrentConfig] = useState<SessionBreakConfig>({
    sessionDuration: 120,
    breakDuration: 30,
    startTime: "08:00",
    endTime: "18:00",
  });
  const [currentDays, setCurrentDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const sessionBlocks = useMemo(() => {
    const blocks = generateSessionBlocks(currentConfig);
    return blocks.filter((b) => b.type === "session");
  }, [currentConfig]);

  // Load months as cursor changes
  useEffect(() => {
    if (!scheduleGenerated) return;
    if (view === "daily") {
      loadMonth(cursor.getFullYear(), cursor.getMonth());
    } else if (view === "weekly") {
      const start = weekStart(cursor);
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i);
        loadMonth(d.getFullYear(), d.getMonth());
      }
    } else {
      loadMonth(cursor.getFullYear(), cursor.getMonth());
    }
  }, [view, cursor, scheduleGenerated, loadMonth]);

  // Date range label
  const rangeLabel = useMemo(() => {
    if (view === "daily") {
      const today = new Date();
      if (toDateKey(cursor) === toDateKey(today)) {
        return `Today · ${formatShort(cursor)}`;
      }
      return formatShort(cursor);
    }
    if (view === "weekly") {
      const start = weekStart(cursor);
      const end = addDays(start, 6);
      return `${formatShort(start)} – ${formatShort(end)}`;
    }
    return cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [view, cursor]);

  // Navigation
  const handleNav = useCallback(
    (dir: number) => {
      if (view === "daily") setCursor((c) => addDays(c, dir));
      else if (view === "weekly") setCursor((c) => addDays(c, dir * 7));
      else setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
    },
    [view]
  );

  const handleViewChange = useCallback((v: ViewMode) => {
    setView(v);
    setCursor(new Date());
  }, []);

  // Apply schedule
  const handleApply = useCallback(
    async (config: SessionBreakConfig, days: number[]) => {
      try {
        const count = await applyScheduleConfig(config, days);
        setCurrentConfig(config);
        setCurrentDays(days);
        setScheduleGenerated(true);
        showToast(`Availability generated: ${count} slot(s) updated`);
      } catch {
        toast.error("Failed to apply schedule");
      }
    },
    [applyScheduleConfig, showToast]
  );

  // Block time off
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    body: string;
    patients?: { name: string; slot: string }[];
    onConfirm: () => void;
  }>({ open: false, title: "", body: "", onConfirm: () => {} });

  const handleBlock = useCallback(
    async (
      dateRange: { from: string; to: string },
      daysOfWeek: number[],
      parts: DayPart[],
      reason: string,
      notifyAffected: boolean
    ) => {
      // Check for booked sessions in range
      let bookedCount = 0;
      const patients: { name: string; slot: string }[] = [];
      const from = dateRange.from;
      const to = dateRange.to || "2099-12-31";

      for (const [key, slot] of Object.entries(availability)) {
        const [dateStr] = key.split("_");
        if (dateStr < from || dateStr > to) continue;
        if (slot.status !== "booked") continue;
        const d = new Date(dateStr + "T00:00:00");
        if (!daysOfWeek.includes(d.getDay())) continue;
        bookedCount++;
        if (slot.patientName) patients.push({ name: slot.patientName, slot: key });
      }

      const blockedDatesList: string[] = [];
      const toBlock = new Date(to + "T00:00:00");
      const fromDate = new Date(from + "T00:00:00");
      const d = new Date(fromDate);
      while (d <= toBlock) {
        if (daysOfWeek.includes(d.getDay())) {
          blockedDatesList.push(toDateKey(d));
        }
        d.setDate(d.getDate() + 1);
      }

      const doBlock = async () => {
        // Update local state
        setBlockedDates((prev) => {
          const next = { ...prev };
          for (const dk of blockedDatesList) {
            next[dk] = { parts: parts.map(String), reason };
          }
          return next;
        });

        // Set all non-booked slots to off in the range
        const updates: { date: string; time: string; status: SlotStatus }[] = [];
        for (const dk of blockedDatesList) {
          for (const time of timeSlots) {
            if (isSlotInPast(dk, time)) continue;
            const key = `${dk}_${time}`;
            const slot = availability[key];
            if (slot?.status === "booked") continue;

            const hour = parseInt(time.split(":")[0], 10);
            const inPart = parts.length === 3 ||
              parts.some((p) => {
                if (p === "morning") return hour >= 6 && hour < 12;
                if (p === "afternoon") return hour >= 12 && hour < 17;
                if (p === "evening") return hour >= 17 && hour < 22;
                return false;
              });

            if (inPart) {
              updates.push({ date: dk, time, status: "off" });
            }
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

        setDirtySlots((prev) => {
          const s = new Set(prev);
          for (const u of updates) s.add(`${u.date}_${u.time}`);
          return s;
        });

        // Audit log
        const scope = parts.length === 3 ? "Full day" : parts.join(", ");
        const who = blockedDatesList.length > 1 ? `${blockedDatesList.length} days · ${scope}` : scope;
        try {
          const entry = await createAuditEntry({
            date: blockedDatesList[0],
            reason,
            who,
            slotKey: null,
            time: null,
            source: "Block time off",
          });
          addAuditEntry(entry);
        } catch {
          // silent
        }

        const msg = `Blocked ${blockedDatesList.length} day(s)` +
          (bookedCount ? ` · ${bookedCount} session(s) cancelled` : "") + ".";
        showToast(msg, true);
      };

      if (bookedCount > 0) {
        setConfirmModal({
          open: true,
          title: "Block time with existing bookings?",
          body: `This range includes ${bookedCount} booked session(s). Blocking will cancel them${notifyAffected ? " and notify the patients." : "."}`,
          patients,
          onConfirm: () => {
            setConfirmModal((p) => ({ ...p, open: false }));
            doBlock();
          },
        });
      } else {
        doBlock();
      }
    },
    [availability, timeSlots, setAvailability, setDirtySlots, addAuditEntry, showToast]
  );

  // Toggle slot (daily/weekly/monthly)
  const handleToggleSlot = useCallback(
    (dateKey: string, time: string) => {
      const key = `${dateKey}_${time}`;
      const slot = availability[key];
      if (!slot || slot.status === "booked" || isSlotInPast(dateKey, time)) return;

      const next: SlotStatus = slot.status === "open" ? "off" : "open";
      setSlotStatusHook(dateKey, time, next);
    },
    [availability, setSlotStatusHook]
  );

  // Block/unblock from daily view
  const [lastBlockedDates, setLastBlockedDates] = useState<string[]>([]);

  const handleBlockDayFromDaily = useCallback(
    async (dateKey: string) => {
      if (isDateInPast(dateKey)) {
        toast.info("Can't block a date in the past");
        return;
      }

      const daySlots = Object.entries(availability)
        .filter(([k]) => k.startsWith(dateKey + "_"))
        .map(([, v]) => v);

      const bookedSlots = daySlots.filter((s) => s.status === "booked");

      const doBlock = async () => {
        const updates: { date: string; time: string; status: SlotStatus }[] = [];
        for (const time of timeSlots) {
          if (isSlotInPast(dateKey, time)) continue;
          const key = `${dateKey}_${time}`;
          const slot = availability[key];
          if (slot?.status === "booked") continue;
          updates.push({ date: dateKey, time, status: "off" });
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

        setBlockedDates((prev) => ({
          ...prev,
          [dateKey]: { parts: ["morning", "afternoon", "evening"], reason: "Emergency block" },
        }));

        setDirtySlots((prev) => {
          const s = new Set(prev);
          for (const u of updates) s.add(`${u.date}_${u.time}`);
          return s;
        });

        try {
          const entry = await createAuditEntry({
            date: dateKey,
            reason: "Emergency block",
            who: "Full day",
            slotKey: null,
            time: null,
            source: "Daily view",
          });
          addAuditEntry(entry);
        } catch {}

        setLastBlockedDates([dateKey]);
        showToast(
          `Blocked ${dateKey}` + (bookedSlots.length ? ` · ${bookedSlots.length} session(s) cancelled` : ""),
          true
        );
      };

      if (bookedSlots.length > 0) {
        setConfirmModal({
          open: true,
          title: `Block ${formatShort(new Date(dateKey + "T00:00:00"))}?`,
          body: `This day has ${bookedSlots.length} booked session(s). Blocking will cancel them and notify the patients.`,
          patients: bookedSlots.map((s) => ({
            name: s.patientName || "Unknown",
            slot: `${to12h(s.time)} · ${s.date}`,
          })),
          onConfirm: () => {
            setConfirmModal((p) => ({ ...p, open: false }));
            doBlock();
          },
        });
      } else {
        doBlock();
      }
    },
    [availability, timeSlots, setAvailability, setDirtySlots, addAuditEntry, showToast]
  );

  const handleUnblockDay = useCallback(
    (dateKey: string) => {
      setBlockedDates((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });

      // Set off slots back to open
      const updates: { date: string; time: string; status: SlotStatus }[] = [];
      for (const time of timeSlots) {
        const key = `${dateKey}_${time}`;
        const slot = availability[key];
        if (slot?.status === "off") {
          updates.push({ date: dateKey, time, status: "open" });
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

      showToast(`Unblocked ${dateKey}.`);
    },
    [availability, timeSlots, setAvailability, showToast]
  );

  // Undo handler
  const handleUndo = useCallback(() => {
    for (const dk of lastBlockedDates) {
      handleUnblockDay(dk);
    }
    setLastBlockedDates([]);
  }, [lastBlockedDates, handleUnblockDay]);

  // Audit log handlers
  const handleAuditReopen = useCallback(
    async (entry: { id: string; date: string; time: string | null }) => {
      if (entry.time) {
        const key = `${entry.date}_${entry.time}`;
        const slot = availability[key];
        if (slot?.status === "off") {
          setSlotStatusHook(entry.date, entry.time, "open");
        }
        removeAuditEntry(entry.id);
        showToast(`Reopened slot on ${entry.date}.`);
      }
    },
    [availability, setSlotStatusHook, removeAuditEntry, showToast]
  );

  const handleAuditUnblock = useCallback(
    async (entry: { id: string; date: string; time: string | null }) => {
      handleUnblockDay(entry.date);
      removeAuditEntry(entry.id);
    },
    [handleUnblockDay, removeAuditEntry]
  );

  // Show slot info (using the same ConfirmBlockModal in read-only mode)
  const handleShowSlotInfo = useCallback((slot: SlotInfo) => {
    setConfirmModal({
      open: true,
      title: `${to12h(slot.time)} – ${slot.date}`,
      body: `Booked · ${slot.date}. Booked slots can't be edited here — use Schedule Management to reschedule or cancel this session.`,
      patients: slot.patientName ? [{ name: slot.patientName, slot: `${to12h(slot.time)} · ${slot.sessionType || ""}` }] : [],
      onConfirm: () => setConfirmModal((p) => ({ ...p, open: false })),
    });
  }, []);

  // Build daily view data
  const dailyData = useMemo(() => {
    const dk = toDateKey(cursor);
    const daySlots: (SlotInfo & { endTime?: string })[] = [];
    for (const time of timeSlots) {
      const key = `${dk}_${time}`;
      const slot = availability[key];
      if (slot) {
        // Compute end time from session block
        const block = sessionBlocks.find((b) => b.startTime === time);
        daySlots.push({
          ...slot,
          endTime: block?.endTime,
        });
      }
    }
    return { dateKey: dk, slots: daySlots, blocked: blockedDates[dk] ?? null };
  }, [cursor, timeSlots, availability, blockedDates, sessionBlocks]);

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <p className="eyebrow mb-1">Schedule</p>
        <h1 className="text-[30px] font-display text-text font-semibold">Manage availability</h1>
      </div>

      {/* Schedule builder */}
      <ScheduleBuilder
        workingDays={workingDays}
        availability={availability}
        onApply={handleApply}
        onBlock={handleBlock}
      />

      {/* Calendar views (only after generation) */}
      {scheduleGenerated && (
        <>
          <ViewSwitcher
            view={view}
            rangeLabel={rangeLabel}
            onViewChange={handleViewChange}
            onNav={handleNav}
          />

          <div className="card-soft p-4 sm:p-6 mb-6 overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-text-light">Loading…</div>
            ) : view === "daily" ? (
              <DailyView
                dateKey={dailyData.dateKey}
                dateLabel={formatShort(cursor)}
                slots={dailyData.slots}
                blocked={dailyData.blocked}
                onToggleSlot={handleToggleSlot}
                onBlockDay={handleBlockDayFromDaily}
                onUnblockDay={handleUnblockDay}
                onShowSlotInfo={handleShowSlotInfo}
              />
            ) : view === "weekly" ? (
              <div className="min-w-[680px]">
                <WeeklyView
                  weekStart={weekStart(cursor)}
                  sessionBlocks={sessionBlocks}
                  availability={availability}
                  blockedDates={blockedDates}
                  onToggleSlot={handleToggleSlot}
                  onShowSlotInfo={handleShowSlotInfo}
                />
              </div>
            ) : (
              <MonthlyView
                year={cursor.getFullYear()}
                month={cursor.getMonth()}
                sessionBlocks={sessionBlocks}
                availability={availability}
                blockedDates={blockedDates}
                onToggleSlot={handleToggleSlot}
                onShowSlotInfo={handleShowSlotInfo}
              />
            )}

            {!loading && <Legend />}
          </div>
        </>
      )}

      {/* Audit log */}
      <AuditLog
        entries={auditEntries}
        onReopen={handleAuditReopen}
        onUnblock={handleAuditUnblock}
      />

      {/* Confirm block modal */}
      <ConfirmBlockModal
        open={confirmModal.open}
        title={confirmModal.title}
        body={confirmModal.body}
        patients={confirmModal.patients}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((p) => ({ ...p, open: false }))}
      />

      {/* Toast */}
      {undoToast.show && (
        <div className="fixed bottom-6 right-6 bg-secondary text-white px-[18px] py-3 rounded-[10px] text-[13px] flex items-center gap-3.5 shadow-lg z-[200] animate-toast-in">
          <span>{undoToast.message}</span>
          {undoToast.undoable && (
            <button
              onClick={handleUndo}
              className="bg-transparent border-none text-gold font-bold cursor-pointer text-[12.5px]"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </>
  );
}
