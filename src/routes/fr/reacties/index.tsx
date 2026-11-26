import { createFileRoute } from "@tanstack/react-router";
import Reacties from "@/pages/Reacties";

export const Route = createFileRoute("/fr/reacties/")({
  component: Reacties,
});
