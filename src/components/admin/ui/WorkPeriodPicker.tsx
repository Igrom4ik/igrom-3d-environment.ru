"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addMonths, isSameMonth, startOfMonth } from "date-fns";
import styles from "./WorkPeriodPicker.module.css";
import {
  applyDateClick,
  applyPresentToggle,
  buildMonthGrid,
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
  type WorkPeriod,
  type WorkPeriodSerialized,
} from "@/utils/workPeriod";

export type WorkPeriodPickerProps = {
  value?: Partial<WorkPeriodSerialized>;
  onChange?: (value: WorkPeriodSerialized) => void;
  id?: string;
  "aria-label"?: string;
};

const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function deserialize(value?: Partial<WorkPeriodSerialized>): WorkPeriod {
  const start = value?.start ? parseRuDate(value.start) : null;
  const end = value?.end ? parseRuDate(value.end) : null;
  const present = Boolean(value?.present);
  if (present) {
    const today = todayDay();
    return applyPresentToggle({ start, end, present: false }, true);
  }
  return { start, end, present: false };
}

export function WorkPeriodPicker(props: WorkPeriodPickerProps) {
  const [period, setPeriod] = useState<WorkPeriod>(() => deserialize(props.value));
  const [month, setMonth] = useState(() => startOfMonth(period.start ?? period.end ?? todayDay()));
  const [focused, setFocused] = useState<Date>(() => toDay(period.start ?? period.end ?? todayDay()));
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPeriod(deserialize(props.value));
  }, [props.value?.start, props.value?.end, props.value?.present]);

  const emit = (next: WorkPeriod) => {
    props.onChange?.(serializePeriod(next));
  };

  const onSelectDay = (day: Date) => {
    const next = applyDateClick(period, day);
    setPeriod(next);
    setError(null);
    setFocused(toDay(day));
    if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
    emit(next);
  };

  const onTogglePresent = (present: boolean) => {
    const next = applyPresentToggle(period, present);
    setPeriod(next);
    setError(null);
    setFocused(toDay(next.end ?? next.start ?? todayDay()));
    if (next.start && !isSameMonth(next.start, month)) setMonth(startOfMonth(next.start));
    emit(next);
  };

  useEffect(() => {
    if (period.start && period.end && period.end.getTime() < period.start.getTime()) {
      setError("Конечная дата не может быть раньше начальной");
    } else {
      setError(null);
    }
  }, [period.start?.getTime(), period.end?.getTime(), period.present]);

  const rows = useMemo(() => buildMonthGrid(month, 1), [month.getTime()]);

  useEffect(() => {
    const iso = focused.toISOString().slice(0, 10);
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`button[data-date='${iso}']`);
    el?.focus();
  }, [focused.getTime(), month.getTime()]);

  const isDisabledDay = (day: Date) => {
    if (period.present) return false;
    if (period.start && !period.end) {
      return day.getTime() < period.start.getTime();
    }
    return false;
  };

  return (
    <div className={styles.root} id={props.id} aria-label={props["aria-label"]}>
      <div className={styles.controls}>
        <div className={styles.row}>
          <div className={styles.label}>Начало</div>
          <div className={styles.value}>{period.start ? formatRuDate(period.start) : "—"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Конец</div>
          <div className={styles.value}>
            {period.present ? formatRuDate(todayDay()) : period.end ? formatRuDate(period.end) : "—"}
          </div>
        </div>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={period.present}
            onChange={(e) => onTogglePresent(e.target.checked)}
            aria-label="По настоящее время"
          />
          <span className={styles.label}>По настоящее время</span>
        </label>
        {error && (
          <div className={styles.error} role="alert" aria-live="polite">
            {error}
          </div>
        )}
        <div className={styles.label}>
          Выберите начало, затем конец. Если включено «По настоящее время», конец фиксируется на сегодняшней дате.
        </div>
      </div>

      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setMonth((m) => startOfMonth(addMonths(m, -1)))}
            aria-label="Предыдущий месяц"
          >
            ←
          </button>
          <div className={styles.monthTitle} aria-live="polite">
            {getMonthTitle(month)}
          </div>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setMonth((m) => startOfMonth(addMonths(m, 1)))}
            aria-label="Следующий месяц"
          >
            →
          </button>
        </div>

        <div className={styles.dow} aria-hidden="true">
          {DOW.map((d) => (
            <div key={d} className={styles.dowCell}>
              {d}
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          className={styles.grid}
          role="grid"
          aria-label="Календарь"
          onKeyDown={(e) => {
            const keys = new Set([
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              "PageUp",
              "PageDown",
              "Home",
              "End",
              "Enter",
              " ",
            ]);
            if (!keys.has(e.key)) return;
            e.preventDefault();
            if (e.key === "Enter" || e.key === " ") {
              onSelectDay(focused);
              return;
            }
            const next = moveFocus(focused, e.key);
            setFocused(next);
            if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
          }}
        >
          {rows.flat().map((cell) => {
            const day = cell.date;
            const iso = day.toISOString().slice(0, 10);
            const selectedStart = isSameDaySafe(period.start, day);
            const selectedEnd = isSameDaySafe(period.end, day) || (period.present && isSameDaySafe(todayDay(), day));
            const inRange = isInRange({ ...period, end: period.present ? todayDay() : period.end }, day);
            const disabled = isDisabledDay(day);
            const isFocused = isSameDaySafe(focused, day);

            const classNames = [
              styles.day,
              !cell.inMonth ? styles.muted : "",
              selectedStart || selectedEnd ? styles.selected : "",
              inRange && !(selectedStart || selectedEnd) ? styles.inRange : "",
              disabled ? styles.disabled : "",
            ]
              .filter(Boolean)
              .join(" ");

            const label = getDayAriaLabel(day);

            return (
              <button
                key={iso}
                type="button"
                data-date={iso}
                className={classNames}
                onClick={() => {
                  if (disabled) return;
                  onSelectDay(day);
                }}
                role="gridcell"
                aria-label={label}
                aria-selected={selectedStart || selectedEnd}
                aria-disabled={disabled}
                tabIndex={isFocused ? 0 : -1}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
