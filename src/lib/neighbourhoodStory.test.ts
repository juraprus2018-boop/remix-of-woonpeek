import { describe, it, expect } from "vitest";
import { buildNeighbourhoodStory, buildNeighbourhoodFaq } from "./neighbourhoodStory";

describe("neighbourhood story", () => {
  const d = { supermarket: 3.6, shop: 2.2, train: 5, daycare: 0.6, primary: 0.4 };
  it("mentions supermarket and bakery distances", () => {
    const shop = buildNeighbourhoodStory(d, "Kruisstraat", "Deurne").find((b) => b.key === "shop")!;
    expect(shop.text).toContain("3,6 km");
    expect(shop.text).toContain("2,2 km");
  });
  it("skips groups without data", () => {
    expect(buildNeighbourhoodStory(d, "x", "y").some((b) => b.key === "care")).toBe(false);
  });
  it("builds FAQ only for available data", () => {
    const faq = buildNeighbourhoodFaq(d, "Kruisstraat 1", "Deurne");
    expect(faq).toHaveLength(3);
  });
});
