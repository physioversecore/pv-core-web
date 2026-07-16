export const DEFAULT_SLOT_INTERVAL = 60;

export type SlotStatus = "open" | "booked" | "off";

export type DayPart = "morning" | "afternoon" | "evening";

export const DAY_PART_RANGES: Record<DayPart, [number, number]> = {
  morning: [6, 12],
  afternoon: [12, 17],
  evening: [17, 22],
};

export function isTimeInDayParts(time: string, parts: DayPart[]): boolean {
  const [h] = time.split(":").map(Number);
  return parts.some((p) => {
    const [start, end] = DAY_PART_RANGES[p];
    return h >= start && h < end;
  });
}

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

export interface MonthDaySummary {
  date: string;
  open: number;
  booked: number;
  off: number;
}

export interface SessionBreakConfig {
  sessionDuration: number;
  breakDuration: number;
  startTime: string;
  endTime: string;
}

export interface SessionBlock {
  startTime: string;
  endTime: string;
  type: "session" | "break";
  index: number;
}

// ─── PURE HELPERS ───

function minsToTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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

export function generateSessionBlocks(config: SessionBreakConfig): SessionBlock[] {
  const blocks: SessionBlock[] = [];
  const [sh, sm] = config.startTime.split(":").map(Number);
  const [eh, em] = config.endTime.split(":").map(Number);
  let cursorMin = sh * 60 + (sm || 0);
  const endMin = eh * 60 + (em || 0);
  let idx = 1;

  while (cursorMin + config.sessionDuration <= endMin) {
    const sessionEnd = cursorMin + config.sessionDuration;
    blocks.push({
      startTime: minsToTime(cursorMin),
      endTime: minsToTime(sessionEnd),
      type: "session",
      index: idx,
    });
    cursorMin = sessionEnd;

    if (config.breakDuration > 0 && cursorMin + config.breakDuration <= endMin) {
      const breakEnd = cursorMin + config.breakDuration;
      blocks.push({
        startTime: minsToTime(cursorMin),
        endTime: minsToTime(breakEnd),
        type: "break",
        index: idx,
      });
      cursorMin = breakEnd;
    }

    idx++;
  }

  return blocks;
}

export function sessionBlockTimes(blocks: SessionBlock[]): string[] {
  const times: string[] = [];
  for (const block of blocks) {
    if (block.type !== "session") continue;
    const [sh] = block.startTime.split(":").map(Number);
    const [eh] = block.endTime.split(":").map(Number);
    for (let h = sh; h < eh; h++) {
      times.push(`${String(h).padStart(2, "0")}:00`);
    }
  }
  return times;
}

export function breakBlockTimes(blocks: SessionBlock[]): string[] {
  const times: string[] = [];
  for (const block of blocks) {
    if (block.type !== "break") continue;
    const [sh] = block.startTime.split(":").map(Number);
    const [eh] = block.endTime.split(":").map(Number);
    for (let h = sh; h < eh; h++) {
      times.push(`${String(h).padStart(2, "0")}:00`);
    }
  }
  return times;
}

export function blockHourTimes(block: SessionBlock): string[] {
  const times: string[] = [];
  const [sh] = block.startTime.split(":").map(Number);
  const [eh] = block.endTime.split(":").map(Number);
  for (let h = sh; h < eh; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
  }
  return times;
}

export function blockDurationMins(block: SessionBlock): number {
  const [sh, sm] = block.startTime.split(":").map(Number);
  const [eh, em] = block.endTime.split(":").map(Number);
  return (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
}

export interface SlotUpdate {
  date: string;
  time: string;
  status: "open" | "off";
}

export function generateSlotsFromConfig(
  config: SessionBreakConfig,
  days: number[],
  year: number,
  month: number,
  availability: Record<string, SlotInfo>,
): SlotUpdate[] {
  const blocks = generateSessionBlocks(config);
  const sessionTimes = new Set(sessionBlockTimes(blocks));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const updates: SlotUpdate[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    if (!days.includes(dow)) continue;

    const dk = dateKeyStr(year, month, d);
    if (isDateInPast(dk)) continue;

    for (let h = 0; h < 24; h++) {
      const time = `${String(h).padStart(2, "0")}:00`;
      if (isSlotInPast(dk, time)) continue;

      const key = `${dk}_${time}`;
      const current = availability[key];
      if (current?.status === "booked") continue;

      const shouldBeOpen = sessionTimes.has(time);
      updates.push({ date: dk, time, status: shouldBeOpen ? "open" : "off" });
    }
  }

  return updates;
}
