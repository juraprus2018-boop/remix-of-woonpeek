import { createFileRoute } from "@tanstack/react-router";
import CityComparePage from "@/pages/CityComparePage";

export const Route = createFileRoute("/fr/duel/$pair/")({
  component: CityComparePage,
});
