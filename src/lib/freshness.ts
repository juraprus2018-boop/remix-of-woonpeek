export interface FreshnessLabel {
  label: string;
  urgent: boolean;
}

const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(d);

/** Number of Amsterdam calendar days between date and now. */
export function daysAgo(date: string | Date, now: Date = new Date()): number {
  const a = new Date(`${dayKey(new Date(date))}T00:00:00Z`).getTime();
  const b = new Date(`${dayKey(now)}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function freshnessLabel(date: string | Date, now: Date = new Date()): FreshnessLabel {
  const d = daysAgo(date, now);
  if (d === 0) return { label: "Vandaag online · Reageer snel, weg is weg!", urgent: true };
  if (d === 1) return { label: "Gisteren online gekomen", urgent: false };
  if (d === 2) return { label: "Eergisteren gepubliceerd", urgent: false };
  if (d <= 30) return { label: `${d} dagen geleden`, urgent: false };
  const months = Math.floor(d / 30);
  return { label: months === 1 ? "1 maand geleden" : `${months} maanden geleden`, urgent: false };
}
