"use server";

export {
  getWorkingHours,
  updateWorkingHours,
  getMonthlyAvailability,
  setSlotStatus,
  bulkUpdateSlots,
  blockDate,
} from "@/services/api/availability";

export type {
  WorkingHours,
  SlotInfo,
  SlotStatus,
  MonthlyGrid,
  MonthDaySummary,
} from "@/lib/availability-utils";
