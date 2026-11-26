import { createFileRoute } from "@tanstack/react-router";
import NieuwbouwCity from "@/pages/NieuwbouwCity";

export const Route = createFileRoute("/nieuwbouw/$city/")({
  component: NieuwbouwCity,
});
