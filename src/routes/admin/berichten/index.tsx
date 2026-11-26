import { createFileRoute } from "@tanstack/react-router";
import AdminChat from "@/pages/admin/AdminChat";

export const Route = createFileRoute("/admin/berichten/")({
  component: AdminChat,
});
