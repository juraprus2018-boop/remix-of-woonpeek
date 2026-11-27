import { pageSlug } from "@/lib/citySlug";

export type LookupScope = { city?: string; listingType?: "huur" | "koop" };

type Candidate = { city: string | null; listing_type: string | null };

/** Derive the scope from a property URL path like /en/huurwoning/{city}/{slug}. */
export const scopeFromPath = (pathname: string, city?: string): LookupScope => {
  const scope: LookupScope = {};
  if (city) scope.city = city;
  if (/\/huurwoning\//.test(pathname)) scope.listingType = "huur";
  else if (/\/koopwoning\//.test(pathname)) scope.listingType = "koop";
  return scope;
};

/**
 * Pick the property an address URL refers to. The city in the URL must match
 * (an address in another city is a different home, so no match means 404);
 * the listing type is preferred but not required, so a status change never breaks a URL.
 * Candidates are expected newest first.
 */
export const pickScopedProperty = <T extends Candidate>(candidates: T[], scope: LookupScope): T | null => {
  const wanted = scope.city ? pageSlug(decodeURIComponent(scope.city)) : null;
  const inCity = wanted ? candidates.filter((c) => pageSlug(c.city ?? "") === wanted) : candidates;
  if (inCity.length === 0) return null;
  return inCity.find((c) => c.listing_type === scope.listingType) ?? inCity[0] ?? null;
};
