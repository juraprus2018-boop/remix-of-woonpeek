import { createFileRoute } from "@tanstack/react-router";
import PropertyDetail from "@/pages/PropertyDetail";
import { propertyQueryOptions } from "@/hooks/useProperties";
import { propertyHead } from "@/lib/propertySeo";

export const Route = createFileRoute("/de/huurwoning/$city/$slug/")({
  loader: async ({ params, context }) => {
    try {
      return await context.queryClient.ensureQueryData(propertyQueryOptions(params.slug));
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => propertyHead(loaderData ?? null),
  component: PropertyDetail,
});
