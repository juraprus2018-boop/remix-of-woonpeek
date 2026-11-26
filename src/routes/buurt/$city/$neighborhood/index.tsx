import { createFileRoute } from "@tanstack/react-router";
import NeighborhoodPage from "@/pages/NeighborhoodPage";

export const Route = createFileRoute("/buurt/$city/$neighborhood/")({
  component: NeighborhoodPage,
});
