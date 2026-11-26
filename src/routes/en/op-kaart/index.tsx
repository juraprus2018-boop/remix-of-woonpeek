import { createFileRoute } from "@tanstack/react-router";
import Explore from "@/pages/Explore";

export const Route = createFileRoute("/en/op-kaart/")({
  component: Explore,
});
