import { createFileRoute } from "@tanstack/react-router";
import ExpatHousing from "@/pages/ExpatHousing";

export const Route = createFileRoute("/de/expat-housing/")({
  component: ExpatHousing,
});
