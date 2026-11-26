import { createFileRoute } from "@tanstack/react-router";
import PortalGuide from "@/pages/PortalGuide";

export const Route = createFileRoute("/woningnet/")({
  component: PortalGuide,
});
