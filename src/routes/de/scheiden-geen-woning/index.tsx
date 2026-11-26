import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/de/scheiden-geen-woning/")({
  component: () => <GuideLandingPage guide={guideByPath("/scheiden-geen-woning")!} />,
});
