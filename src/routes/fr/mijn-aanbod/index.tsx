import { createFileRoute } from "@tanstack/react-router";
import MyProperties from "@/pages/MyProperties";

export const Route = createFileRoute("/fr/mijn-aanbod/")({
  component: MyProperties,
});
