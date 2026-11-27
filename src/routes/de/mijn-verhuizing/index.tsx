import { createFileRoute } from "@tanstack/react-router";
import MovingPlanner from "@/pages/MovingPlanner";

export const Route = createFileRoute("/de/mijn-verhuizing/")({
  head: () => ({
    meta: [
      { title: "Mijn verhuisplanner | Woonaanbod NL" },
      { name: "description", content: "Plan je verhuizing met een eigen takenlijst die terugrekent vanaf je verhuisdatum." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Mijn verhuisplanner | Woonaanbod NL" },
      { property: "og:description", content: "Een persoonlijke verhuisplanner met taken en deadlines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MovingPlanner,
});
