export interface GridDay {
  date: Date;
  dateStr: string;
  isInYear: boolean;
}

export interface MonthLabel {
  month: number;
  weekIdx: number;
}

export interface GridData {
  weeks: (GridDay | null)[][];
  monthLabels: MonthLabel[];
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Builds a week-major grid for the given year.
 * Weeks run Monday → Sunday to match GitHub-style contribution graphs.
 */
export function generateYearGrid(year: number): GridData {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  // Snap grid start to the Monday on or before Jan 1
  const jan1Dow = jan1.getDay(); // 0=Sun
  const offsetToMonday = jan1Dow === 0 ? -6 : 1 - jan1Dow;
  const gridStart = new Date(jan1);
  gridStart.setDate(gridStart.getDate() + offsetToMonday);

  // Snap grid end to the Sunday on or after Dec 31
  const dec31Dow = dec31.getDay();
  const offsetToSunday = dec31Dow === 0 ? 0 : 7 - dec31Dow;
  const gridEnd = new Date(dec31);
  gridEnd.setDate(gridEnd.getDate() + offsetToSunday);

  const weeks: (GridDay | null)[][] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week: (GridDay | null)[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(cursor),
        dateStr: toDateStr(cursor),
        isInYear: cursor.getFullYear() === year,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Find the column (week index) where each month starts
  const monthLabels: MonthLabel[] = [];
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = toDateStr(new Date(year, m, 1));
    const weekIdx = weeks.findIndex((week) => week.some((day) => day?.dateStr === firstOfMonth));
    if (weekIdx !== -1) {
      monthLabels.push({ month: m, weekIdx });
    }
  }

  return { weeks, monthLabels };
}

export function getTodayStr(): string {
  const now = new Date();
  return toDateStr(now);
}

export function getDaysInYear(year: number): number {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
}

export function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Mon=0 … Sun=6
export const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
// Show label only for Mon, Wed, Fri to avoid clutter
export const DAY_LABEL_VISIBLE = [true, false, true, false, true, false, false];
