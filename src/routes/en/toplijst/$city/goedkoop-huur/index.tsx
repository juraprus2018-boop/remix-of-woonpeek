import { createFileRoute } from "@tanstack/react-router";
import BestOfCityPage from "@/pages/BestOfCityPage";

export const Route = createFileRoute("/en/toplijst/$city/goedkoop-huur/")({
  component: () => <BestOfCityPage variant="goedkoopste-huur" />,
});
