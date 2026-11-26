import { createFileRoute } from "@tanstack/react-router";
import HypotheekBerekenen from "@/pages/HypotheekBerekenen";

export const Route = createFileRoute("/hypotheek-berekenen/")({
  component: HypotheekBerekenen,
});
