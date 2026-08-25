/**
 * Normalize an outgoing affiliate URL so the site brand is always
 * reflected in utm_campaign, even when the feed still contains the
 * old media name while a rename at the network is pending approval.
 */
export function normalizeAffiliateUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Rewrite legacy brand names to the current brand.
    // Keep every other parameter (dci, wi, si, li, ws, etc.) untouched
    // so tracking and commission attribution stay intact.
    const campaign = u.searchParams.get("utm_campaign");
    if (campaign && campaign.toLowerCase().replace(/[-_\s]/g, "") === "huurbaasje") {
      u.searchParams.set("utm_campaign", "Woonaanbod NL");
    }
    return u.toString();
  } catch {
    return url;
  }
}
