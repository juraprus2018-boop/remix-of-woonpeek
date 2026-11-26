import { createFileRoute } from "@tanstack/react-router";
import AgencyPage from "@/pages/AgencyPage";

export const Route = createFileRoute("/makelaars/$slug/")({
  component: AgencyPage,
});
