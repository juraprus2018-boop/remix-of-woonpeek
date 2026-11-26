import { createFileRoute } from "@tanstack/react-router";
import MyProperties from "@/pages/MyProperties";

export const Route = createFileRoute("/de/mijn-aanbod/")({
  component: MyProperties,
});
