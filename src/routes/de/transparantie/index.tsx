import { createFileRoute } from "@tanstack/react-router";
import Transparantie from "@/pages/Transparantie";

export const Route = createFileRoute("/de/transparantie/")({
  component: Transparantie,
});
