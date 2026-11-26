import { createFileRoute } from "@tanstack/react-router";
import UserChat from "@/pages/UserChat";

export const Route = createFileRoute("/fr/chat/")({
  component: UserChat,
});
