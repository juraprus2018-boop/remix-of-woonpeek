import { createFileRoute } from "@tanstack/react-router";
import PostcodePage from "@/pages/PostcodePage";

export const Route = createFileRoute("/postcode/$postcode/")({
  component: PostcodePage,
});
