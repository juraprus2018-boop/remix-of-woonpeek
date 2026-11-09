/** Accept historic shared URLs, but write only the canonical price parameters. */
export function readSearchBudget(params: URLSearchParams) {
  const read = (keys: string[]) => {
    for (const key of keys) {
      const raw = params.get(key);
      if (raw === null || raw.trim() === "") continue;
      const value = Number(raw);
      if (Number.isFinite(value) && value >= 0) return value;
    }
    return undefined;
  };
  return {
    minPrice: read(["min_prijs", "minPrijs", "min"]),
    maxPrice: read(["max_prijs", "maxPrijs", "max"]),
  };
}

export function writeSearchBudget(params: URLSearchParams, budget: { minPrice?: number; maxPrice?: number }) {
  for (const key of ["min", "max", "minPrijs", "maxPrijs", "min_prijs", "max_prijs"]) params.delete(key);
  if (budget.minPrice !== undefined) params.set("min_prijs", String(budget.minPrice));
  if (budget.maxPrice !== undefined) params.set("max_prijs", String(budget.maxPrice));
  return params;
}