"use server";

import { api, AuthError } from "./client";
import type { WorkingHours, MonthlyGrid, RecurringPattern, RecurringPatternInput, OpenFullMonthOptions } from "@/lib/availability-utils";

export async function getWorkingHours(): Promise<WorkingHours> {
  try {
    return await api.get<WorkingHours>("/availability/working-hours");
  } catch (e) {
    if (e instanceof AuthError) return { start: "08:00", end: "18:00", slotInterval: 120 };
    throw e;
  }
}

export async function updateWorkingHours(hours: WorkingHours): Promise<WorkingHours> {
  return api.put<WorkingHours>("/availability/working-hours", hours);
}

export async function getMonthlyAvailability(
  month: number,
  year: number,
): Promise<MonthlyGrid> {
  try {
    return await api.get<MonthlyGrid>(
      `/availability?month=${month + 1}&year=${year}`,
    );
  } catch (e) {
    if (e instanceof AuthError) return { month: `${year}-${String(month + 1).padStart(2, "0")}`, year, slots: [] };
    throw e;
  }
}

export async function setSlotStatus(
  date: string,
  time: string,
  status: string,
): Promise<void> {
  await api.post("/availability/slot", { date, time, status });
}

export async function bulkUpdateSlots(
  slots: { date: string; time: string; status: string }[],
): Promise<{ updated: number }> {
  return api.post<{ updated: number }>("/availability/bulk", { slots });
}

export async function applyRecurringPattern(
  pattern: RecurringPatternInput,
): Promise<{ affected: number; skippedPast: number; patternId: string }> {
  return api.post<{ affected: number; skippedPast: number; patternId: string }>(
    "/availability/recurring",
    pattern,
  );
}

export async function getRecurringPatterns(): Promise<RecurringPattern[]> {
  try {
    const res = await api.get<{ patterns: RecurringPattern[] }>("/availability/recurring");
    return res.patterns ?? [];
  } catch (e) {
    if (e instanceof AuthError) return [];
    throw e;
  }
}

export async function deleteRecurringPattern(id: string): Promise<void> {
  await api.delete(`/availability/recurring/${id}`);
}

export async function toggleRecurringPattern(
  id: string,
  isActive: boolean,
): Promise<void> {
  await api.put(`/availability/recurring/${id}`, { isActive });
}

export async function openFullMonth(
  options: OpenFullMonthOptions,
): Promise<{ opened: number; skippedBooked: number; skippedPast: number }> {
  return api.post<{ opened: number; skippedBooked: number; skippedPast: number }>(
    "/availability/open-month",
    options,
  );
}

export async function blockDate(
  date: string,
  sessions?: string[],
): Promise<{ blocked: number }> {
  return api.post<{ blocked: number }>("/availability/block-date", {
    date,
    sessions,
  });
}

export async function applySchedule(
  recurrence: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<{ opened: number; skippedBooked: number; skippedPast: number; from: string; to: string }> {
  return api.post("/availability/apply-schedule", {
    recurrence,
    dateFrom,
    dateTo,
  });
}
