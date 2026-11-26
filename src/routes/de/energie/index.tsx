import { createFileRoute } from "@tanstack/react-router";
import EnergieVergelijken from "@/pages/EnergieVergelijken";

export const Route = createFileRoute("/de/energie/")({
  component: EnergieVergelijken,
});
