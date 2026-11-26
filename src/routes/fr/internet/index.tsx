import { createFileRoute } from "@tanstack/react-router";
import InternetVergelijken from "@/pages/InternetVergelijken";

export const Route = createFileRoute("/fr/internet/")({
  component: InternetVergelijken,
});
