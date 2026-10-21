export type FeedRow = Record<string, string>;

export function rentalIdentity(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const path = u.searchParams.get("dl") || u.pathname;
    return path.match(/(?:^|\/)rental\/([a-zA-Z0-9]+)/)?.[1] || null;
  } catch { return null; }
}

const types: Record<string, string> = { APARTMENT: "appartement", HOUSE: "huis", ROOM: "kamer", STUDIO: "studio" };
const labels: Record<string, string> = { APARTMENT: "Appartement", HOUSE: "Huis", ROOM: "Kamer", STUDIO: "Studio", "ANTI-SQUAT": "Antikraakwoning" };
const number = (value: string): number | null => {
  if (!value?.trim()) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const integer = (value: string) => { const n = number(value); return n === null ? null : Math.round(n); };
const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value || "") && Number.isFinite(Date.parse(value)) ? value : null;

export function mapRenthunter(row: FeedRow, checkedAt: string) {
  const url = new URL(row.link);
  if (!["renthunter.nl", "www.renthunter.nl"].includes(url.hostname) || url.protocol !== "https:") throw new Error("Invalid listing URL");
  if (!row.sku || rentalIdentity(row.link) !== row.sku || !row.city?.trim()) throw new Error("Missing listing identity or city");
  const price = number(row.price);
  if (price === null || price <= 0) throw new Error("Invalid rental price");
  url.hostname = "renthunter.nl";
  url.searchParams.set("via", "woonaanbod");
  const category = row.category?.toUpperCase();
  const images = Array.from({ length: 10 }, (_, i) => row[i === 0 ? "image" : `image_${i + 1}`])
    .filter((v): v is string => !!v && /^https?:\/\//.test(v));
  const energy = row.energy_label?.toUpperCase();
  const created = Date.parse(row.created_at || "");
  return {
    title: `${labels[category] || "Woning"} te huur in ${row.city.trim()}`,
    description: row.description || null,
    property_type: types[category] || null,
    listing_type: "huur",
    price, surface_area: integer(row.floor_area), bedrooms: integer(row.number_of_bedrooms),
    bathrooms: integer(row.bathrooms_count), build_year: integer(row.year_built),
    energy_label: ["A++", "A+", "A", "B", "C", "D", "E", "F", "G"].includes(energy) ? energy : null,
    street: row.street?.trim() || row.address?.split(",")[0]?.trim() || row.city.trim(),
    house_number: row.house_number?.trim() || "", postal_code: row.zip_code?.trim() || "",
    city: row.city.trim(), neighborhood: row.suburb || row.quarter || null,
    latitude: number(row.latitude), longitude: number(row.longitude), images: [...new Set(images)],
    status: row.in_stock?.toLowerCase() === "true" ? "actief" : "inactief",
    source_site: "Renthunter", source_url: url.toString(),
    source_raw: { provider: "renthunter-direct", sku: row.sku, updated_at: row.updated_at },
    available_from: date(row.available_from), last_checked_at: checkedAt,
    created_at: Number.isFinite(created) ? new Date(created).toISOString() : checkedAt,
  };
}