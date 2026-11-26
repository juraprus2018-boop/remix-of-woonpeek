import { createFileRoute } from "@tanstack/react-router";
import PressRelease from "@/pages/PressRelease";

export const Route = createFileRoute("/fr/pers/$slug/")({
  component: PressRelease,
});
