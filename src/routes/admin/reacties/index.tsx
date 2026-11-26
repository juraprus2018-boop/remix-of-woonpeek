import { createFileRoute } from "@tanstack/react-router";
import AdminComments from "@/pages/admin/AdminComments";

export const Route = createFileRoute("/admin/reacties/")({
  component: AdminComments,
});
