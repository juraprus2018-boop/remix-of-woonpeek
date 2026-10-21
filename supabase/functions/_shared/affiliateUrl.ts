/**
 * Normalize an outgoing affiliate URL so the site brand is always
 * reflected in utm_campaign, even when the feed still contains the
 * old media name while a rename at the network is pending approval.
 */
export function normalizeAffiliateUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "renthunter.nl" || u.hostname === "www.renthunter.nl") {
      u.searchParams.set("via", "woonaanbod");
    }
    const campaign = u.searchParams.get("utm_campaign");
    if (campaign && campaign.toLowerCase().replace(/[-_\s]/g, "") === "huurbaasje") {
      u.searchParams.set("utm_campaign", "Woonaanbod NL");
    }
    return u.toString();
  } catch {
    return url;
  }
}
