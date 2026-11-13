import { describe, expect, it } from "vitest";
import { normalizePropertyDetail, propertyDate } from "./propertyDetailData";

describe("incomplete property detail data", () => {
  it("makes absent address and description safe for string operations", () => {
    const result = normalizePropertyDetail({});
    expect(result.city.toLowerCase()).toBe("");
    expect(result.street.split(",")).toEqual([""]);
    expect(result.description.replace(/<[^>]*>/g, "")).toBe("");
    expect(result.source_site).toBeNull();
  });
  it("keeps absent prices unknown instead of converting them to zero", () => {
    expect(normalizePropertyDetail({}).price).toBeNull();
    expect(normalizePropertyDetail({ price: 0 }).price).toBe(0);
    expect(normalizePropertyDetail({ price: 764 }).price).toBe(764);
    expect(normalizePropertyDetail({ price: NaN }).price).toBeNull();
  });
  it("excludes empty or missing photos while retaining the gallery", () => {
    expect(normalizePropertyDetail({ images: ["", " ", "https://example.org/house.jpg"] }).images).toEqual(["https://example.org/house.jpg"]);
    expect(normalizePropertyDetail({ images: null }).images).toEqual([]);
  });
  it("does not invent dates and prevents invalid ISO serialization", () => {
    expect(propertyDate(null)).toBeUndefined();
    expect(propertyDate("not-a-date")).toBeUndefined();
    expect(propertyDate("2026-11-13")).toBe("2026-11-13T00:00:00.000Z");
  });
  it("omits incomplete or out-of-range map coordinates", () => {
    expect(normalizePropertyDetail({ latitude: 52, longitude: null }).latitude).toBeNull();
    expect(normalizePropertyDetail({ latitude: 100, longitude: 5 }).longitude).toBeNull();
    expect(normalizePropertyDetail({ latitude: 52, longitude: 5 }).latitude).toBe(52);
  });
});