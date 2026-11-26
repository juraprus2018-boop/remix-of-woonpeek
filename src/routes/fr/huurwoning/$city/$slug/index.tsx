import { createFileRoute } from "@tanstack/react-router";
import PropertyDetail from "@/pages/PropertyDetail";

export const Route = createFileRoute("/fr/huurwoning/$city/$slug/")({
  component: PropertyDetail,
});
