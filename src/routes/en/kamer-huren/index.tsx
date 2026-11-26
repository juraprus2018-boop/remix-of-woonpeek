import { createFileRoute } from "@tanstack/react-router";
import PropertyTypeCityPage from "@/pages/PropertyTypeCityPage";

export const Route = createFileRoute("/en/kamer-huren/")({
  component: () => <PropertyTypeCityPage propertyType="kamer" />,
});
