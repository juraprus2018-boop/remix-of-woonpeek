import { createFileRoute } from "@tanstack/react-router";
import NewListingsCity from "@/pages/NewListingsCity";

export const Route = createFileRoute("/en/vandaag/$city/")({
  component: NewListingsCity,
});
