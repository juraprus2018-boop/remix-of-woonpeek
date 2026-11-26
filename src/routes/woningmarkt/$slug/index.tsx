import { createFileRoute } from "@tanstack/react-router";
import MarketTopicPage from "@/pages/MarketTopic";

export const Route = createFileRoute("/woningmarkt/$slug/")({
  component: MarketTopicPage,
});
