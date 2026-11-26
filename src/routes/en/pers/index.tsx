import { createFileRoute } from "@tanstack/react-router";
import Press from "@/pages/Press";

export const Route = createFileRoute("/en/pers/")({
  component: Press,
});
