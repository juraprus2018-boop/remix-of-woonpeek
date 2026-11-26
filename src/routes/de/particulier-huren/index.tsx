import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/de/particulier-huren/")({
  component: () => <GuideLandingPage guide={guideByPath("/particulier-huren")!} />,
});
