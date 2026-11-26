import { createFileRoute } from "@tanstack/react-router";
import AgenciesList from "@/pages/AgenciesList";

export const Route = createFileRoute("/en/makelaars/")({
  component: AgenciesList,
});
