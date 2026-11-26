import { createFileRoute } from "@tanstack/react-router";
import PostcodePage from "@/pages/PostcodePage";

export const Route = createFileRoute("/en/postcode/$postcode/")({
  component: PostcodePage,
});
