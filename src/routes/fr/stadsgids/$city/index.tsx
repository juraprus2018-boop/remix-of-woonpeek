import { createFileRoute } from "@tanstack/react-router";
import CityGuidePage from "@/pages/CityGuidePage";

export const Route = createFileRoute("/fr/stadsgids/$city/")({
  component: CityGuidePage,
});
