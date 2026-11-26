import { createFileRoute } from "@tanstack/react-router";
import DailyAlert from "@/pages/DailyAlert";

export const Route = createFileRoute("/woonmelding/")({
  component: DailyAlert,
});
