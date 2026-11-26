import { createFileRoute } from "@tanstack/react-router";
import UserChat from "@/pages/UserChat";

export const Route = createFileRoute("/en/chat/")({
  component: UserChat,
});
