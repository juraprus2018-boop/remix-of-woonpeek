/**
 * Canonieke woning-URL voor edge functions.
 * Houd in sync met src/lib/propertyUrl.ts
 */
export const SITE_URL = "https://www.woonaanbod-nl.nl";

export const citySlug = (city?: string | null): string =>
  (city || "nederland")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "nederland";

export interface PropertyUrlInput {
  id: string;
  city?: string | null;
  listing_type?: string | null;
  address_slug?: string | null;
  slug?: string | null;
}

export const propertyPath = (p: PropertyUrlInput): string =>
  `/${p.listing_type === "koop" ? "koopwoning" : "huurwoning"}/${citySlug(p.city)}/${
    p.address_slug || p.slug || p.id
  }`;

export const propertyUrl = (p: PropertyUrlInput, base = SITE_URL): string => `${base}${propertyPath(p)}`;
