"use server";

import { api, AuthError } from "./client";
import type { WorkingHours, MonthlyGrid, SlotInfo } from "@/lib/availability-utils";

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

export async function blockDate(
  date: string,
  sessions?: string[],
): Promise<{ blocked: number }> {
  return api.post<{ blocked: number }>("/availability/block-date", {
    date,
    sessions,
  });
}

export interface AuditLogEntry {
  id: string;
  date: string;
  reason: string;
  who: string;
  slotKey: string | null;
  time: string | null;
  source: string;
  createdAt: string;
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  try {
    return await api.get<AuditLogEntry[]>("/availability/audit-log");
  } catch {
    return [];
  }
}

export async function createAuditEntry(
  entry: Omit<AuditLogEntry, "id" | "createdAt">,
): Promise<AuditLogEntry> {
  return api.post<AuditLogEntry>("/availability/audit-log", entry);
}

export async function deleteAuditEntry(id: string): Promise<void> {
  await api.delete(`/availability/audit-log/${id}`);
}

export interface SlotRangeData {
  slots: SlotInfo[];
  blocks: BlockData[];
}

export interface BlockData {
  id: string;
  dateFrom: string;
  dateTo: string;
  daysOfWeek: string[];
  partsOfDay: string[];
  reason: string;
  notify: boolean;
  createdAt: string;
}

export async function generateAvailability(data: {
  dateFrom: string;
  dateTo?: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  breakDuration: number;
}): Promise<{ updated: number }> {
  return api.post<{ updated: number }>("/availability/generate", data);
}

export async function blockRange(data: {
  dateFrom: string;
  dateTo?: string;
  daysOfWeek: string[];
  partsOfDay: string[];
  reason: string;
  notify: boolean;
}): Promise<{
  blocked: number;
  cancelledCount: number;
  affectedPatients: { name: string; date: string; time: string }[];
}> {
  return api.post("/availability/block-range", data);
}

export async function unblockTime(data: {
  date: string;
  time?: string;
}): Promise<void> {
  await api.post("/availability/unblock", data);
}

export async function getSlotsForRange(
  fromDate: string,
  toDate: string,
): Promise<SlotRangeData> {
  return api.get<SlotRangeData>(
    `/availability/slots?from_date=${fromDate}&to_date=${toDate}`,
  );
}

export async function getWorkingDays(): Promise<string[]> {
  try {
    return await api.get<string[]>("/availability/working-days");
  } catch {
    return [];
  }
}
