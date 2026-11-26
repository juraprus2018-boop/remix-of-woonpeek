import { createFileRoute } from "@tanstack/react-router";
import Verhuischecklist from "@/pages/Verhuischecklist";

export const Route = createFileRoute("/de/verhuischecklist/")({
  component: Verhuischecklist,
});
