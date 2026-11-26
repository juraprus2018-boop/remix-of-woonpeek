import { createFileRoute } from "@tanstack/react-router";
import NewListingsCity from "@/pages/NewListingsCity";

export const Route = createFileRoute("/fr/vandaag/$city/")({
  component: NewListingsCity,
});
