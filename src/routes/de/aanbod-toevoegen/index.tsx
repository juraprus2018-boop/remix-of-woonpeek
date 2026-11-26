import { createFileRoute } from "@tanstack/react-router";
import CreateProperty from "@/pages/CreateProperty";

export const Route = createFileRoute("/de/aanbod-toevoegen/")({
  component: CreateProperty,
});
