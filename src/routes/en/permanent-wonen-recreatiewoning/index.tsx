import { createFileRoute } from "@tanstack/react-router";
import GuideLandingPage from "@/pages/GuideLandingPage";
import { guideByPath } from "@/lib/guidePages";

export const Route = createFileRoute("/en/permanent-wonen-recreatiewoning/")({
  component: () => <GuideLandingPage guide={guideByPath("/permanent-wonen-recreatiewoning")!} />,
});
