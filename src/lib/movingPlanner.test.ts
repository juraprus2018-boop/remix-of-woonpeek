import { describe, expect, it } from "vitest";
import { taskDueDate } from "./movingPlanner";

describe("moving planner", () => {
  it("counts task deadlines back from the moving date", () => {
    expect(taskDueDate("2027-01-01", 30)).toBe("2026-12-02");
    expect(taskDueDate("2027-01-01", 0)).toBe("2027-01-01");
  });
});
