import { createFileRoute } from "@tanstack/react-router";
import AdminAds from "@/pages/admin/AdminAds";

export const Route = createFileRoute("/admin/advertenties/")({
  component: AdminAds,
});
