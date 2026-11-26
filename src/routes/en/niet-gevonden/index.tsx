import { createFileRoute } from "@tanstack/react-router";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/en/niet-gevonden/")({
  component: NotFound,
});
