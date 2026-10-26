/** Partner site for internet, tv and mobile comparison (owned by the same publisher). */
export const TELECOM_PARTNER_NAME = "Telecomkeuzegids.nl";
export const TELECOM_PARTNER_URL = "https://www.telecomkeuzegids.nl/";

/** Builds a tracked link to the telecom partner so its analytics can attribute visits. */
export function telecomPartnerUrl(campaign: string): string {
  const url = new URL(TELECOM_PARTNER_URL);
  url.searchParams.set("utm_source", "woonaanbod-nl");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}
