import { createFileRoute } from "@tanstack/react-router";
import PostcodePage from "@/pages/PostcodePage";

export const Route = createFileRoute("/fr/postcode/$postcode/")({
  component: PostcodePage,
});
