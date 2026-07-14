export const SLOT_INTERVAL_MINUTES = 120;

export type SlotStatus = "open" | "booked" | "off";

export interface WorkingHours {
  start: string;
  end: string;
}

export interface SlotInfo {
  date: string;
  time: string;
  status: SlotStatus;
  patientName?: string;
  patientPhone?: string;
  sessionType?: string;
  fee?: number;
}

export interface MonthlyGrid {
  month: string;
  year: number;
  slots: SlotInfo[];
}

export interface RecurringPattern {
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

function dateKeyStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Compare a date string (YYYY-MM-DD) against today. True if the date is strictly before today. */
export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return d < today;
}

/** Compare a date+time against the current moment. True if the slot's time has already passed. */
export function isSlotInPast(dateStr: string, time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(h, m, 0, 0);
  return d < new Date();
}

// ─── MOCK DATA STORE ───

const MOCK_WORKING_HOURS: Record<string, WorkingHours> = {
  "therapist-1": { start: "08:00", end: "18:00" },
  "therapist-2": { start: "09:00", end: "17:00" },
  "therapist-3": { start: "10:00", end: "19:00" },
};

const MOCK_PATIENTS: Record<string, { name: string; phone: string }> = {
  p1: { name: "Anita Sharma", phone: "+977-9841XXXXXX" },
  p2: { name: "Rajesh Thapa", phone: "+977-9851XXXXXX" },
  p3: { name: "Suman Gurung", phone: "+977-9801XXXXXX" },
};

interface MockSlot {
  status: SlotStatus;
  patientId?: string;
  sessionType?: string;
  fee?: number;
}

type MockGrid = Record<string, MockSlot>;

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth();
const CURRENT_DAY = now.getDate();

let mockGrid: MockGrid = buildMockGrid("08:00", "18:00");

function buildMockGrid(start: string, end: string): MockGrid {
  const grid: MockGrid = {};
  const times = generateTimeSlots(start, end, SLOT_INTERVAL_MINUTES);
  const daysInMonth = new Date(CURRENT_YEAR, CURRENT_MONTH + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(CURRENT_YEAR, CURRENT_MONTH, d);
    if (date.getMonth() !== CURRENT_MONTH) break;
    const dow = date.getDay();
    const dk = dateKeyStr(CURRENT_YEAR, CURRENT_MONTH, d);

    for (const time of times) {
      const key = `${dk}_${time}`;
      const period = sessionPeriodForTime(time);

      if (d < CURRENT_DAY && dow !== 0 && dow !== 6 && Math.random() < 0.35) {
        const pKeys = Object.keys(MOCK_PATIENTS);
        grid[key] = {
          status: "booked",
          patientId: pKeys[Math.floor(Math.random() * pKeys.length)],
          sessionType: period,
          fee: 1200,
        };
      } else if (d >= CURRENT_DAY && d <= CURRENT_DAY + 3 && dow !== 0 && dow !== 6 && Math.random() < 0.3) {
        const pKeys = Object.keys(MOCK_PATIENTS);
        grid[key] = {
          status: "booked",
          patientId: pKeys[Math.floor(Math.random() * pKeys.length)],
          sessionType: period,
          fee: 1200,
        };
      } else if (dow === 0) {
        grid[key] = { status: "off", sessionType: period };
      } else {
        grid[key] = { status: "open", sessionType: period };
      }
    }
  }
  return grid;
}

// ─── SERVICE API ───

export async function getTherapistWorkingHours(therapistId: string): Promise<WorkingHours> {
  await sleep();
  return MOCK_WORKING_HOURS[therapistId] ?? { start: "08:00", end: "18:00" };
}

export async function getAvailability(
  therapistId: string,
  month: number,
  year: number,
  workingHours?: WorkingHours
): Promise<MonthlyGrid> {
  await sleep();
  const wh = workingHours ?? (await getTherapistWorkingHours(therapistId));
  const times = generateTimeSlots(wh.start, wh.end, SLOT_INTERVAL_MINUTES);
  const slots: SlotInfo[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dk = dateKeyStr(year, month, d);
    for (const time of times) {
      const key = `${dk}_${time}`;
      const mock = mockGrid[key];
      const info: SlotInfo = {
        date: dk,
        time,
        status: mock?.status ?? "open",
        sessionType: sessionPeriodForTime(time),
      };
      if (mock?.status === "booked" && mock.patientId) {
        const patient = MOCK_PATIENTS[mock.patientId];
        info.patientName = patient?.name;
        info.patientPhone = patient?.phone;
        info.fee = mock.fee;
      }
      slots.push(info);
    }
  }
  return { month: `${year}-${String(month + 1).padStart(2, "0")}`, year, slots };
}

/** Return per-day slot summaries for an entire month (for the monthly calendar view). */
export async function getMonthSummary(
  _therapistId: string,
  month: number,
  year: number,
  workingHours?: WorkingHours
): Promise<MonthDaySummary[]> {
  await sleep();
  const wh = workingHours ?? { start: "08:00", end: "18:00" };
  const times = generateTimeSlots(wh.start, wh.end, SLOT_INTERVAL_MINUTES);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const summaries: MonthDaySummary[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dk = dateKeyStr(year, month, d);
    const counts = { open: 0, booked: 0, off: 0 };
    for (const time of times) {
      const key = `${dk}_${time}`;
      const mock = mockGrid[key];
      const status: SlotStatus = mock?.status ?? "open";
      counts[status]++;
    }
    summaries.push({ date: dk, ...counts });
  }
  return summaries;
}

export async function setSlotStatus(
  _therapistId: string,
  date: string,
  time: string,
  status: SlotStatus
): Promise<void> {
  await sleep();
  const key = `${date}_${time}`;
  const existing = mockGrid[key];
  if (existing?.status === "booked") return;
  if (existing) {
    existing.status = status;
  } else {
    mockGrid[key] = { status };
  }
}

export async function applyRecurringPattern(
  _therapistId: string,
  pattern: RecurringPattern,
  workingHours?: WorkingHours
): Promise<{ affected: number; skippedPast: number }> {
  await sleep();
  const wh = workingHours ?? { start: "08:00", end: "18:00" };
  const times = generateTimeSlots(wh.start, wh.end, SLOT_INTERVAL_MINUTES);
  let count = 0;
  let skippedPast = 0;
  const daysInMonth = new Date(CURRENT_YEAR, CURRENT_MONTH + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(CURRENT_YEAR, CURRENT_MONTH, d);
    const dow = date.getDay();
    if (!pattern.days.includes(dow)) continue;
    const dk = dateKeyStr(CURRENT_YEAR, CURRENT_MONTH, d);

    for (const time of times) {
      const period = sessionPeriodForTime(time);
      if (!pattern.sessions.includes(period)) continue;

      if (isSlotInPast(dk, time)) {
        skippedPast++;
        continue;
      }

      const key = `${dk}_${time}`;
      const existing = mockGrid[key];
      if (existing?.status === "booked") continue;
      if (existing) {
        existing.status = "open";
      } else {
        mockGrid[key] = { status: "open", sessionType: period };
      }
      count++;
    }
  }
  return { affected: count, skippedPast };
}

export async function openFullMonth(
  _therapistId: string,
  options: OpenFullMonthOptions,
  workingHours?: WorkingHours
): Promise<{ opened: number; skippedBooked: number; skippedPast: number }> {
  await sleep();
  const wh = workingHours ?? { start: "08:00", end: "18:00" };
  const times = generateTimeSlots(wh.start, wh.end, SLOT_INTERVAL_MINUTES);
  let opened = 0;
  let skippedBooked = 0;
  let skippedPast = 0;
  const daysInMonth = new Date(options.year, options.month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(options.year, options.month, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    if (!options.days.includes(dow)) continue;
    const dk = dateKeyStr(options.year, options.month, d);

    for (const time of times) {
      const period = sessionPeriodForTime(time);
      if (!options.sessions.includes(period)) continue;

      if (isSlotInPast(dk, time)) {
        skippedPast++;
        continue;
      }

      const key = `${dk}_${time}`;
      const existing = mockGrid[key];
      if (existing?.status === "booked") {
        skippedBooked++;
        continue;
      }
      if (existing) {
        existing.status = "open";
      } else {
        mockGrid[key] = { status: "open", sessionType: period };
      }
      opened++;
    }
  }
  return { opened, skippedBooked, skippedPast };
}

export async function blockDate(
  _therapistId: string,
  date: string,
  workingHours?: WorkingHours,
  sessions?: string[]
): Promise<{ blocked: number }> {
  await sleep();
  const wh = workingHours ?? { start: "08:00", end: "18:00" };
  const times = generateTimeSlots(wh.start, wh.end, SLOT_INTERVAL_MINUTES);
  let blocked = 0;
  for (const time of times) {
    if (sessions && sessions.length > 0 && !sessions.includes(sessionPeriodForTime(time))) continue;
    const key = `${date}_${time}`;
    const existing = mockGrid[key];
    if (existing?.status === "booked") continue;
    if (existing) {
      existing.status = "off";
    } else {
      mockGrid[key] = { status: "off" };
    }
    blocked++;
  }
  return { blocked };
}

export function countOpenSlotsForMonth(
  year: number,
  month: number,
  days: number[],
  sessions: string[],
  workingHours: WorkingHours
): { total: number; booked: number; skippedPast: number } {
  const times = generateTimeSlots(workingHours.start, workingHours.end, SLOT_INTERVAL_MINUTES);
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
      if (mockGrid[key]?.status === "booked") booked++;
    }
  }
  return { total, booked, skippedPast };
}

function sleep(): Promise<void> {
  return new Promise((r) => setTimeout(r, 50 + Math.random() * 60));
}
