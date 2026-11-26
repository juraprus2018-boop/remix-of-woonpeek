import { createFileRoute } from "@tanstack/react-router";
import AdminAlertSubscribers from "@/pages/admin/AdminAlertSubscribers";

export const Route = createFileRoute("/admin/alerts/")({
  component: AdminAlertSubscribers,
});
