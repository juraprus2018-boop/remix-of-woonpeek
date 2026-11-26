import { createFileRoute } from "@tanstack/react-router";
import AgencyPage from "@/pages/AgencyPage";

export const Route = createFileRoute("/de/makelaars/$slug/")({
  component: AgencyPage,
});
