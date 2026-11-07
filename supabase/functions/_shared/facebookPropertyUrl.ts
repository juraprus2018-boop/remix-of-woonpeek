import { propertyUrl, type PropertyUrlInput } from "./propertyUrl.ts";

/** Facebook always leads to our listing, never to the feed tracking URL. */
export function facebookPropertyUrl(p: PropertyUrlInput & { source_url?: string | null }): string {
  return propertyUrl(p);
}
