import { createFileRoute } from "@tanstack/react-router";
import TermsAndConditions from "@/pages/TermsAndConditions";

export const Route = createFileRoute("/de/voorwaarden/")({
  component: TermsAndConditions,
});
