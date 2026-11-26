import { createFileRoute } from "@tanstack/react-router";
import AgencyPage from "@/pages/AgencyPage";

export const Route = createFileRoute("/fr/makelaars/$slug/")({
  component: AgencyPage,
});
