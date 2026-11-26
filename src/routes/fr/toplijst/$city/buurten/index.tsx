import { createFileRoute } from "@tanstack/react-router";
import BestOfCityPage from "@/pages/BestOfCityPage";

export const Route = createFileRoute("/fr/toplijst/$city/buurten/")({
  component: () => <BestOfCityPage variant="beste-buurten" />,
});
