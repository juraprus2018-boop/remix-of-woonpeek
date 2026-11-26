import { createFileRoute } from "@tanstack/react-router";
import TenantProfile from "@/pages/TenantProfile";

export const Route = createFileRoute("/mijn-huurdersprofiel/")({
  head: () => ({
    meta: [
      { title: "Mijn huurdersprofiel | Woonaanbod NL" },
      { name: "description", content: "Vul je huurdersprofiel in en kopieer een nette voorstelling voor je reactie op een huurwoning." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Mijn huurdersprofiel | Woonaanbod NL" },
      { property: "og:description", content: "Reageer sneller op huurwoningen met een kant-en-klare voorstelling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TenantProfile,
});
