import { createFileRoute } from "@tanstack/react-router";
import RentIndexPage from "@/pages/RentIndexPage";

export const Route = createFileRoute("/de/huurprijs-index/$city/")({
  component: RentIndexPage,
});
