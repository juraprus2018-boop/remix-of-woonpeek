import { createFileRoute } from "@tanstack/react-router";
import NieuwbouwCity from "@/pages/NieuwbouwCity";

export const Route = createFileRoute("/fr/nieuwbouw/$city/")({
  component: NieuwbouwCity,
});
