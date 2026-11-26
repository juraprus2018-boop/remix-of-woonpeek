import { createFileRoute } from "@tanstack/react-router";
import Cities from "@/pages/Cities";

export const Route = createFileRoute("/de/woonaanbod-per-stad/")({
  component: Cities,
});
