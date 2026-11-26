import { createFileRoute } from "@tanstack/react-router";
import Nieuwbouw from "@/pages/Nieuwbouw";

export const Route = createFileRoute("/nieuwbouw/")({
  component: Nieuwbouw,
});
