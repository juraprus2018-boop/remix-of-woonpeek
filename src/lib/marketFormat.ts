const nf = new Intl.NumberFormat("nl-NL");

export const MONTHS = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

export const euro = (n?: number | null, decimals = 0) =>
  n === null || n === undefined
    ? "—"
    : "€ " +
      new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(Number(n));

export const num = (n?: number | null) => (n === null || n === undefined ? "—" : nf.format(Number(n)));

export const longDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export const longDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("nl-NL", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

/** "1 t/m 21 augustus 2026" of "28 juli t/m 3 augustus 2026" */
export const periodLabel = (start?: string, end?: string) => {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) return `${s.getDate()} t/m ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
  return `${s.getDate()} ${MONTHS[s.getMonth()]} t/m ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
};

export const monthLabel = (d?: string | Date) => {
  const x = d ? new Date(d) : new Date();
  return `${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
};
