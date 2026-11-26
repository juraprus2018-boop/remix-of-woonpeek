import { createFileRoute } from "@tanstack/react-router";
import AlertUnsubscribe from "@/pages/AlertUnsubscribe";

export const Route = createFileRoute("/fr/radarmeldingen/uit/$token/")({
  component: AlertUnsubscribe,
});
