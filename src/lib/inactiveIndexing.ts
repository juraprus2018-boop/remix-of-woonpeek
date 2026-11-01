/** Woningen die langer dan dit aantal dagen niet actief zijn krijgen noindex, zodat Google zijn crawlbudget aan actief aanbod besteedt. */
export const INACTIVE_NOINDEX_DAYS = 60;

export function isLongInactive(status: string | null | undefined, lastSeen: string | null | undefined, now: Date = new Date()): boolean {
  if (!status || status === "actief") return false;
  if (!lastSeen) return true;
  const t = new Date(lastSeen).getTime();
  if (Number.isNaN(t)) return true;
  return now.getTime() - t > INACTIVE_NOINDEX_DAYS * 86_400_000;
}
