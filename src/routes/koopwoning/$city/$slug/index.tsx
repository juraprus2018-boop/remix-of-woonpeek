import { createFileRoute } from "@tanstack/react-router";
import PropertyDetail from "@/pages/PropertyDetail";

export const Route = createFileRoute("/koopwoning/$city/$slug/")({
  component: PropertyDetail,
});
