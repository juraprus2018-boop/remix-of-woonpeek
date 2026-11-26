import { createFileRoute } from "@tanstack/react-router";
import AdminSiteSettings from "@/pages/admin/AdminSiteSettings";

export const Route = createFileRoute("/admin/site-instellingen/")({
  component: AdminSiteSettings,
});
