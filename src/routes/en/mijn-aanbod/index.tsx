import { createFileRoute } from "@tanstack/react-router";
import MyProperties from "@/pages/MyProperties";

export const Route = createFileRoute("/en/mijn-aanbod/")({
  component: MyProperties,
});
