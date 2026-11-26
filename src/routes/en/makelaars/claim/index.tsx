import { createFileRoute } from "@tanstack/react-router";
import ClaimKantoor from "@/pages/ClaimKantoor";

export const Route = createFileRoute("/en/makelaars/claim/")({
  component: ClaimKantoor,
});
