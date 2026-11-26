import { createFileRoute } from "@tanstack/react-router";
import ListingTypePage from "@/pages/ListingTypePage";

export const Route = createFileRoute("/koopwoningen/$city/")({
  component: () => <ListingTypePage listingType="koop" />,
});
