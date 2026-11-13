import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const numeric = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export function propertyDate(value: unknown): string | undefined {
  const valueText = text(value);
  if (!valueText || !Number.isFinite(Date.parse(valueText))) return undefined;
  return new Date(valueText).toISOString();
}

/** Normalize display data only; never mutate the stored listing or invent facts. */
export function normalizePropertyDetail<T extends Partial<Property>>(property: T) {
  const latitude = numeric(property.latitude);
  const longitude = numeric(property.longitude);
  const hasCoordinates = latitude !== null && longitude !== null && latitude <= 90 && longitude <= 180;
  return {
    ...property,
    title: text(property.title) || "Woning",
    city: text(property.city),
    street: text(property.street),
    house_number: text(property.house_number),
    postal_code: text(property.postal_code),
    description: text(property.description),
    neighborhood: text(property.neighborhood),
    source_site: text(property.source_site) || null,
    source_url: text(property.source_url) || null,
    energy_label: text(property.energy_label) || null,
    images: Array.isArray(property.images) ? property.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0) : [],
    price: numeric(property.price),
    surface_area: numeric(property.surface_area),
    bedrooms: numeric(property.bedrooms),
    bathrooms: numeric(property.bathrooms),
    build_year: numeric(property.build_year),
    latitude: hasCoordinates ? latitude : null,
    longitude: hasCoordinates ? longitude : null,
    created_at: propertyDate(property.created_at),
    updated_at: propertyDate(property.updated_at),
    last_checked_at: propertyDate(property.last_checked_at),
    available_from: propertyDate(property.available_from),
  };
}