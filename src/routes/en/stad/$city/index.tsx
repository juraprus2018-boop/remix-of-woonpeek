import { createFileRoute } from "@tanstack/react-router";
import CityPage from "@/pages/CityPage";

export const Route = createFileRoute("/en/stad/$city/")({
  component: CityPage,
});
