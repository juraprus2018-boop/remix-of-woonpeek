import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/de/tijdelijke-woonruimte/")({
  component: () => <GuideLandingPage guide={guideByPath("/tijdelijke-woonruimte")!} />,
});
