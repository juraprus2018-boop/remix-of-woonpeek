import { createFileRoute } from "@tanstack/react-router";
import AdminProperties from "@/pages/admin/AdminProperties";

export const Route = createFileRoute("/admin/woningen/")({
  component: AdminProperties,
});
