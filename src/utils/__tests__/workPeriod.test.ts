import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addDays, startOfMonth } from "date-fns";
import {
  applyDateClick,
  applyPresentToggle,
  buildMonthGrid,
  ensureValidRange,
  formatRuDate,
  getDayAriaLabel,
  getMonthTitle,
  isInRange,
  isSameDaySafe,
  moveFocus,
  parseRuDate,
  serializePeriod,
  todayDay,
  toDay,
} from "../workPeriod";

describe("workPeriod utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats and parses RU date", () => {
    const d = toDay(new Date("2025-02-05T00:00:00Z"));
    const s = formatRuDate(d);
    expect(s).toBe("05.02.2025");
    const parsed = parseRuDate(s);
    expect(parsed ? formatRuDate(parsed) : null).toBe("05.02.2025");
    expect(parseRuDate("99.99.9999")).toBeNull();
  });

  it("serializes period with present", () => {
    const today = todayDay();
    const p = applyPresentToggle({ start: null, end: null, present: false }, true);
    const s = serializePeriod(p);
    expect(s.present).toBe(true);
    expect(s.end).toBe(formatRuDate(today));
    expect(s.start).toBe(formatRuDate(today));
  });

  it("applyPresentToggle(false) clears end and present", () => {
    const base = toDay(new Date("2025-02-05T00:00:00Z"));
    const value = { start: base, end: addDays(base, 1), present: true };
    const next = applyPresentToggle(value, false);
    expect(next.present).toBe(false);
    expect(next.end).toBeNull();
  });

  it("ensureValidRange clamps end to start when invalid", () => {
    const s = toDay(new Date("2025-02-10T00:00:00Z"));
    const e = toDay(new Date("2025-02-05T00:00:00Z"));
    const out = ensureValidRange(s, e);
    expect(out.end?.getTime()).toBe(s.getTime());
    expect(ensureValidRange(null, e).end).toBe(e);
    expect(ensureValidRange(s, addDays(s, 2)).end?.getTime()).toBe(addDays(s, 2).getTime());
  });

  it("applyDateClick selects range and resets when complete", () => {
    const base = toDay(new Date("2025-02-10T00:00:00Z"));
    const d1 = addDays(base, -2);
    const d2 = addDays(base, 3);
    let value = { start: null as any, end: null as any, present: false };
    value = applyDateClick(value, d1);
    expect(value.start?.toISOString().slice(0, 10)).toBe(d1.toISOString().slice(0, 10));
    expect(value.end).toBeNull();
    value = applyDateClick(value, d2);
    expect(value.end?.toISOString().slice(0, 10)).toBe(d2.toISOString().slice(0, 10));
    value = applyDateClick(value, base);
    expect(value.start?.toISOString().slice(0, 10)).toBe(base.toISOString().slice(0, 10));
    expect(value.end).toBeNull();
  });

  it("applyDateClick exits present mode", () => {
    const base = toDay(new Date("2025-02-10T00:00:00Z"));
    const value = { start: base, end: base, present: true };
    const next = applyDateClick(value, addDays(base, 1));
    expect(next.present).toBe(true);
    expect(next.end).not.toBeNull();
  });

  it("applyDateClick in present mode keeps start when before today", () => {
    const today = todayDay();
    const value = { start: today, end: today, present: true };
    const before = addDays(today, -5);
    const next = applyDateClick(value, before);
    expect(next.present).toBe(true);
    expect(next.start?.getTime()).toBe(toDay(before).getTime());
    expect(next.end ? formatRuDate(next.end) : null).toBe(formatRuDate(today));
  });

  it("buildMonthGrid returns 6 rows max and 7 columns", () => {
    const month = startOfMonth(new Date("2025-02-10T00:00:00Z"));
    const rows = buildMonthGrid(month, 1);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBeLessThanOrEqual(6);
    for (const row of rows) expect(row).toHaveLength(7);
  });

  it("buildMonthGrid supports Sunday week start", () => {
    const month = startOfMonth(new Date("2025-02-10T00:00:00Z"));
    const rows = buildMonthGrid(month, 0);
    expect(rows[0]).toHaveLength(7);
  });

  it("isInRange works for inclusive range", () => {
    const start = toDay(new Date("2025-02-01T00:00:00Z"));
    const end = toDay(new Date("2025-02-03T00:00:00Z"));
    const value = { start, end, present: false };
    expect(isInRange(value, start)).toBe(true);
    expect(isInRange(value, end)).toBe(true);
    expect(isInRange(value, toDay(new Date("2025-02-02T00:00:00Z")))).toBe(true);
    expect(isInRange(value, toDay(new Date("2025-02-04T00:00:00Z")))).toBe(false);
  });

  it("moveFocus responds to navigation keys", () => {
    const base = toDay(new Date("2025-02-10T00:00:00Z"));
    expect(moveFocus(base, "ArrowLeft").getTime()).toBe(addDays(base, -1).getTime());
    expect(moveFocus(base, "ArrowRight").getTime()).toBe(addDays(base, 1).getTime());
    expect(moveFocus(base, "ArrowUp").getTime()).toBe(addDays(base, -7).getTime());
    expect(moveFocus(base, "ArrowDown").getTime()).toBe(addDays(base, 7).getTime());
    expect(moveFocus(base, "PageUp").getMonth()).toBe(0);
    expect(moveFocus(base, "PageDown").getMonth()).toBe(2);
    expect(moveFocus(base, "Home").getDay()).toBe(1);
    expect(moveFocus(base, "End").getDay()).toBe(0);
    expect(moveFocus(base, "Other").getTime()).toBe(base.getTime());
  });

  it("getMonthTitle/getDayAriaLabel and isSameDaySafe", () => {
    const base = toDay(new Date("2025-02-10T00:00:00Z"));
    expect(getMonthTitle(base)).toMatch(/феврал/i);
    expect(getDayAriaLabel(base)).toMatch(/феврал/i);
    expect(isSameDaySafe(base, base)).toBe(true);
    expect(isSameDaySafe(null, base)).toBe(false);
  });
});
