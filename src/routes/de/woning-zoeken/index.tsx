import { createFileRoute } from "@tanstack/react-router";
import Search from "@/pages/Search";

export const Route = createFileRoute("/de/woning-zoeken/")({
  component: Search,
});
