import { createFileRoute } from "@tanstack/react-router";
import AdminTikTok from "@/pages/admin/AdminTikTok";

export const Route = createFileRoute("/admin/tiktok/")({
  component: AdminTikTok,
});
