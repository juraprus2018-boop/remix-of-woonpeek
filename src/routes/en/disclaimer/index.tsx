import { createFileRoute } from "@tanstack/react-router";
import Disclaimer from "@/pages/Disclaimer";

export const Route = createFileRoute("/en/disclaimer/")({
  component: Disclaimer,
});
