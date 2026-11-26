import { createFileRoute } from "@tanstack/react-router";
import RentHeatmapPage from "@/pages/RentHeatmapPage";

export const Route = createFileRoute("/de/heatmap/$city/")({
  component: RentHeatmapPage,
});
