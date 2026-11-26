import { createFileRoute } from "@tanstack/react-router";
import { clientOnlyLazy } from "@/lib/clientOnly";

// Uses Leaflet at module scope, so it only renders in the browser.
const AdminGoogleRanking = clientOnlyLazy(() => import("@/pages/admin/AdminGoogleRanking"));

export const Route = createFileRoute("/admin/google-ranking/")({
  component: AdminGoogleRanking,
});
