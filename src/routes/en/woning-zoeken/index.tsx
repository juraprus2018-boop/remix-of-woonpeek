import { createFileRoute } from "@tanstack/react-router";
import Search from "@/pages/Search";

export const Route = createFileRoute("/en/woning-zoeken/")({
  component: Search,
});
