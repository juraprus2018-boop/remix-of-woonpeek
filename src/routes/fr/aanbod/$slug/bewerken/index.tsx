import { createFileRoute } from "@tanstack/react-router";
import EditProperty from "@/pages/EditProperty";

export const Route = createFileRoute("/fr/aanbod/$slug/bewerken/")({
  component: EditProperty,
});
