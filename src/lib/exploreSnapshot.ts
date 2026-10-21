import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

/** Positional public marker payload, paired with explore_map_snapshot(). */
export function decodeExploreSnapshot(payload: unknown): Property[] {
  if (!Array.isArray(payload)) throw new Error("Ongeldige kaartgegevens");
  return payload.map((row) => {
    if (!Array.isArray(row) || row.length !== 18) throw new Error("Ongeldige kaartwoning");
    const [id, title, price, listing_type, property_type, city, street, house_number,
      slug, address_slug, image, latitude, longitude, bedrooms, surface_area,
      source_site, provider_priority, created_at] = row;
    return { id, title, price, listing_type, property_type, city, street, house_number,
      slug, address_slug, images: image ? [image] : [], latitude, longitude, bedrooms,
      surface_area, source_site, provider_priority, created_at, status: "actief" } as Property;
  });
}