import { supabase } from "@/integrations/supabase/client";

export type FeedType = "xml" | "json" | "realworks" | "handmatig";

export interface Agency {
  id: string;
  owner_user_id: string;
  slug: string;
  name: string;
  city: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  logo_url: string | null;
  feed_type: FeedType;
  feed_url: string | null;
  feed_last_sync_at: string | null;
  feed_last_status: string | null;
  feed_last_message: string | null;
  feed_last_count: number | null;
  is_visible: boolean;
}

export const PUBLIC_AGENCY_COLUMNS = "id, slug, name, city, website, phone, email, description, logo_url, is_visible, created_at";

export const FEED_TYPES: Array<{ value: FeedType; label: string; help: string }> = [
  { value: "xml", label: "XML-feed", help: "Een openbare XML-link met je aanbod, bijvoorbeeld uit je website of CRM." },
  { value: "json", label: "JSON / API", help: "Een openbare JSON-link met een lijst woningen." },
  { value: "realworks", label: "Realworks-export", help: "De XML-export-URL uit Realworks (Wonen > Export)." },
  { value: "handmatig", label: "Handmatig toevoegen", help: "Geen feed? Voeg woningen zelf toe via je dashboard." },
];

export const agencySlug = (name: string, city?: string | null) =>
  [name, city]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const agencyPath = (slug: string) => `/makelaars/${slug}`;

export async function fetchMyAgency(): Promise<Agency | null> {
  const { data, error } = await supabase.rpc("get_my_agency");
  if (error) throw error;
  return (Array.isArray(data) ? (data[0] as Agency) : null) ?? null;
}

export function logAgencyEvent(agencyId: string, eventType: "view" | "click", propertyId?: string | null) {
  supabase
    .rpc("log_agency_event", { _agency_id: agencyId, _property_id: propertyId ?? null, _event_type: eventType })
    .then(() => {});
}

export const safeWebsite = (url: string | null) => {
  if (!url) return null;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};
