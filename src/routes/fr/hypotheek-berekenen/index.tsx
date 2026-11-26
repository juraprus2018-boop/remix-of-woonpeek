import { createFileRoute } from "@tanstack/react-router";
import HypotheekBerekenen from "@/pages/HypotheekBerekenen";

export const Route = createFileRoute("/fr/hypotheek-berekenen/")({
  component: HypotheekBerekenen,
});
