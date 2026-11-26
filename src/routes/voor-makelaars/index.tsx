import { createFileRoute } from "@tanstack/react-router";
import VoorMakelaars from "@/pages/VoorMakelaars";

export const Route = createFileRoute("/voor-makelaars/")({
  component: VoorMakelaars,
});
