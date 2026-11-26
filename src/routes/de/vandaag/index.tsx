import { createFileRoute } from "@tanstack/react-router";
import NewListings from "@/pages/NewListings";

export const Route = createFileRoute("/de/vandaag/")({
  component: NewListings,
});
