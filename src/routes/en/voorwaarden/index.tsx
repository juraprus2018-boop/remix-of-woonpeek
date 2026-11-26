import { createFileRoute } from "@tanstack/react-router";
import TermsAndConditions from "@/pages/TermsAndConditions";

export const Route = createFileRoute("/en/voorwaarden/")({
  component: TermsAndConditions,
});
