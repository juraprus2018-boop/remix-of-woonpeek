import { createFileRoute } from "@tanstack/react-router";
import ClaimKantoor from "@/pages/ClaimKantoor";

export const Route = createFileRoute("/de/makelaars/claim/")({
  component: ClaimKantoor,
});
