import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parse, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";

export type WorkPeriod = {
  start: Date | null;
  end: Date | null;
  present: boolean;
};

export type WorkPeriodSerialized = {
  start: string | null;
  end: string | null;
  present: boolean;
};

export const RU_DATE_FORMAT = "dd.MM.yyyy";

export function toDay(d: Date) {
  return startOfDay(d);
}

export function formatRuDate(d: Date) {
  return format(d, RU_DATE_FORMAT, { locale: ru });
}

export function parseRuDate(value: string) {
  const parsed = parse(value, RU_DATE_FORMAT, new Date(), { locale: ru });
  if (Number.isNaN(parsed.getTime())) return null;
  return toDay(parsed);
}

export function serializePeriod(value: WorkPeriod): WorkPeriodSerialized {
  return {
    start: value.start ? formatRuDate(value.start) : null,
    end: value.end ? formatRuDate(value.end) : null,
    present: value.present,
  };
}

export function todayDay() {
  return toDay(new Date());
}

export function ensureValidRange(start: Date | null, end: Date | null) {
  if (!start || !end) return { start, end };
  if (end.getTime() < start.getTime()) return { start, end: start };
  return { start, end };
}

export function applyPresentToggle(value: WorkPeriod, present: boolean): WorkPeriod {
  if (!present) return { ...value, present: false, end: null };
  const today = todayDay();
  const nextStart = value.start ? (value.start.getTime() > today.getTime() ? today : value.start) : today;
  return { start: nextStart, end: today, present: true };
}

export function applyDateClick(value: WorkPeriod, clicked: Date): WorkPeriod {
  const day = toDay(clicked);
  if (value.present) {
    const today = todayDay();
    const nextStart = day.getTime() > today.getTime() ? today : day;
    return { start: nextStart, end: today, present: true };
  }
  if (!value.start || (value.start && value.end)) {
    return { start: day, end: null, present: false };
  }
  if (day.getTime() < value.start.getTime()) {
    return { start: day, end: null, present: false };
  }
  return { start: value.start, end: day, present: false };
}

export type CalendarCell = {
  date: Date;
  inMonth: boolean;
};

export function buildMonthGrid(month: Date, weekStartsOn: 0 | 1 = 1) {
  const first = startOfMonth(month);
  const start = startOfWeek(first, { weekStartsOn });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn });
  const rows: CalendarCell[][] = [];
  let cursor = start;
  while (cursor.getTime() <= end.getTime()) {
    const row: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      const d = cursor;
      row.push({ date: d, inMonth: isSameMonth(d, month) });
      cursor = addDays(cursor, 1);
    }
    rows.push(row);
  }
  return rows;
}

export function isInRange(value: WorkPeriod, day: Date) {
  const d = toDay(day);
  if (!value.start || !value.end) return false;
  const t = d.getTime();
  return t >= value.start.getTime() && t <= value.end.getTime();
}

export function getMonthTitle(month: Date) {
  return format(month, "LLLL yyyy", { locale: ru });
}

export function getDayAriaLabel(day: Date) {
  return format(day, "d MMMM yyyy", { locale: ru });
}

export function moveFocus(current: Date, key: string) {
  const day = toDay(current);
  if (key === "ArrowLeft") return addDays(day, -1);
  if (key === "ArrowRight") return addDays(day, 1);
  if (key === "ArrowUp") return addDays(day, -7);
  if (key === "ArrowDown") return addDays(day, 7);
  if (key === "PageUp") return addMonths(day, -1);
  if (key === "PageDown") return addMonths(day, 1);
  if (key === "Home") {
    const start = startOfWeek(day, { weekStartsOn: 1 });
    return start;
  }
  if (key === "End") {
    const end = endOfWeek(day, { weekStartsOn: 1 });
    return end;
  }
  return day;
}

export function isSameDaySafe(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return isSameDay(a, b);
}
