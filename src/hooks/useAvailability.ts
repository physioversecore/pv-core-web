"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getWorkingHours,
  updateWorkingHours,
  getMonthlyAvailability,
  bulkUpdateSlots,
  blockDate as blockDateApi,
} from "@/services/api/availability";
import {
  generateTimeSlots,
  isDateInPast,
  isSlotInPast,
  dateKeyStr,
  DEFAULT_SLOT_INTERVAL,
  generateSlotsFromConfig,
  isTimeInDayParts,
  type SlotInfo,
  type SlotStatus,
  type SessionBreakConfig,
  type DayPart,
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
    async (dateStr: string) => {
      if (isDateInPast(dateStr)) {
        toast.info("Can't block a date in the past");
        return;
      }
      await blockDateApi(dateStr);
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
    },
    [queryClient],
  );

  const applyScheduleConfig = useCallback(
    async (config: SessionBreakConfig, days: number[]) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const updates = generateSlotsFromConfig(config, days, year, month, availability);
      if (updates.length === 0) {
        toast.info("No slots to update");
        return 0;
      }
      await bulkUpdateSlots(updates);
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
      return updates.length;
    },
    [availability, queryClient],
  );

  const blockDaysOff = useCallback(
    async (days: number[], parts: DayPart[]) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const updates: { date: string; time: string; status: string }[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dow = date.getDay();
        if (!days.includes(dow)) continue;
        const dk = dateKeyStr(year, month, d);
        if (isDateInPast(dk)) continue;
        for (const time of timeSlots) {
          if (!isTimeInDayParts(time, parts)) continue;
          if (isSlotInPast(dk, time)) continue;
          const key = `${dk}_${time}`;
          const current = availability[key];
          if (current?.status === "booked") continue;
          updates.push({ date: dk, time, status: "off" });
        }
      }
      if (updates.length === 0) {
        toast.info("No slots to block");
        return 0;
      }
      await bulkUpdateSlots(updates);
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
      return updates.length;
    },
    [timeSlots, availability, queryClient],
  );

  const unblockDaysOff = useCallback(
    async (days: number[], parts: DayPart[]) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const updates: { date: string; time: string; status: string }[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dow = date.getDay();
        if (!days.includes(dow)) continue;
        const dk = dateKeyStr(year, month, d);
        if (isDateInPast(dk)) continue;
        for (const time of timeSlots) {
          if (!isTimeInDayParts(time, parts)) continue;
          if (isSlotInPast(dk, time)) continue;
          const key = `${dk}_${time}`;
          const current = availability[key];
          if (current?.status !== "off") continue;
          updates.push({ date: dk, time, status: "open" });
        }
      }
      if (updates.length === 0) {
        toast.info("No slots to unblock");
        return 0;
      }
      await bulkUpdateSlots(updates);
      queryClient.invalidateQueries({ queryKey: ["availability", "monthly"] });
      return updates.length;
    },
    [timeSlots, availability, queryClient],
  );

  const hasBookingsOnDays = useCallback(
    (days: number[], parts: DayPart[]): boolean => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dow = date.getDay();
        if (!days.includes(dow)) continue;
        const dk = dateKeyStr(year, month, d);
        for (const time of timeSlots) {
          if (!isTimeInDayParts(time, parts)) continue;
          const key = `${dk}_${time}`;
          const slot = availability[key];
          if (slot?.status === "booked") return true;
        }
      }
      return false;
    },
    [timeSlots, availability],
  );

  return {
    workingHours,
    whLoading,
    updateWorkingHours: updateWorkingHoursMut.mutateAsync,
    isUpdatingHours: updateWorkingHoursMut.isPending,
    timeSlots,
    availability,
    setAvailability,
    dirtySlots,
    setDirtySlots,
    loading: gridLoading || whLoading,
    currentMonth,
    setCurrentMonth,
    loadMonth,
    setSlotStatus,
    blockWholeDay,
    handleBlockDate,
    applyScheduleConfig,
    blockDaysOff,
    unblockDaysOff,
    hasBookingsOnDays,
  };
}
