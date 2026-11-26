import { createFileRoute } from "@tanstack/react-router";
import Woordenboek from "@/pages/Woordenboek";

export const Route = createFileRoute("/fr/woordenboek/")({
  component: Woordenboek,
});
