import { createFileRoute } from "@tanstack/react-router";
import CityComparePage from "@/pages/CityComparePage";

export const Route = createFileRoute("/de/duel/$pair/")({
  component: CityComparePage,
});
