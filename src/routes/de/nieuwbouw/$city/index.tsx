import { createFileRoute } from "@tanstack/react-router";
import NieuwbouwCity from "@/pages/NieuwbouwCity";

export const Route = createFileRoute("/de/nieuwbouw/$city/")({
  component: NieuwbouwCity,
});
