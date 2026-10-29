import { describe, expect, it } from "vitest";
import { socialImageUrl } from "../../supabase/functions/_shared/socialImage";

const origin = "https://www.woonaanbod-nl.nl";
const fallback = "/brand/social.png";

describe("public social image URLs", () => {
  it("resolves local images on the canonical domain", () => {
    expect(socialImageUrl("/photos/home.jpg", origin, fallback)).toBe(`${origin}/photos/home.jpg`);
  });
  it("keeps external HTTPS images and their sizing parameters", () => {
    expect(socialImageUrl("https://images.example.org/home.jpg?w=1200", origin, fallback)).toBe("https://images.example.org/home.jpg?w=1200");
  });
  it("upgrades protocol-relative and HTTP images", () => {
    expect(socialImageUrl("//images.example.org/home.jpg", origin, fallback)).toBe("https://images.example.org/home.jpg");
    expect(socialImageUrl("http://images.example.org/home.jpg", origin, fallback)).toBe("https://images.example.org/home.jpg");
  });
  it.each([null, "", "data:image/png;base64,abc", "javascript:alert(1)", "https://user:pass@example.org/photo.jpg"])("uses a public fallback for unsupported input %s", (input) => {
    expect(socialImageUrl(input, origin, fallback)).toBe(`${origin}/brand/social.png`);
  });
});