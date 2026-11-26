import { createFileRoute } from "@tanstack/react-router";
import AdminSettings from "@/pages/admin/AdminSettings";

export const Route = createFileRoute("/admin/instellingen/")({
  component: AdminSettings,
});
