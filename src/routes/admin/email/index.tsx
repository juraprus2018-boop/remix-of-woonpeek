import { createFileRoute } from "@tanstack/react-router";
import AdminEmailSender from "@/pages/admin/AdminEmailSender";

export const Route = createFileRoute("/admin/email/")({
  component: AdminEmailSender,
});
