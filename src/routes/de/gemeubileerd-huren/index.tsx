import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/de/gemeubileerd-huren/")({
  component: () => <GuideLandingPage guide={guideByPath("/gemeubileerd-huren")!} />,
});
