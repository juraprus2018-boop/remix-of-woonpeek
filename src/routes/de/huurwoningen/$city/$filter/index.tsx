import { createFileRoute } from "@tanstack/react-router";
import FilteredLandingPage from "@/pages/FilteredLandingPage";

export const Route = createFileRoute("/de/huurwoningen/$city/$filter/")({
  component: () => <FilteredLandingPage listingType="huur" />,
});
