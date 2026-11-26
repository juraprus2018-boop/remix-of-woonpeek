import { createFileRoute } from "@tanstack/react-router";
import Samenwerking from "@/pages/Samenwerking";

export const Route = createFileRoute("/de/samenwerken/")({
  component: Samenwerking,
});
