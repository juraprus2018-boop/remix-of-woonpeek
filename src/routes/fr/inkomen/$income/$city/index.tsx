import { createFileRoute } from "@tanstack/react-router";
import IncomeLandingPage from "@/pages/IncomeLandingPage";

export const Route = createFileRoute("/fr/inkomen/$income/$city/")({
  component: IncomeLandingPage,
});
