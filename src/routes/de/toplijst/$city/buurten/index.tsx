import { createFileRoute } from "@tanstack/react-router";
import BestOfCityPage from "@/pages/BestOfCityPage";

export const Route = createFileRoute("/de/toplijst/$city/buurten/")({
  component: () => <BestOfCityPage variant="beste-buurten" />,
});
