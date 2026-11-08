import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

// Keep card fields and descriptions, omit importer payloads and unused galleries.
// Detail/editor queries continue to load the complete row.
export const PROPERTY_LIST_COLUMNS = "address_slug,agency_id,available_from,bathrooms,bedrooms,build_year,city,created_at,description,energy_label,facebook_posted_at,feed_priority,house_number,id,first_image:images->>0,last_checked_at,latitude,listing_type,longitude,neighborhood,postal_code,price,property_type,provider_priority,slug,source_site,source_url,status,street,surface_area,title,updated_at,user_id,views_count";

export type PropertyListRow = Omit<Property, "images" | "source_raw"> & { first_image: string | null };

export function restoreListingImages(row: PropertyListRow): Property {
  const { first_image, ...fields } = row;
  return { ...fields, images: first_image ? [first_image] : [], source_raw: null };
}
