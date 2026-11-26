import { createFileRoute, notFound } from "@tanstack/react-router";
import NotFound from "@/pages/NotFound";
import PropertyDetail from "@/pages/PropertyDetail";
import { propertyQueryOptions } from "@/hooks/useProperties";
import { propertyHead } from "@/lib/propertySeo";

export const Route = createFileRoute("/de/huurwoning/$city/$slug/")({
  loader: async ({ params, context }) => {
    // Onbekende woning: echte 404 in plaats van een lege pagina met status 200.
    const property = await context.queryClient.ensureQueryData(propertyQueryOptions(params.slug));
    if (!property) throw notFound();
    return property;
  },
  head: ({ loaderData }) => propertyHead(loaderData ?? null),
  component: PropertyDetail,
  notFoundComponent: NotFound,
});
