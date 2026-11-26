import { createFileRoute } from "@tanstack/react-router";
import CityGuidePage from "@/pages/CityGuidePage";

export const Route = createFileRoute("/stadsgids/$city/")({
  component: CityGuidePage,
});
