import { normalizeAffiliateUrl } from "./affiliateUrl.ts";
import { propertyUrl, type PropertyUrlInput } from "./propertyUrl.ts";

/** Preserve the feed's tracking URL, including the media ID and encoded destination. */
export function facebookPropertyUrl(p: PropertyUrlInput & { source_url?: string | null }): string {
  const outgoing = normalizeAffiliateUrl(p.source_url);
  if (outgoing) {
    try {
      const parsed = new URL(outgoing);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return outgoing;
    } catch {
      // Invalid feed links must not produce unusable Facebook posts.
    }
  }
  return propertyUrl(p);
}