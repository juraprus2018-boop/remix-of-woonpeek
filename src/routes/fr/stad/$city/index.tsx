import { createFileRoute } from "@tanstack/react-router";
import CityPage from "@/pages/CityPage";

export const Route = createFileRoute("/fr/stad/$city/")({
  component: CityPage,
});
