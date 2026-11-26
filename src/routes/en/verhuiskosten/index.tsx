import { createFileRoute } from "@tanstack/react-router";
import Verhuiskosten from "@/pages/Verhuiskosten";

export const Route = createFileRoute("/en/verhuiskosten/")({
  component: Verhuiskosten,
});
