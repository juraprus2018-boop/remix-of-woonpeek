import { createFileRoute } from "@tanstack/react-router";
import PropertyTypeCityPage from "@/pages/PropertyTypeCityPage";

export const Route = createFileRoute("/fr/studio-huren/")({
  component: () => <PropertyTypeCityPage propertyType="studio" />,
});
