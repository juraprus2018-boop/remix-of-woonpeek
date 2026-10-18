export interface SearchFilterValues {
  city: string;
  propertyType: "appartement" | "huis" | "studio" | "kamer" | "vakantiehuis" | "";
  listingType: "huur" | "koop" | "";
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSurface?: number;
  includeInactive: boolean;
  grossIncome?: number;
}
export const EMPTY_FILTERS: SearchFilterValues = { city: "", propertyType: "", listingType: "", includeInactive: false };
const number = (value: string | null) => value !== null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : undefined;
export function parseSearchFilters(params: URLSearchParams): SearchFilterValues {
  const type = params.get("type") || "";
  const listing = params.get("aanbod") || "";
  return {
    city: (params.get("locatie") ?? params.get("plaats") ?? "").trim(),
    propertyType: ["appartement", "huis", "studio", "kamer", "vakantiehuis"].includes(type) ? type as SearchFilterValues["propertyType"] : "",
    listingType: listing === "huur" || listing === "koop" ? listing : "",
    minPrice: number(params.get("min_prijs") ?? params.get("min")),
    maxPrice: number(params.get("max_prijs") ?? params.get("maxPrijs") ?? params.get("max")),
    minBedrooms: number(params.get("min_kamers")), minSurface: number(params.get("min_oppervlakte")),
    grossIncome: number(params.get("inkomen")), includeInactive: params.get("inactief") === "1",
  };
}
export function serializeSearchFilters(filters: SearchFilterValues): URLSearchParams {
  const params = new URLSearchParams();
  const values = { locatie: filters.city.trim(), type: filters.propertyType, aanbod: filters.listingType, min_prijs: filters.minPrice, max_prijs: filters.maxPrice, min_kamers: filters.minBedrooms, min_oppervlakte: filters.minSurface, inkomen: filters.grossIncome, inactief: filters.includeInactive ? "1" : undefined };
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== "" && (typeof value !== "number" || (Number.isFinite(value) && value >= 0))) params.set(key, String(value)); });
  return params;
}
export function validateSearchFilters(filters: SearchFilterValues): string | null {
  const cap = filters.grossIncome && filters.listingType !== "koop" ? Math.min(filters.maxPrice ?? Infinity, Math.floor(filters.grossIncome / 3)) : filters.maxPrice;
  return filters.minPrice !== undefined && cap !== undefined && filters.minPrice > cap ? "De minimumprijs is hoger dan de maximumprijs. Verlaag de minimumprijs of verhoog de maximumprijs (ook bij je inkomen)." : null;
}
