import { createFileRoute } from "@tanstack/react-router";
import EnergieCityPage from "@/pages/EnergieCityPage";

export const Route = createFileRoute("/en/energie/$city/")({
  component: EnergieCityPage,
});
