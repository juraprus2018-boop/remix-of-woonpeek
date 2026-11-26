import { createFileRoute } from "@tanstack/react-router";
import CityGuidePage from "@/pages/CityGuidePage";

export const Route = createFileRoute("/en/stadsgids/$city/")({
  component: CityGuidePage,
});
