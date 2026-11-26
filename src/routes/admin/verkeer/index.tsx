import { createFileRoute } from "@tanstack/react-router";
import AdminTraffic from "@/pages/admin/AdminTraffic";

export const Route = createFileRoute("/admin/verkeer/")({
  component: AdminTraffic,
});
