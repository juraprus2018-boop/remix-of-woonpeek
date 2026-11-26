import { createFileRoute } from "@tanstack/react-router";
import AdminMakelaarLeads from "@/pages/admin/AdminMakelaarLeads";

export const Route = createFileRoute("/admin/leads/")({
  component: AdminMakelaarLeads,
});
