import { createFileRoute } from "@tanstack/react-router";
import ListingTypePage from "@/pages/ListingTypePage";
import { loadCitySeoHead, citySeoHeadTags } from "@/lib/citySeoHead";

export const Route = createFileRoute("/huurwoningen/$city/")({
  loader: ({ params }) => loadCitySeoHead(params.city),
  head: ({ loaderData }) => citySeoHeadTags(loaderData),
  component: () => <ListingTypePage listingType="huur" />,
});
