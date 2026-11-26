import { createFileRoute } from "@tanstack/react-router";
import PropertyDetail from "@/pages/PropertyDetail";

export const Route = createFileRoute("/en/huurwoning/$city/$slug/")({
  component: PropertyDetail,
});
