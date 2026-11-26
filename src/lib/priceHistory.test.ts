import { describe, expect, it } from "vitest";
import { priceChanges } from "./priceHistory";

describe("price history", () => {
  it("keeps only real changes with the price difference", () => {
    const r = priceChanges([
      { price: 1300, status: "actief", changed_at: "2026-11-01" },
      { price: 1300, status: "actief", changed_at: "2026-11-02" },
      { price: 1250, status: "actief", changed_at: "2026-11-10" },
    ]);
    expect(r).toHaveLength(2);
    expect(r[1]?.diff).toBe(-50);
  });
});
