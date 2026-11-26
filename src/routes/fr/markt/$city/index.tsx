import { createFileRoute } from "@tanstack/react-router";
import HuurprijsMonitor from "@/pages/HuurprijsMonitor";

export const Route = createFileRoute("/fr/markt/$city/")({
  component: HuurprijsMonitor,
});
