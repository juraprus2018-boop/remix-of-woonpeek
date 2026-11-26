import { createFileRoute } from "@tanstack/react-router";
import AdminAgencies from "@/pages/admin/AdminAgencies";

export const Route = createFileRoute("/admin/makelaars/")({
  component: AdminAgencies,
});
