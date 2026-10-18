/** Presentation facts never infer total rooms from bedrooms. */
export interface FactsInput {
  price?: number | string | null; bedrooms?: number | null; rooms?: number | null;
  surface_area?: number | null; bathrooms?: number | null; description?: string | null;
  created_at?: string | null; last_checked_at?: string | null; available_from?: string | null;
}
export function maskContactDetails(text: string): string {
  return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[e-mailadres afgeschermd]')
    .replace(/(?<!\w)(?:\+31\s*(?:\(0\)\s*)?|0031\s*|0)(?:[\s().-]*\d){9}(?!\d)/g, '[telefoonnummer afgeschermd]');
}
const numeric = (n: unknown) => n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n)) && Number(n) >= 0 ? Number(n) : null;
const date = (s?: string | null) => s && Number.isFinite(Date.parse(s)) ? new Date(s) : null;
const dateLabel = (s?: string | null) => date(s)?.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) ?? 'Onbekend';
export function derivePropertyFacts(p: FactsInput, now = new Date()) {
  const price = numeric(p.price), bedrooms = numeric(p.bedrooms), rooms = numeric(p.rooms);
  const description = (p.description ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  const words: Record<string, number> = { een: 1, één: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10 };
  const conflicts: string[] = [];
  for (const [label, value, pattern] of [['slaapkamers', bedrooms, /\b(\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien)\s+slaapkamers?\b/gi], ['kamers', rooms, /\b(\d+|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien)\s+kamers?\b/gi]] as const) {
    if (value !== null && [...description.matchAll(pattern)].some(m => (words[m[1].toLowerCase()] ?? Number(m[1])) !== value)) conflicts.push(label);
  }
  const prices = [...description.matchAll(/(?:€\s*|(?:huurprijs|vraagprijs)\s*:?\s*)(\d+(?:\.\d{3})*(?:,\d{1,2})?)/gi)].map(m => Number(m[1].replace(/\./g, '').replace(',', '.')));
  if (price !== null && prices.some(n => n !== price)) conflicts.push('prijs');
  const available = date(p.available_from);
  return { price, bedrooms, rooms, surfaceArea: numeric(p.surface_area), bathrooms: numeric(p.bathrooms),
    priceLabel: price === null ? 'Onbekend' : new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price),
    bedroomsLabel: bedrooms === null ? 'Onbekend' : String(bedrooms), roomsLabel: rooms === null ? 'Onbekend' : String(rooms),
    createdLabel: dateLabel(p.created_at), checkedLabel: dateLabel(p.last_checked_at),
    availabilityLabel: available && available > now ? 'Beschikbaar vanaf' : 'Beschikbaarheid',
    availability: available && available > now ? dateLabel(p.available_from) : 'navragen bij aanbieder', conflicts };
}
