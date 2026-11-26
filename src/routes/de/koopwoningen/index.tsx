import { createFileRoute } from "@tanstack/react-router";
import ListingTypePage from "@/pages/ListingTypePage";

export const Route = createFileRoute("/de/koopwoningen/")({
  component: () => <ListingTypePage listingType="koop" />,
});
