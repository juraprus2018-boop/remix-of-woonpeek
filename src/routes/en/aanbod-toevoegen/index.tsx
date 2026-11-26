import { createFileRoute } from "@tanstack/react-router";
import CreateProperty from "@/pages/CreateProperty";

export const Route = createFileRoute("/en/aanbod-toevoegen/")({
  component: CreateProperty,
});
