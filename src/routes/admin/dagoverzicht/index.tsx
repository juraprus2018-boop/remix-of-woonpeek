import { createFileRoute } from "@tanstack/react-router";
import AdminDailyActivity from "@/pages/admin/AdminDailyActivity";

export const Route = createFileRoute("/admin/dagoverzicht/")({
  component: AdminDailyActivity,
});
