export const DEFAULT_SLOT_INTERVAL = 120;

export type SlotStatus = "open" | "booked" | "off";

export interface WorkingHours {
  start: string;
  end: string;
  slotInterval: number;
}

export interface SlotInfo {
  date: string;
  time: string;
  status: SlotStatus;
  patientName?: string;
  patientPhone?: string;
  sessionType?: string;
  fee?: number;
  sessionId?: string;
}

export interface MonthlyGrid {
  month: string;
  year: number;
  slots: SlotInfo[];
}

export interface RecurringPattern {
  id: string;
  therapistId: string;
  days: number[];
  sessions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RecurringPatternInput {
  days: number[];
  sessions: string[];
}

export interface OpenFullMonthOptions {
  days: number[];
  sessions: string[];
  month: number;
  year: number;
}

export interface MonthDaySummary {
  date: string;
  open: number;
  booked: number;
  off: number;
}

// ─── PURE HELPERS ───

export function generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
  const [sh] = start.split(":").map(Number);
  const [eh] = end.split(":").map(Number);
  const slots: string[] = [];
  let mins = sh * 60;
  const endMins = eh * 60;
  while (mins < endMins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    mins += intervalMinutes;
  }
  return slots;
}

export function sessionPeriodForTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const mins = h * 60 + (m || 0);
  if (mins < 12 * 60) return "Morning";
  if (mins < 17 * 60) return "Afternoon";
  return "Evening";
}

export const DAY_PARTS: Record<string, { from: string; to: string }> = {
  Morning: { from: "08:00", to: "11:59" },
  Afternoon: { from: "12:00", to: "16:59" },
  Evening: { from: "17:00", to: "20:59" },
};

export function isTimeWithinRange(time: string, range: { from: string; to: string }): boolean {
  return time >= range.from && time <= range.to;
}

export function dateKeyStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return d < today;
}

export function isSlotInPast(dateStr: string, time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(h, m, 0, 0);
  return d < new Date();
}

export function countOpenSlotsForMonth(
  year: number,
  month: number,
  days: number[],
  sessions: string[],
  workingHours: WorkingHours,
  availabilityStore?: Record<string, SlotInfo>,
): { total: number; booked: number; skippedPast: number } {
  const times = generateTimeSlots(workingHours.start, workingHours.end, workingHours.slotInterval ?? DEFAULT_SLOT_INTERVAL);
  let total = 0;
  let booked = 0;
  let skippedPast = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    if (!days.includes(dow)) continue;
    const dk = dateKeyStr(year, month, d);

    for (const time of times) {
      if (!sessions.includes(sessionPeriodForTime(time))) continue;

      if (isSlotInPast(dk, time)) {
        skippedPast++;
        continue;
      }

      total++;
      const key = `${dk}_${time}`;
      if (availabilityStore?.[key]?.status === "booked") booked++;
    }
  }
  return { total, booked, skippedPast };
}
