import { matchCity } from "./fuzzyCity";

export interface ParsedSearch {
  city?: string;
  propertyType?: "appartement" | "huis" | "studio" | "kamer";
  listingType?: "huur" | "koop";
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  /** True wanneer er meer dan alleen een plaatsnaam herkend is. */
  structured: boolean;
}

const TYPES: [RegExp, ParsedSearch["propertyType"]][] = [
  [/\b(appartement(en)?|flat|bovenwoning|benedenwoning)\b/, "appartement"],
  [/\b(studio'?s?)\b/, "studio"],
  [/\b(kamers? (?=te huur|huren|in\b)|studentenkamer|kamer)\b/, "kamer"],
  [/\b(huis|huizen|woonhuis|eengezinswoning|rijtjeshuis|tussenwoning|hoekwoning)\b/, "huis"],
];
const NUM = "(\\d[\\d.]*)";
const toNum = (s: string) => Number(s.replace(/\./g, ""));

/**
 * Regelgebaseerde vertaling van gewone taal naar bestaande zoekfilters.
 * Geen AI: kost niets, verzint niets; onbekende woorden blijven buiten beschouwing.
 */
export function parseNaturalSearch(input: string, cities: string[]): ParsedSearch {
  let t = ` ${input.toLowerCase().replace(/€/g, " ").replace(/\s+/g, " ")} `;
  const out: ParsedSearch = { structured: false };

  if (/\b(te koop|kopen|koopwoning|koophuis)\b/.test(t)) out.listingType = "koop";
  else if (/\b(te huur|huren|huurwoning)\b/.test(t)) out.listingType = "huur";

  const rooms = t.match(new RegExp(`(?:minstens |minimaal |vanaf )?${NUM}\\+? ?(?:slaap)?kamers?\\b`));
  if (rooms?.[1]) { out.minBedrooms = toNum(rooms[1]); t = t.replace(rooms[0], " "); }

  const between = t.match(new RegExp(`tussen ${NUM} en ${NUM}`));
  if (between?.[1] && between[2]) { out.minPrice = toNum(between[1]); out.maxPrice = toNum(between[2]); t = t.replace(between[0], " "); }
  const max = t.match(new RegExp(`(?:onder|tot|max(?:imaal)?|minder dan|<)\\s*${NUM}`));
  if (max?.[1]) { out.maxPrice = toNum(max[1]); t = t.replace(max[0], " "); }
  const min = t.match(new RegExp(`(?:boven|vanaf|min(?:imaal)?|meer dan|>)\\s*${NUM}`));
  if (min?.[1]) { out.minPrice = toNum(min[1]); t = t.replace(min[0], " "); }

  for (const [re, type] of TYPES) if (re.test(t)) { out.propertyType = type; t = t.replace(re, " "); break; }

  const place = t.match(/\b(?:in|rond|bij|omgeving)\s+([a-z'\-\s]+?)(?=\s(?:met|onder|tot|voor|max|vanaf|tussen)\b|\s*$)/);
  const candidate = (place?.[1] ?? t.replace(/\b(te huur|te koop|huren|kopen|per maand|p\/m|euro|met|een|in|voor)\b/g, " ")).trim();
  if (candidate) out.city = matchCity(candidate, cities) ?? undefined;

  out.structured = !!(out.propertyType || out.listingType || out.minPrice || out.maxPrice || out.minBedrooms);
  return out;
}
