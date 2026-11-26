import { createFileRoute } from "@tanstack/react-router";
import IncomeLandingPage from "@/pages/IncomeLandingPage";

export const Route = createFileRoute("/inkomen/$income/$city/")({
  component: IncomeLandingPage,
});
