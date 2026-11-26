import { createFileRoute } from "@tanstack/react-router";
import NewListings from "@/pages/NewListings";

export const Route = createFileRoute("/en/vandaag/")({
  component: NewListings,
});
