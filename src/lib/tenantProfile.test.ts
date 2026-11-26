import { describe, expect, it } from "vitest";
import { buildIntroText, maxRentForIncome } from "./tenantProfile";

const base = { household_size: null, monthly_income: null, employment: null, pets: false, smoker: false, move_in_from: null, intro: null };

describe("tenant profile", () => {
  it("applies the 3x income rule", () => {
    expect(maxRentForIncome(3600)).toBe(1200);
    expect(maxRentForIncome(null)).toBeNull();
  });
  it("leaves out income when not filled in", () => {
    expect(buildIntroText("Sam", base)).not.toContain("inkomen");
    expect(buildIntroText("Sam", { ...base, monthly_income: 3600 })).toContain("€ 3.600");
  });
});
