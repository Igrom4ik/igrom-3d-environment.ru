const RU_MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

function parseMonthYear(token: string) {
  const parts = token.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const monthIdx = RU_MONTHS.findIndex((m) => m.toLowerCase() === parts[0].slice(0, 3).toLowerCase());
  const year = Number(parts[1]);
  if (monthIdx < 0 || !Number.isFinite(year)) return null;
  const mm = String(monthIdx + 1).padStart(2, "0");
  return `01.${mm}.${year}`;
}

export function parseTimeframeToSerialized(value: string | null | undefined) {
  if (!value || typeof value !== "string") return {};
  const tokens = value.split("-");
  if (tokens.length < 1) return {};
  const left = tokens[0].trim();
  const right = (tokens[1] ?? "").trim();
  const start = parseMonthYear(left) ?? null;
  const present = /наст\.?\s*время/i.test(right);
  const end = present ? null : parseMonthYear(right) ?? null;
  return { start, end, present };
}

export function formatSerializedToTimeframe(val: { start: string | null; end: string | null; present: boolean }) {
  const toMonthYear = (d: string | null) => {
    if (!d) return "—";
    const [day, mm, yyyy] = d.split(".");
    const m = RU_MONTHS[Number(mm) - 1] ?? mm;
    return `${m} ${yyyy}`;
  };
  const start = toMonthYear(val.start);
  const right = val.present ? "Наст. время" : toMonthYear(val.end);
  return `${start} - ${right}`;
}
