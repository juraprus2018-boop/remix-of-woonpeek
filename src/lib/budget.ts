export type BudgetBalance = { valid: boolean; balance: number; savings: number; deficit: number };

/** Calculates monthly balance from income and every listed expense. Invalid or negative values are rejected. */
export function calculateBudgetBalance(income: number | string, expenses: Array<number | string>): BudgetBalance {
  const values = [income, ...expenses].map((value) => typeof value === "string" && value.trim() === "" ? NaN : Number(value));
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    return { valid: false, balance: 0, savings: 0, deficit: 0 };
  }
  const balance = values[0] - values.slice(1).reduce((sum, value) => sum + value, 0);
  return { valid: true, balance, savings: Math.max(0, balance), deficit: Math.max(0, -balance) };
}
