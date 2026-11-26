import { createFileRoute } from "@tanstack/react-router";
import CreateProperty from "@/pages/CreateProperty";

export const Route = createFileRoute("/aanbod-toevoegen/")({
  component: CreateProperty,
});
