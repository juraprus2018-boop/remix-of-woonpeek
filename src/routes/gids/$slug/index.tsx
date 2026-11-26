import { createFileRoute } from "@tanstack/react-router";
import LongtailLanding from "@/pages/LongtailLanding";

export const Route = createFileRoute("/gids/$slug/")({
  component: LongtailLanding,
});
