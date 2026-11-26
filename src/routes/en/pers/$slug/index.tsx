import { createFileRoute } from "@tanstack/react-router";
import PressRelease from "@/pages/PressRelease";

export const Route = createFileRoute("/en/pers/$slug/")({
  component: PressRelease,
});
