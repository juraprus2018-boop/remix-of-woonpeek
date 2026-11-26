import { createFileRoute, notFound } from "@tanstack/react-router";
import CityPage from "@/pages/CityPage";
import { getValidCityName } from "@/lib/dutchCities";

export const Route = createFileRoute("/en/stad/$city/")({
  beforeLoad: ({ params }) => {
    if (!getValidCityName(params.city)) throw notFound();
  },
  component: CityPage,
});
