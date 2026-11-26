import { createFileRoute } from "@tanstack/react-router";
import ListingTypePage from "@/pages/ListingTypePage";

export const Route = createFileRoute("/fr/huurwoningen/$city/")({
  component: () => <ListingTypePage listingType="huur" />,
});
