import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/en/antikraak-wonen/")({
  component: () => <GuideLandingPage guide={guideByPath("/antikraak-wonen")!} />,
});
