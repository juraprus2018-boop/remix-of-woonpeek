import { createFileRoute } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";

export const Route = createFileRoute("/fr/blog/$slug/")({
  component: BlogPost,
});
