import { createFileRoute } from "@tanstack/react-router";
import MakelaarPage from "@/pages/MakelaarPage";

export const Route = createFileRoute("/en/makelaar/$slug/")({
  component: MakelaarPage,
});
