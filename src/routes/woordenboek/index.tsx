import { createFileRoute } from "@tanstack/react-router";
import Woordenboek from "@/pages/Woordenboek";

export const Route = createFileRoute("/woordenboek/")({
  component: Woordenboek,
});
