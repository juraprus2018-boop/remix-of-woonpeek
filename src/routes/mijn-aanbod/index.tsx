import { createFileRoute } from "@tanstack/react-router";
import MyProperties from "@/pages/MyProperties";

export const Route = createFileRoute("/mijn-aanbod/")({
  component: MyProperties,
});
