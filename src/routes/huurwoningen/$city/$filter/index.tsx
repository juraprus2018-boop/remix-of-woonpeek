import { createFileRoute } from "@tanstack/react-router";
import FilteredLandingPage from "@/pages/FilteredLandingPage";
import { loadCitySeoHead, citySeoHeadTags } from "@/lib/citySeoHead";

export const Route = createFileRoute("/huurwoningen/$city/$filter/")({
  loader: ({ params }) => loadCitySeoHead(params.city, params.filter),
  head: ({ loaderData }) => citySeoHeadTags(loaderData),
  component: () => <FilteredLandingPage listingType="huur" />,
});
