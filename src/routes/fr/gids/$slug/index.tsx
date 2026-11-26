import { createFileRoute } from "@tanstack/react-router";
import LongtailLanding from "@/pages/LongtailLanding";

export const Route = createFileRoute("/fr/gids/$slug/")({
  component: LongtailLanding,
});
