import { createFileRoute } from "@tanstack/react-router";
import CityStats from "@/pages/CityStats";

export const Route = createFileRoute("/fr/cijfers/$city/")({
  component: CityStats,
});
