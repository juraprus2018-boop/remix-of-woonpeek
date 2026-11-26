import { createFileRoute } from "@tanstack/react-router";
import EnergieCityPage from "@/pages/EnergieCityPage";

export const Route = createFileRoute("/de/energie/$city/")({
  component: EnergieCityPage,
});
