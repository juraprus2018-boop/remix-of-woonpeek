import { createFileRoute } from "@tanstack/react-router";
import BudgetTool from "@/pages/BudgetTool";

export const Route = createFileRoute("/de/budgetcheck/")({
  component: BudgetTool,
});
