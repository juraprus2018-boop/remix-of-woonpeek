import { createFileRoute } from "@tanstack/react-router";
import PropertyTypeCityPage from "@/pages/PropertyTypeCityPage";

export const Route = createFileRoute("/fr/huis-huren/")({
  component: () => <PropertyTypeCityPage propertyType="huis" />,
});
