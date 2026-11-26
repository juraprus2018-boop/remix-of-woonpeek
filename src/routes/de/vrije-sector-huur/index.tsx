import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/de/vrije-sector-huur/")({
  component: () => <GuideLandingPage guide={guideByPath("/vrije-sector-huur")!} />,
});
