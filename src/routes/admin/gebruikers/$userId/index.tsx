import { createFileRoute } from "@tanstack/react-router";
import AdminUserDetail from "@/pages/admin/AdminUserDetail";

export const Route = createFileRoute("/admin/gebruikers/$userId/")({
  component: AdminUserDetail,
});
