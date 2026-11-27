import { createFileRoute } from "@tanstack/react-router";
import MyApplications from "@/pages/MyApplications";

export const Route = createFileRoute("/en/mijn-reacties/")({
  head: () => ({
    meta: [
      { title: "Mijn reacties en bezichtigingen | Woonaanbod NL" },
      { name: "description", content: "Houd bij op welke woningen je hebt gereageerd, plan bezichtigingen en zet ze in je agenda." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Mijn reacties en bezichtigingen | Woonaanbod NL" },
      { property: "og:description", content: "Houd je reacties op huurwoningen en bezichtigingen overzichtelijk bij." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyApplications,
});
