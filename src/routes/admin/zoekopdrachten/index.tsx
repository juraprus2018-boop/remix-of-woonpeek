import { createFileRoute } from "@tanstack/react-router";
import AdminSearchQueries from "@/pages/admin/AdminSearchQueries";

export const Route = createFileRoute("/admin/zoekopdrachten/")({
  component: AdminSearchQueries,
});
