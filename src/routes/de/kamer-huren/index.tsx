import { createFileRoute } from "@tanstack/react-router";
import PropertyTypeCityPage from "@/pages/PropertyTypeCityPage";

export const Route = createFileRoute("/de/kamer-huren/")({
  component: () => <PropertyTypeCityPage propertyType="kamer" />,
});
