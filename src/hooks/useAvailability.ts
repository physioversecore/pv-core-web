"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getWorkingHours,
  updateWorkingHours,
  getMonthlyAvailability,
  bulkUpdateSlots,
  applyRecurringPattern as applyRecurringPatternApi,
  getRecurringPatterns,
  deleteRecurringPattern,
  openFullMonth as openFullMonthApi,
  blockDate as blockDateApi,
  applySchedule as applyScheduleApi,
} from "@/services/api/availability";
import {
  generateTimeSlots,
  sessionPeriodForTime,
  isDateInPast,
  isSlotInPast,
  dateKeyStr,
  DEFAULT_SLOT_INTERVAL,
  countOpenSlotsForMonth,
  type SlotInfo,
  type SlotStatus,
  type WorkingHours,
  type RecurringPatternInput,
} from "@/lib/availability-utils";

export function useAvailability() {
  const queryClient = useQueryClient();

  const { data: workingHours = { start: "08:00", end: "18:00", slotInterval: DEFAULT_SLOT_INTERVAL }, isLoading: whLoading } = useQuery({
    queryKey: ["availability", "working-hours"],
    queryFn: getWorkingHours,
  });

  const updateWorkingHoursMut = useMutation({
    mutationFn: updateWorkingHours,
    onSuccess: (data) => {
      queryClient.setQueryData(["availability", "working-hours"], data);
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
      toast.success("Working hours updated");
    },
    onError: () => toast.error("Failed to update working hours"),
  });

  const timeSlots = useMemo(
    () => generateTimeSlots(workingHours.start, workingHours.end, workingHours.slotInterval ?? DEFAULT_SLOT_INTERVAL),
    [workingHours],
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

  const [currentMonth, setCurrentMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const { data: monthlyGrid, isLoading: gridLoading } = useQuery({
    queryKey: ["availability", "monthly", currentMonth.year, currentMonth.month],
    queryFn: () => getMonthlyAvailability(currentMonth.month, currentMonth.year),
  });

  const [availability, setAvailability] = useState<Record<string, SlotInfo>>({});
  const [dirtySlots, setDirtySlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!monthlyGrid) return;
    setAvailability((prev) => {
      const next = { ...prev };
      for (const slot of monthlyGrid.slots) {
        next[`${slot.date}_${slot.time}`] = slot;
      }
      return next;
    });
  }, [monthlyGrid]);

  const loadMonth = useCallback(
    async (year: number, month: number) => {
      const existing = queryClient.getQueryData(["availability", "monthly", year, month]);
      if (existing) return;
      try {
        const grid = await getMonthlyAvailability(month, year);
        setAvailability((prev) => {
          const next = { ...prev };
          for (const slot of grid.slots) {
            next[`${slot.date}_${slot.time}`] = slot;
          }
          return next;
        });
      } catch {
        // silent
      }
    },
    [queryClient],
  );

  const { data: recurringPatterns = [], isLoading: patternsLoading } = useQuery({
    queryKey: ["availability", "recurring-patterns"],
    queryFn: getRecurringPatterns,
  });

  const saveRecurringMutation = useMutation({
    mutationFn: (pattern: RecurringPatternInput) => applyRecurringPatternApi(pattern),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
      queryClient.invalidateQueries({ queryKey: ["availability", "recurring-patterns"] });
      return result;
    },
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: (id: string) => deleteRecurringPattern(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "recurring-patterns"] });
      toast.success("Recurring pattern deleted");
    },
    onError: () => toast.error("Failed to delete recurring pattern"),
  });

  const setSlotStatus = useCallback(
    async (date: string, time: string, status: SlotStatus) => {
      const key = `${date}_${time}`;
      setAvailability((prev) => {
        const current = prev[key];
        if (!current) return prev;
        return { ...prev, [key]: { ...current, status } };
      });
      setDirtySlots((prev) => {
        const s = new Set(prev);
        s.add(key);
        return s;
      });
    },
    [],
  );

  const commitChanges = useCallback(async () => {
    const updates: { date: string; time: string; status: string }[] = [];
    for (const key of dirtySlots) {
      const slot = availability[key];
      if (slot) {
        updates.push({ date: slot.date, time: slot.time, status: slot.status });
      }
    }
    if (updates.length === 0) return;
    await bulkUpdateSlots(updates);
    setDirtySlots(new Set());
    queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
  }, [dirtySlots, availability, queryClient]);

  const blockWholeDay = useCallback(
    async (date: Date) => {
      const dk = dateKeyStr(date.getFullYear(), date.getMonth(), date.getDate());
      if (isDateInPast(dk)) {
        toast.info("Can't edit availability in the past");
        return;
      }
      const updates: { date: string; time: string; status: string }[] = [];
      for (const time of timeSlots) {
        if (isSlotInPast(dk, time)) continue;
        const key = `${dk}_${time}`;
        const current = availability[key];
        if (current?.status === "booked") continue;
        updates.push({ date: dk, time, status: "off" });
      }
      if (updates.length === 0) return;
      await bulkUpdateSlots(updates);
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
    },
    [timeSlots, availability, queryClient],
  );

  const handleBlockDate = useCallback(
    async (dateStr: string, sessions?: string[]) => {
      if (isDateInPast(dateStr)) {
        toast.info("Can't block a date in the past");
        return;
      }
      await blockDateApi(dateStr, sessions);
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
    },
    [queryClient],
  );

  const openFullMonthMut = useMutation({
    mutationFn: openFullMonthApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
    },
  });

  const applyScheduleMut = useMutation({
    mutationFn: ({ recurrence, dateFrom, dateTo }: { recurrence: string; dateFrom?: string; dateTo?: string }) =>
      applyScheduleApi(recurrence, dateFrom, dateTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
    },
  });

  const getMonthSummaries = useCallback(
    (monthGrid: (Date | null)[]) => {
      const result: Record<string, { open: number; booked: number; off: number }> = {};
      for (const cellDate of monthGrid) {
        if (!cellDate) continue;
        const dk = dateKeyStr(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
        const counts = { open: 0, booked: 0, off: 0 };
        for (const time of timeSlots) {
          const key = `${dk}_${time}`;
          const slot = availability[key];
          counts[(slot?.status ?? "off") as keyof typeof counts]++;
        }
        result[dk] = counts;
      }
      return result;
    },
    [availability, timeSlots],
  );

  return {
    workingHours,
    whLoading,
    updateWorkingHours: updateWorkingHoursMut.mutateAsync,
    isUpdatingHours: updateWorkingHoursMut.isPending,
    timeSlots,
    sessionPeriods,
    timeRowMap,
    availability,
    setAvailability,
    dirtySlots,
    setDirtySlots,
    loading: gridLoading || whLoading,
    currentMonth,
    setCurrentMonth,
    loadMonth,
    setSlotStatus,
    commitChanges,
    blockWholeDay,
    handleBlockDate,
    getMonthSummaries,
    recurringPatterns,
    patternsLoading,
    saveRecurring: saveRecurringMutation.mutateAsync,
    isSavingRecurring: saveRecurringMutation.isPending,
    deleteRecurring: deleteRecurringMutation.mutate,
    openFullMonth: openFullMonthMut.mutateAsync,
    isOpeningMonth: openFullMonthMut.isPending,
    applySchedule: applyScheduleMut.mutateAsync,
    isApplyingSchedule: applyScheduleMut.isPending,
  };
}

export function useCountOpenSlots() {
  return useCallback(
    (
      year: number,
      month: number,
      days: number[],
      sessions: string[],
      wh: WorkingHours,
      store?: Record<string, SlotInfo>,
    ) => countOpenSlotsForMonth(year, month, days, sessions, wh, store),
    [],
  );
}
