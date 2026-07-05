// ISO-week + label helpers, tuned for an approval cadence that looks
// at "next week" and "the week after that".

export function getISOWeekId(date: Date): string {
  // ISO week: Thursday-defines-year, week starts Monday.
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
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function weekRangeLabel(start: Date): string {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = `${MONTH_LABELS[start.getMonth()]} ${start.getDate()}`;
  const endStr = `${MONTH_LABELS[end.getMonth()]} ${end.getDate()}`;
  return sameMonth
    ? `${MONTH_LABELS[start.getMonth()]} ${start.getDate()}–${end.getDate()}`
    : `${startStr}–${endStr}`;
}

export function dayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${DAY_LABELS[d.getUTCDay()]} ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function fullDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${DAY_LABELS[d.getUTCDay()]}, ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export interface WeekKey {
  weekId: string;
  start: Date;
}

export function weekKeyForDate(date: Date): WeekKey {
  const start = startOfWeek(date);
  return { weekId: getISOWeekId(date), start };
}

export function nextWeekKey(from: Date): WeekKey {
  return weekKeyForDate(addDays(startOfWeek(from), 7));
}

export function weekAfterNextKey(from: Date): WeekKey {
  return weekKeyForDate(addDays(startOfWeek(from), 14));
}

// The three weeks the dashboard cares about — relative to "today".
export function approvalWindows(from: Date = new Date()): WeekKey[] {
  const thisWeek = weekKeyForDate(from);
  return [thisWeek, nextWeekKey(from), weekAfterNextKey(from)];
}