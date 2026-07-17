"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMyTherapist } from "@/services/api/therapists";
import {
  getWorkingHours,
  getWorkingDays,
  getSlotsForRange,
  generateAvailability,
  blockRange,
  unblockTime,
  setSlotStatus,
  getAuditLog,
  deleteAuditEntry,
  createBlockRequest,
  getBlockRequests,
} from "@/services/api/availability";
import type {
  WorkingHours,
  SlotInfo,
  DayPart,
} from "@/lib/availability-utils";
import { DAY_PART_RANGES } from "@/lib/availability-utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type ViewMode = "daily" | "weekly" | "monthly";
export type BuilderMode = "avail" | "block";

export interface ScheduleConfig {
  startTime: string;
  endTime: string;
  sessionDuration: number;
  breakDuration: number;
  daysOfWeek: string[];
  dateFrom: string;
  dateTo: string | null;
}

export interface BlockConfig {
  blockType: "specific" | "range" | "recurring";
  dateSpecific: string;
  dateFrom: string;
  dateTo: string | null;
  daysOfWeek: string[];
  partsOfDay: DayPart[];
  reason: string;
  notify: boolean;
}

interface LastAction {
  type: "generate" | "block" | "unblock" | "toggle";
  description: string;
  undoFn: () => Promise<void>;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function endOfMonth(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
}

function partsOfDayTimeRanges(parts: DayPart[]): [number, number][] {
  return parts.map((p) => DAY_PART_RANGES[p]);
}

function timeInRange(time: string, ranges: [number, number][]): boolean {
  const [h] = time.split(":").map(Number);
  return ranges.some(([start, end]) => h >= start && h < end);
}

function computeDateRange(
  view: ViewMode,
  cursor: string,
): { from: string; to: string } {
  const d = new Date(cursor + "T00:00:00");
  switch (view) {
    case "daily":
      return { from: cursor, to: cursor };
    case "weekly": {
      const day = d.getDay();
      const start = new Date(d);
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        from: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
        to: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`,
      };
    }
    case "monthly": {
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return {
        from: `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}`,
        to: `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`,
      };
    }
  }
}

export function useManageAvailability(userId?: string | null) {
  const queryClient = useQueryClient();

  const [view, setView] = useState<ViewMode>("weekly");
  const [cursor, setCursor] = useState(todayStr());
  const [builderMode, setBuilderMode] = useState<BuilderMode>("avail");
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    startTime: "08:00",
    endTime: "18:00",
    sessionDuration: 60,
    breakDuration: 15,
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    dateFrom: todayStr(),
    dateTo: addDays(todayStr(), 27),
  });

  const [blockConfig, setBlockConfig] = useState<BlockConfig>({
    blockType: "specific",
    dateSpecific: todayStr(),
    dateFrom: todayStr(),
    dateTo: addDays(todayStr(), 6),
    daysOfWeek: [],
    partsOfDay: [],
    reason: "",
    notify: false,
  });

  const { from: dateFrom, to: dateTo } = useMemo(
    () => computeDateRange(view, cursor),
    [view, cursor],
  );

  const { data: therapist } = useQuery({
    queryKey: ["my-therapist"],
    queryFn: getMyTherapist,
    enabled: !!userId,
  });

  const { data: workingHours } = useQuery({
    queryKey: ["availability", "working-hours"],
    queryFn: getWorkingHours,
  });

  const { data: workingDays = [] } = useQuery({
    queryKey: ["availability", "working-days"],
    queryFn: getWorkingDays,
  });

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["availability", "slots-range", dateFrom, dateTo],
    queryFn: () => getSlotsForRange(dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
  });

  const { data: auditLog = [] } = useQuery({
    queryKey: ["availability", "audit-log"],
    queryFn: getAuditLog,
  });

  const { data: blockRequests = [] } = useQuery({
    queryKey: ["availability", "block-requests"],
    queryFn: getBlockRequests,
  });

  useEffect(() => {
    if (workingHours) {
      setScheduleConfig((prev) => ({
        ...prev,
        startTime: workingHours.start,
        endTime: workingHours.end,
      }));
    }
  }, [workingHours]);

  const slots: SlotInfo[] = slotsData?.slots ?? [];

  const expectedTimes = useMemo(() => {
    const times = new Set<string>();
    const [sh, sm] = scheduleConfig.startTime.split(":").map(Number);
    const [eh, em] = scheduleConfig.endTime.split(":").map(Number);
    let cursor = sh * 60 + (sm || 0);
    const end = eh * 60 + (em || 0);
    const step = scheduleConfig.sessionDuration + scheduleConfig.breakDuration;
    while (cursor + scheduleConfig.sessionDuration <= end) {
      const h = Math.floor(cursor / 60);
      const m = cursor % 60;
      times.add(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      cursor += step;
    }
    return times;
  }, [scheduleConfig]);

  const slotsByDate = useMemo(() => {
    const map: Record<string, SlotInfo[]> = {};
    for (const s of slots) {
      if (!expectedTimes.has(s.time)) continue;
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [slots, expectedTimes]);

  const blockedDates = useMemo(() => {
    const set = new Set<string>();
    for (const b of slotsData?.blocks ?? []) {
      const from = new Date(b.dateFrom + "T00:00:00");
      const to = new Date(b.dateTo + "T00:00:00");
      for (
        let d = new Date(from);
        d <= to;
        d.setDate(d.getDate() + 1)
      ) {
        const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (b.daysOfWeek.length === 0) {
          set.add(dk);
        } else {
          const dayName = DAY_NAMES[d.getDay()];
          if (b.daysOfWeek.includes(dayName)) {
            set.add(dk);
          }
        }
      }
    }
    return set;
  }, [slotsData?.blocks]);

  const blockedPartsByDate = useMemo(() => {
    const map: Record<string, DayPart[]> = {};
    for (const b of slotsData?.blocks ?? []) {
      const from = new Date(b.dateFrom + "T00:00:00");
      const to = new Date(b.dateTo + "T00:00:00");
      const blockParts = (b.partsOfDay ?? []) as DayPart[];
      for (
        let d = new Date(from);
        d <= to;
        d.setDate(d.getDate() + 1)
      ) {
        const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const dayName = DAY_NAMES[d.getDay()];
        const dayApplies =
          b.daysOfWeek.length === 0 || b.daysOfWeek.includes(dayName);
        if (!dayApplies) continue;
        if (blockParts.length === 0) {
          map[dk] = ["morning", "afternoon", "evening"];
        } else {
          map[dk] = [...new Set([...(map[dk] ?? []), ...blockParts])];
        }
      }
    }
    return map;
  }, [slotsData?.blocks]);

  const generateMutation = useMutation({
    mutationFn: generateAvailability,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["availability", "slots-range"] });
      toast.success(`Availability updated — ${res.updated} slots changed`, {
        duration: 4500,
      });
      setLastAction({
        type: "generate",
        description: "Availability generated",
        undoFn: async () => {},
      });
    },
    onError: () => toast.error("Failed to generate availability"),
  });

  const blockMutation = useMutation({
    mutationFn: blockRange,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["availability", "slots-range"] });
      queryClient.invalidateQueries({ queryKey: ["availability", "audit-log"] });
      const msg =
        res.cancelledCount > 0
          ? `Blocked — ${res.cancelledCount} booking(s) cancelled`
          : `Blocked ${res.blocked} slot(s)`;
      toast.success(msg, { duration: 4500 });
      setLastAction({
        type: "block",
        description: msg,
        undoFn: async () => {},
      });
    },
    onError: () => toast.error("Failed to block time"),
  });

  const unblockMutation = useMutation({
    mutationFn: unblockTime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "slots-range"] });
      queryClient.invalidateQueries({ queryKey: ["availability", "audit-log"] });
      toast.success("Time unblocked", { duration: 4500 });
    },
    onError: () => toast.error("Failed to unblock time"),
  });

  const toggleSlotMutation = useMutation({
    mutationFn: ({
      date,
      time,
      currentStatus,
    }: {
      date: string;
      time: string;
      currentStatus: string;
    }) => {
      const newStatus = currentStatus === "open" ? "off" : "open";
      return setSlotStatus(date, time, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "slots-range"] });
    },
    onError: () => toast.error("Failed to update slot"),
  });

  const deleteAuditMutation = useMutation({
    mutationFn: deleteAuditEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "audit-log"] });
      toast.success("Entry removed");
    },
    onError: () => toast.error("Failed to remove entry"),
  });

  const blockRequestMutation = useMutation({
    mutationFn: createBlockRequest,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["availability", "block-requests"] });
      toast.success("Block request sent to admin", { duration: 4500 });
      setLastAction({
        type: "block",
        description: "Block request sent",
        undoFn: async () => {},
      });
    },
    onError: () => toast.error("Failed to send block request"),
  });

  const navigateCursor = useCallback(
    (direction: "prev" | "next") => {
      const offset = direction === "next" ? 1 : -1;
      switch (view) {
        case "daily":
          setCursor((c) => addDays(c, offset));
          break;
        case "weekly":
          setCursor((c) => addDays(c, offset * 7));
          break;
        case "monthly":
          setCursor((c) => {
            const d = new Date(c + "T00:00:00");
            d.setMonth(d.getMonth() + offset);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          });
          break;
      }
    },
    [view],
  );

  const undoLast = useCallback(async () => {
    if (lastAction) {
      await lastAction.undoFn();
      setLastAction(null);
      toast.success("Undone");
    }
  }, [lastAction]);

  const applyPreset = useCallback(
    (preset: "today" | "4weeks" | "month" | "ongoing") => {
      const today = todayStr();
      switch (preset) {
        case "today":
          setScheduleConfig((prev) => ({
            ...prev,
            dateFrom: today,
            dateTo: today,
          }));
          break;
        case "4weeks":
          setScheduleConfig((prev) => ({
            ...prev,
            dateFrom: today,
            dateTo: addDays(today, 27),
          }));
          break;
        case "month":
          setScheduleConfig((prev) => ({
            ...prev,
            dateFrom: today,
            dateTo: endOfMonth(today),
          }));
          break;
        case "ongoing":
          setScheduleConfig((prev) => ({
            ...prev,
            dateFrom: today,
            dateTo: null,
          }));
          break;
      }
    },
    [],
  );

  const hasBookedSlotsInRange = useCallback(
    (dateFrom: string, dateTo: string, daysOfWeek: string[], partsOfDay: string[]): boolean => {
      const from = new Date(dateFrom + "T00:00:00");
      const to = new Date(dateTo + "T00:00:00");
      const daySet = new Set(daysOfWeek);
      const timeRanges =
        partsOfDay.length > 0
          ? partsOfDayTimeRanges(partsOfDay as DayPart[])
          : null;

      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const dayName = DAY_NAMES[d.getDay()];
        if (daySet.size > 0 && !daySet.has(dayName)) continue;
        const daySlots = slotsByDate[dk] ?? [];
        for (const slot of daySlots) {
          if (slot.status !== "booked") continue;
          if (timeRanges && !timeInRange(slot.time, timeRanges)) continue;
          return true;
        }
      }
      return false;
    },
    [slotsByDate],
  );

  return {
    view,
    setView,
    cursor,
    setCursor,
    navigateCursor,
    builderMode,
    setBuilderMode,
    scheduleConfig,
    setScheduleConfig,
    blockConfig,
    setBlockConfig,
    applyPreset,
    dateFrom,
    dateTo,
    workingHours: workingHours ?? {
      start: "08:00",
      end: "18:00",
      slotInterval: 60,
    } as WorkingHours,
    workingDays,
    slots,
    slotsByDate,
    blockedDates,
    blockedPartsByDate,
    auditLog,
    isLoading: slotsLoading,
    generateAvailability: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    blockRange: blockMutation.mutateAsync,
    isBlocking: blockMutation.isPending,
    unblockTime: unblockMutation.mutateAsync,
    isUnblocking: unblockMutation.isPending,
    toggleSlot: toggleSlotMutation.mutateAsync,
    isToggling: toggleSlotMutation.isPending,
    deleteAuditEntry: deleteAuditMutation.mutateAsync,
    blockRequest: blockRequestMutation.mutateAsync,
    isRequestingBlock: blockRequestMutation.isPending,
    hasBookedSlotsInRange,
    blockRequests,
    lastAction,
    undoLast,
  };
}
