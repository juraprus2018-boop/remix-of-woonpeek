import { createFileRoute } from "@tanstack/react-router";
import CreateProperty from "@/pages/CreateProperty";

export const Route = createFileRoute("/fr/aanbod-toevoegen/")({
  component: CreateProperty,
});
