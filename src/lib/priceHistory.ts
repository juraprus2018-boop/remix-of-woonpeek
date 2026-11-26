export interface PriceHistoryRow { price: number | null; status: string | null; changed_at: string }

/** Alleen echte wijzigingen; opeenvolgende gelijke regels worden samengevoegd. */
export function priceChanges(rows: PriceHistoryRow[]): (PriceHistoryRow & { diff: number | null })[] {
  const out: (PriceHistoryRow & { diff: number | null })[] = [];
  for (const r of [...rows].sort((a, b) => a.changed_at.localeCompare(b.changed_at))) {
    const prev = out[out.length - 1];
    if (prev && prev.price === r.price && prev.status === r.status) continue;
    out.push({ ...r, diff: prev && prev.price != null && r.price != null ? r.price - prev.price : null });
  }
  return out;
}
