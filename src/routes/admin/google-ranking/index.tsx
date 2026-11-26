import { createFileRoute } from "@tanstack/react-router";
import AdminGoogleRanking from "@/pages/admin/AdminGoogleRanking";

export const Route = createFileRoute("/admin/google-ranking/")({
  component: AdminGoogleRanking,
});
