import { createFileRoute } from "@tanstack/react-router";
import Favorites from "@/pages/Favorites";

export const Route = createFileRoute("/opgeslagen/")({
  component: Favorites,
});
