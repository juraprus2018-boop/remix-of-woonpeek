import { createFileRoute } from "@tanstack/react-router";
import CityStats from "@/pages/CityStats";

export const Route = createFileRoute("/en/cijfers/$city/")({
  component: CityStats,
});
