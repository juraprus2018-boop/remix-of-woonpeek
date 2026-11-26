import { createFileRoute } from "@tanstack/react-router";
import HuurprijsMonitor from "@/pages/HuurprijsMonitor";

export const Route = createFileRoute("/en/markt/$city/")({
  component: HuurprijsMonitor,
});
