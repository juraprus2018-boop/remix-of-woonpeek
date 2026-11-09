/** Feed presence is mandatory; enrichment is bounded and can resume next run. */
export async function refreshSeenListings(
  ids: string[],
  refresh: (batch: string[]) => Promise<void>,
) {
  const uniqueIds = [...new Set(ids)];
  for (let i = 0; i < uniqueIds.length; i += 200) {
    await refresh(uniqueIds.slice(i, i + 200));
  }
}

export async function updateExistingListings<T>(
  rows: T[],
  hasTime: () => boolean,
  update: (row: T) => Promise<boolean>,
) {
  let updated = 0;
  let processed = 0;
  for (let i = 0; i < rows.length && hasTime(); i += 10) {
    const batch = rows.slice(i, i + 10);
    const results = await Promise.all(batch.map(update));
    updated += results.filter(Boolean).length;
    processed += batch.length;
  }
  return { updated, skipped: rows.length - updated, processed };
}