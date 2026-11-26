import { createFileRoute } from "@tanstack/react-router";
import MakelaarPortal from "@/pages/MakelaarPortal";

export const Route = createFileRoute("/de/makelaar-portal/")({
  component: MakelaarPortal,
});
