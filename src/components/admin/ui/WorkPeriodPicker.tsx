"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addMonths, format, isSameMonth, startOfMonth } from "date-fns";
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
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');
  const [popupPlacement, setPopupPlacement] = useState<'right' | 'bottom'>('right');
  
  const gridRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && containerRef.current && popupRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popupWidth = 320; // Approx calendar width
      const spaceRight = window.innerWidth - rect.right;
      
      if (spaceRight < popupWidth + 20) {
        setPopupPlacement('bottom');
      } else {
        setPopupPlacement('right');
      }
    }
  }, [isOpen]);

  const openCalendar = (field: 'start' | 'end') => {
    setActiveField(field);
    const dateToFocus = field === 'start' ? period.start : period.end;
    
    // If date exists, jump to its month. Else, try the other date or today.
    const initialMonth = dateToFocus 
      ? startOfMonth(dateToFocus)
      : startOfMonth(period.start ?? period.end ?? todayDay());

    setMonth(initialMonth);
    setFocused(toDay(dateToFocus ?? todayDay()));
    setIsOpen(true);
  };

  useEffect(() => {
    setPeriod(deserialize(props.value));
  }, [props.value?.start, props.value?.end, props.value?.present]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const emit = (next: WorkPeriod) => {
    props.onChange?.(serializePeriod(next));
  };

  const onSelectDay = (day: Date) => {
    let next: WorkPeriod;
    
    if (activeField === 'start') {
      // Editing Start Date
      next = { ...period, start: day };
      // If present is true, ensure we don't violate logical constraints if needed, 
      // but 'present' usually implies end is today.
      
      // If we have an end date and start > end, clear end to prevent invalid range
      if (next.end && day > next.end && !next.present) {
        next.end = null;
      }
    } else {
      // Editing End Date
      next = { ...period, end: day, present: false }; // Selecting an end date disables "present"
      
      // If we have a start date and end < start, clear start? 
      // Or usually, we might want to keep start and let validation show error.
      // But clearing start is safer for "range" feel.
      // Let's rely on validation error for now to be less destructive?
      // Actually user requested "Validation to prevent conflict states".
      // If end < start, let's just allow it and show error, OR prevent selection?
      // Showing error is better UX than silently failing or clearing the other field unpredictably.
    }

    setPeriod(next);
    setError(null);
    setFocused(toDay(day));
    if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
    emit(next);
    setIsOpen(false); // Always close after selection
  };

  const onTogglePresent = (present: boolean) => {
    const next = applyPresentToggle(period, present);
    setPeriod(next);
    setError(null);
    if (present) {
       // If toggled ON, end becomes today effectively (visually handled by UI)
       // logic in applyPresentToggle handles setting end=today
    }
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
    const iso = format(focused, "yyyy-MM-dd");
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
    <div className={styles.root} id={props.id} aria-label={props["aria-label"]} ref={containerRef}>
      <div className={styles.controls}>
        <div className={styles.row}>
          <div className={styles.label}>Начало</div>
          <button
            type="button"
            className={styles.valueButton}
            onClick={() => openCalendar('start')}
            aria-label="Выбрать дату начала"
          >
            {period.start ? formatRuDate(period.start) : "—"}
          </button>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Конец</div>
          <button
            type="button"
            className={styles.valueButton}
            onClick={() => openCalendar('end')}
            aria-label="Выбрать дату окончания"
            disabled={period.present}
          >
            {period.present ? "по настоящее время" : period.end ? formatRuDate(period.end) : "—"}
          </button>
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

      {isOpen && (
        <div 
          ref={popupRef}
          className={`${styles.popup} ${popupPlacement === 'bottom' ? styles.popupBottom : ''}`}
          style={popupPlacement === 'bottom' ? { top: '100%', left: 0, marginTop: '8px' } : undefined}
        >
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
                const iso = format(day, "yyyy-MM-dd");
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
      )}
    </div>
  );
}
