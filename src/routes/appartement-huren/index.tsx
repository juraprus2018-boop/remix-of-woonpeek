import { createFileRoute } from "@tanstack/react-router";
import PropertyTypeCityPage from "@/pages/PropertyTypeCityPage";

export const Route = createFileRoute("/appartement-huren/")({
  component: () => <PropertyTypeCityPage propertyType="appartement" />,
});
