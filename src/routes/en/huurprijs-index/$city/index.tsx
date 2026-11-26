import { createFileRoute } from "@tanstack/react-router";
import RentIndexPage from "@/pages/RentIndexPage";

export const Route = createFileRoute("/en/huurprijs-index/$city/")({
  component: RentIndexPage,
});
