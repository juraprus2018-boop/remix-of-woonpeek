import { createFileRoute } from "@tanstack/react-router";
import PropertyTypeCityPage from "@/pages/PropertyTypeCityPage";

export const Route = createFileRoute("/kamer-huren/")({
  component: () => <PropertyTypeCityPage propertyType="kamer" />,
});
