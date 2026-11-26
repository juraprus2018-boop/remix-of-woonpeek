import { createFileRoute, notFound } from "@tanstack/react-router";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/fr/niet-gevonden/")({
  beforeLoad: () => {
    throw notFound();
  },
  component: NotFound,
});
