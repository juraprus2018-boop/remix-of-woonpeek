import { createFileRoute } from "@tanstack/react-router";
import PortalGuide from "@/pages/PortalGuide";

export const Route = createFileRoute("/thuiskompas/")({
  component: PortalGuide,
});
