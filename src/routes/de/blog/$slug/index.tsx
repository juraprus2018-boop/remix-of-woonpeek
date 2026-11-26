import { createFileRoute } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";

export const Route = createFileRoute("/de/blog/$slug/")({
  component: BlogPost,
});
