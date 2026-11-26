import { createFileRoute } from "@tanstack/react-router";
import ExpatHousing from "@/pages/ExpatHousing";

export const Route = createFileRoute("/expat-housing/")({
  component: ExpatHousing,
});
