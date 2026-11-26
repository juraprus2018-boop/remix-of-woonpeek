import { createFileRoute } from "@tanstack/react-router";
import Nieuwbouw from "@/pages/Nieuwbouw";

export const Route = createFileRoute("/de/nieuwbouw/")({
  component: Nieuwbouw,
});
