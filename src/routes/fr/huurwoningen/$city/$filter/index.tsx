import { createFileRoute } from "@tanstack/react-router";
import FilteredLandingPage from "@/pages/FilteredLandingPage";

export const Route = createFileRoute("/fr/huurwoningen/$city/$filter/")({
  component: () => <FilteredLandingPage listingType="huur" />,
});
