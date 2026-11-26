import { createFileRoute } from "@tanstack/react-router";
import ClaimKantoor from "@/pages/ClaimKantoor";

export const Route = createFileRoute("/fr/makelaars/claim/")({
  component: ClaimKantoor,
});
