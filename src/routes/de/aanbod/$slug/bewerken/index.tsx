import { createFileRoute } from "@tanstack/react-router";
import EditProperty from "@/pages/EditProperty";

export const Route = createFileRoute("/de/aanbod/$slug/bewerken/")({
  component: EditProperty,
});
