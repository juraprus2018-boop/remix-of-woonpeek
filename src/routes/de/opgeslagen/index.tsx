import { createFileRoute } from "@tanstack/react-router";
import Favorites from "@/pages/Favorites";

export const Route = createFileRoute("/de/opgeslagen/")({
  component: Favorites,
});
