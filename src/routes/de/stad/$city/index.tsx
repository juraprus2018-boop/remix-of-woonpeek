import { createFileRoute } from "@tanstack/react-router";
import CityPage from "@/pages/CityPage";

export const Route = createFileRoute("/de/stad/$city/")({
  component: CityPage,
});
