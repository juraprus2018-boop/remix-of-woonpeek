/**
 * Pagination helpers. Every paged list ends with an `id` tiebreaker so rows
 * with equal sort values (same provider, same import second) can never repeat
 * or disappear between pages.
 */
type Orderable<T> = { order: (column: string, opts: { ascending: boolean }) => T };

export const orderStable = <T extends Orderable<T>>(
  query: T,
  sorts: Array<{ column: string; ascending: boolean }>,
): T => {
  let q = query;
  for (const s of sorts) q = q.order(s.column, { ascending: s.ascending });
  if (!sorts.some((s) => s.column === "id")) q = q.order("id", { ascending: true });
  return q;
};

/** Reads every page until a short page arrives, so totals are never capped at one page. */
export const fetchAllPages = async <R>(
  fetchPage: (from: number, to: number) => Promise<R[]>,
  pageSize = 1000,
  maxRows = 200_000,
): Promise<R[]> => {
  const all: R[] = [];
  for (let from = 0; from < maxRows; from += pageSize) {
    const rows = await fetchPage(from, from + pageSize - 1);
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
};
