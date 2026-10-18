import { describe, expect, it } from "vitest";
import { calculateBudgetBalance } from "./budget";

describe("calculateBudgetBalance", () => {
  it("toont een tekort naast nul spaargeld", () => {
    expect(calculateBudgetBalance(2675, [2880])).toEqual({ valid: true, balance: -205, savings: 0, deficit: 205 });
  });
  it("berekent positief saldo", () => {
    expect(calculateBudgetBalance(3000, [2000])).toEqual({ valid: true, balance: 1000, savings: 1000, deficit: 0 });
  });
  it("berekent exact nul", () => {
    expect(calculateBudgetBalance(2000, [2000])).toEqual({ valid: true, balance: 0, savings: 0, deficit: 0 });
  });
  it.each([["", [1]], [NaN, [1]], [1, [NaN]], [-1, [0]], [100, [-1]]] as const)("weigert ongeldige bedragen", (income, expenses) => {
    expect(calculateBudgetBalance(income, expenses).valid).toBe(false);
  });
});
