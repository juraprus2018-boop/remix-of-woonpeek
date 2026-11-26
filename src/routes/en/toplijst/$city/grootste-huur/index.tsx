import { createFileRoute } from "@tanstack/react-router";
import BestOfCityPage from "@/pages/BestOfCityPage";

export const Route = createFileRoute("/en/toplijst/$city/grootste-huur/")({
  component: () => <BestOfCityPage variant="grootste-huur" />,
});
