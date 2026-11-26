import { createFileRoute } from "@tanstack/react-router";
import PropertyDetail from "@/pages/PropertyDetail";

export const Route = createFileRoute("/de/aanbod/$slug/")({
  component: PropertyDetail,
});
