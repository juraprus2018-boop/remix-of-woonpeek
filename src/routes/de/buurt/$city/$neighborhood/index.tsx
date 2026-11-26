import { createFileRoute } from "@tanstack/react-router";
import NeighborhoodPage from "@/pages/NeighborhoodPage";

export const Route = createFileRoute("/de/buurt/$city/$neighborhood/")({
  component: NeighborhoodPage,
});
