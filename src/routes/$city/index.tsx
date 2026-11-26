import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveLegacyCityPath } from "@/lib/legacyRedirects";

// Legacy single-segment city fallback (old /:city URLs).
export const Route = createFileRoute("/$city/")({
  beforeLoad: ({ params, location }) => {
    throw redirect({ href: resolveLegacyCityPath(params.city, "", location.searchStr ? `?${location.searchStr}` : ""), replace: true, statusCode: 301 });
  },
});
