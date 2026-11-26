import { createFileRoute } from "@tanstack/react-router";
import PressRelease from "@/pages/PressRelease";

export const Route = createFileRoute("/pers/$slug/")({
  component: PressRelease,
});
