import { createFileRoute } from "@tanstack/react-router";
import MakelaarPage from "@/pages/MakelaarPage";

export const Route = createFileRoute("/makelaar/$slug/")({
  component: MakelaarPage,
});
