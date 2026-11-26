import { createFileRoute } from "@tanstack/react-router";
import AdminPlaatsenCheck from "@/pages/admin/AdminPlaatsenCheck";

export const Route = createFileRoute("/admin/plaatsen-check/")({
  component: AdminPlaatsenCheck,
});
