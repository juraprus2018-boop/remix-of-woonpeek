import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/vrije-sector-huur/")({
  component: () => <GuideLandingPage guide={guideByPath("/vrije-sector-huur")!} />,
});
