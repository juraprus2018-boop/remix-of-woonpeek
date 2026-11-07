export interface RentalObservation {
  id: string;
  city: string;
  status: string;
  listing_type: string;
  property_type: string;
  price: number;
  surface_area: number | null;
  neighborhood: string | null;
  created_at: string;
}

export const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export function calculateCityRentalStats(rows: RentalObservation[], city: string, now = Date.now()) {
  const rentals = [...new Map(rows.filter(row =>
    row.status === "actief" && row.listing_type === "huur" &&
    row.city.trim().toLocaleLowerCase("nl") === city.trim().toLocaleLowerCase("nl")
  ).map(row => [row.id, row])).values()];
  const priced = rentals.filter(row => Number.isFinite(row.price) && row.price > 0);
  const withArea = priced.filter(row => row.surface_area !== null && row.surface_area > 0);
  const groups = new Map<string, RentalObservation[]>();
  rentals.forEach(row => {
    const name = row.neighborhood?.trim();
    if (name) groups.set(name, [...(groups.get(name) || []), row]);
  });
  return {
    total: rentals.length,
    priceSample: priced.length,
    medianPrice: median(priced.map(row => row.price)),
    averagePrice: priced.length ? priced.reduce((sum, row) => sum + row.price, 0) / priced.length : null,
    medianPerM2: median(withArea.flatMap(row => row.surface_area ? [row.price / row.surface_area] : [])),
    areaSample: withArea.length,
    new7d: rentals.filter(row => {
      const time = new Date(row.created_at).getTime();
      return time >= now - 7 * 86400000 && time <= now;
    }).length,
    budgets: [1000, 1500, 2000].map(max => ({ max, count: priced.filter(row => row.price <= max).length })),
    types: ["appartement", "huis", "studio", "kamer", "vakantiehuis"].map(type => {
      const subset = priced.filter(row => row.property_type === type);
      return { type, count: rentals.filter(row => row.property_type === type).length, medianPrice: median(subset.map(row => row.price)) };
    }).filter(group => group.count > 0),
    neighborhoods: [...groups].map(([name, subset]) => ({
      name, count: subset.length,
      medianPrice: median(subset.filter(row => row.price > 0 && Number.isFinite(row.price)).map(row => row.price)),
      priceSample: subset.filter(row => row.price > 0 && Number.isFinite(row.price)).length,
    })).sort((a, b) => b.count - a.count).slice(0, 6),
  };
}