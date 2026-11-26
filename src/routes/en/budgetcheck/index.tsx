import { createFileRoute } from "@tanstack/react-router";
import BudgetTool from "@/pages/BudgetTool";

export const Route = createFileRoute("/en/budgetcheck/")({
  component: BudgetTool,
});
