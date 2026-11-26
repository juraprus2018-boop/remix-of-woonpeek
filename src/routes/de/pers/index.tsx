import { createFileRoute } from "@tanstack/react-router";
import Press from "@/pages/Press";

export const Route = createFileRoute("/de/pers/")({
  component: Press,
});
