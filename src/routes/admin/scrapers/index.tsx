import { createFileRoute } from "@tanstack/react-router";
import AdminScrapers from "@/pages/admin/AdminScrapers";

export const Route = createFileRoute("/admin/scrapers/")({
  component: AdminScrapers,
});
