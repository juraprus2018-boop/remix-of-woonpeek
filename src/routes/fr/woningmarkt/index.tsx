import { createFileRoute } from "@tanstack/react-router";
import MarketData from "@/pages/MarketData";

export const Route = createFileRoute("/fr/woningmarkt/")({
  component: MarketData,
});
