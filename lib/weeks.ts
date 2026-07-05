// Week helpers. The approval dashboard looks at a configurable horizon
// (1, 2, or 3 weeks forward, defaulting to the current week) and labels
// each window with a clean date range, not childish "next week" phrasing.

export function getISOWeekId(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "Jul 7–13" or "Jun 28–Jul 4" — clean range, no childish "next week".
export function weekRangeLabel(start: Date): string {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  return sameMonth
    ? `${MONTH_LABELS[start.getMonth()]} ${start.getDate()}–${end.getDate()}`
    : `${MONTH_LABELS[start.getMonth()]} ${start.getDate()}–${MONTH_LABELS[end.getMonth()]} ${end.getDate()}`;
}

// "Jul 7–13, 2026" — full label for the active tab header.
export function weekRangeLabelFull(start: Date): string {
  return `${weekRangeLabel(start)}, ${start.getFullYear()}`;
}

export function dayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${DAY_LABELS[d.getUTCDay()]}, ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function fullDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${DAY_LABELS[d.getUTCDay()]}, ${MONTH_LABELS_FULL[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export interface WeekKey {
  weekId: string;
  start: Date;
}

export function weekKeyForDate(date: Date): WeekKey {
  const start = startOfWeek(date);
  return { weekId: getISOWeekId(date), start };
}

export type WeekHorizon = 1 | 2 | 3;

// N consecutive ISO weeks starting from the current week.
export function approvalWindows(
  horizon: WeekHorizon = 1,
  from: Date = new Date()
): WeekKey[] {
  const thisStart = startOfWeek(from);
  const windows: WeekKey[] = [];
  for (let i = 0; i < horizon; i++) {
    const start = addDays(thisStart, 7 * i);
    windows.push(weekKeyForDate(start));
  }
  return windows;
}