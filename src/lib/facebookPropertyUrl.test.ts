import { describe, expect, it } from "vitest";
import { facebookPropertyUrl } from "../../supabase/functions/_shared/facebookPropertyUrl";

describe("Facebook property destinations", () => {
  const home = { id: "home-1", city: "Utrecht", listing_type: "huur", address_slug: "voorbeeldstraat-1" };
  it("uses the Huurzone tracking link with media 418821 and the exact property destination", () => {
    const url = "https://fr135.net/c/?si=15142&li=1657538&wi=418821&pid=d876e40dc80792ffaf8b91fb64e25b1f&dl=huurwoningen%2Fzuid-holland%2Fzoetermeer%2F1525236&ws=";
    expect(facebookPropertyUrl({ ...home, source_url: url })).toBe(url);
  });
  it("preserves Huurwoningen attribution rather than replacing it with a site link", () => {
    const url = "https://www.huurwoningen.nl/huren/amersfoort/4cd4cba3/triangelstraat/?dci=example&utm_source=daisycon&utm_medium=affiliate&utm_campaign=woonaanbod-nl";
    expect(facebookPropertyUrl({ ...home, source_url: url })).toBe(url);
  });
  it("keeps a usable property destination for homes without an outgoing link", () => {
    expect(facebookPropertyUrl(home)).toBe("https://www.woonaanbod-nl.nl/huurwoning/utrecht/voorbeeldstraat-1");
  });
  it.each(["javascript:alert(1)", "not a url"])("rejects unsafe or invalid destinations: %s", source_url => {
    expect(facebookPropertyUrl({ ...home, source_url })).toBe("https://www.woonaanbod-nl.nl/huurwoning/utrecht/voorbeeldstraat-1");
  });
});