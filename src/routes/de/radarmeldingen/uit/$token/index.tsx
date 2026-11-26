import { createFileRoute } from "@tanstack/react-router";
import AlertUnsubscribe from "@/pages/AlertUnsubscribe";

export const Route = createFileRoute("/de/radarmeldingen/uit/$token/")({
  component: AlertUnsubscribe,
});
