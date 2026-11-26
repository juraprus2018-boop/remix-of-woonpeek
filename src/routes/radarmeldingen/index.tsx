import { createFileRoute } from "@tanstack/react-router";
import SearchAlerts from "@/pages/SearchAlerts";

export const Route = createFileRoute("/radarmeldingen/")({
  component: SearchAlerts,
});
