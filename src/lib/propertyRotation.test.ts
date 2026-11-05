import { describe, it, expect } from "vitest";
import { rotateProperties } from "./propertyRotation";

describe("rotateProperties", () => {
  it("alternates Huurzone, Huurwoningen.nl, RentHunter", () => {
    const rows = ["Renthunter", "Huurwoningen.nl", "Huurzone.nl", "Renthunter", "Huurzone.nl", "Huurwoningen.nl"].map((s, i) => ({ id: String(i), source_site: s, created_at: "2026-01-01" }));
    expect(rotateProperties(rows).map((r) => r.source_site)).toEqual(["Huurzone.nl", "Huurwoningen.nl", "Renthunter", "Huurzone.nl", "Huurwoningen.nl", "Renthunter"]);
  });
});
