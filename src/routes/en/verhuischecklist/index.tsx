import { createFileRoute } from "@tanstack/react-router";
import Verhuischecklist from "@/pages/Verhuischecklist";

export const Route = createFileRoute("/en/verhuischecklist/")({
  component: Verhuischecklist,
});
