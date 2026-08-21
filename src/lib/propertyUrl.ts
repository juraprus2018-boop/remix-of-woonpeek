/**
 * Canonieke URL's per woning: /huurwoning/[stad]/[straat-huisnummer]
 * en /koopwoning/[stad]/[straat-huisnummer].
 *
 * Oude URL's (/aanbod/[slug], /woning/[slug]) blijven werken en verwijzen
 * met een redirect naar de canonieke URL.
 */

import { cityToSlug } from "@/lib/cities";

export interface PropertyUrlInput {
  id: string;
  city?: string | null;
  listing_type?: string | null;
  address_slug?: string | null;
  slug?: string | null;
}

export const propertyPath = (p: PropertyUrlInput): string => {
  const segment = p.listing_type === "koop" ? "koopwoning" : "huurwoning";
  const city = p.city ? cityToSlug(p.city) : "nederland";
  const address = p.address_slug || p.slug || p.id;
  return `/${segment}/${city}/${address}`;
};

export const propertyUrl = (p: PropertyUrlInput, base = "https://www.woonaanbod-nl.nl"): string =>
  `${base}${propertyPath(p)}`;

/** Volledig adres als één leesbare regel. */
export const formatAddress = (p: {
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
}): string => {
  // Feeds leveren straat soms als "Straat, 1234AB, Stad"
  const street = (p.street || "").split(",")[0].trim();
  const nr = (p.house_number || "").trim();
  const streetLine = [street, nr && nr !== "-" ? nr : ""].filter(Boolean).join(" ");
  const cityLine = [p.postal_code, p.city].filter(Boolean).join(" ");
  return [streetLine, cityLine].filter(Boolean).join(", ");
};

/** Schema.org accommodatietype per woningtype. */
export const accommodationType = (propertyType?: string | null): string => {
  switch (propertyType) {
    case "appartement":
      return "Apartment";
    case "huis":
      return "SingleFamilyResidence";
    case "studio":
      return "Apartment";
    case "kamer":
      return "Room";
    default:
      return "Residence";
  }
};

/**
 * Voorzieningen die letterlijk in de omschrijving staan. Alleen woorden die
 * daadwerkelijk voorkomen worden getoond, zodat we niets verzinnen.
 */
const AMENITY_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: "Gemeubileerd", re: /\bgemeubileerd|\bgemeubeld/i },
  { label: "Gestoffeerd", re: /\bgestoffeerd/i },
  { label: "Balkon", re: /\bbalkon/i },
  { label: "Dakterras", re: /\bdakterras/i },
  { label: "Tuin", re: /\btuin\b|\bachtertuin|\bvoortuin/i },
  { label: "Lift", re: /\blift\b/i },
  { label: "Parkeerplaats", re: /\bparkeer|\bgarage\b/i },
  { label: "Berging", re: /\bberging|\bschuur\b/i },
  { label: "Wasmachine-aansluiting", re: /\bwasmachine/i },
  { label: "Vaatwasser", re: /\bvaatwasser/i },
  { label: "Internet inbegrepen", re: /\binternet\b|\bwifi\b/i },
  { label: "Cv-ketel", re: /\bcv-ketel|\bcentrale verwarming/i },
  { label: "Vloerverwarming", re: /\bvloerverwarming/i },
  { label: "Airconditioning", re: /\bairco|\bairconditioning/i },
  { label: "Eigen keuken", re: /\beigen keuken/i },
  { label: "Eigen badkamer", re: /\beigen badkamer/i },
  { label: "Huisdieren toegestaan", re: /\bhuisdieren toegestaan|\bhuisdieren zijn toegestaan/i },
  { label: "Geschikt voor studenten", re: /\bstudent/i },
  { label: "Rolstoeltoegankelijk", re: /\brolstoel/i },
  { label: "Zonnepanelen", re: /\bzonnepanelen/i },
];

export const extractAmenities = (description?: string | null): string[] => {
  if (!description) return [];
  const text = description.replace(/<[^>]*>/g, " ");
  return AMENITY_PATTERNS.filter((a) => a.re.test(text)).map((a) => a.label);
};
