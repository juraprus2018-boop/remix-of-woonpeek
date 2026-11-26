import { createFileRoute } from "@tanstack/react-router";
import AdminPageTypes from "@/pages/admin/AdminPageTypes";

export const Route = createFileRoute("/admin/paginatypen/")({
  component: AdminPageTypes,
});
