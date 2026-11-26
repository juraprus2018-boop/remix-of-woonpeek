import { createFileRoute } from "@tanstack/react-router";
import AdminFacebookQueue from "@/pages/admin/AdminFacebookQueue";

export const Route = createFileRoute("/admin/facebook/")({
  component: AdminFacebookQueue,
});
