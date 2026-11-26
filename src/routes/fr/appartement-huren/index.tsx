import { createFileRoute } from "@tanstack/react-router";
import PropertyTypeCityPage from "@/pages/PropertyTypeCityPage";

export const Route = createFileRoute("/fr/appartement-huren/")({
  component: () => <PropertyTypeCityPage propertyType="appartement" />,
});
