import { createFileRoute } from "@tanstack/react-router";
import MarketTopicPage from "@/pages/MarketTopic";

export const Route = createFileRoute("/en/woningmarkt/$slug/")({
  component: MarketTopicPage,
});
