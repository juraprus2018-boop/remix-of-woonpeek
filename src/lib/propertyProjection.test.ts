import { describe, expect, it } from "vitest";
import { PROPERTY_LIST_COLUMNS, restoreListingImages, type PropertyListRow } from "./propertyProjection";

describe("lightweight listing projection", () => {
  it("excludes importer payloads and full galleries while preserving descriptions", () => {
    const fields = PROPERTY_LIST_COLUMNS.split(",");
    expect(fields).not.toContain("source_raw");
    expect(fields).not.toContain("images");
    expect(fields).toContain("first_image:images->>0");
    expect(fields).toContain("description");
  });
  it("restores one overview photo and leaves its description intact", () => {
    const row = { id: "sample", first_image: "photo.jpg", description: "Omschrijving" } as PropertyListRow;
    expect(restoreListingImages(row).images).toEqual(["photo.jpg"]);
    expect(restoreListingImages(row).description).toBe("Omschrijving");
    expect(restoreListingImages(row).source_raw).toBeNull();
  });
  it("uses an empty gallery when there is no photo", () => {
    expect(restoreListingImages({ first_image: null } as PropertyListRow).images).toEqual([]);
  });
});