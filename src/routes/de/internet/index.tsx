import { createFileRoute } from "@tanstack/react-router";
import InternetVergelijken from "@/pages/InternetVergelijken";

export const Route = createFileRoute("/de/internet/")({
  component: InternetVergelijken,
});
