import { createFileRoute } from "@tanstack/react-router";
import ListingTypePage from "@/pages/ListingTypePage";

export const Route = createFileRoute("/en/koopwoningen/")({
  component: () => <ListingTypePage listingType="koop" />,
});
