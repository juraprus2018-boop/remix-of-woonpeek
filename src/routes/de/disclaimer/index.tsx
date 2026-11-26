import { createFileRoute } from "@tanstack/react-router";
import Disclaimer from "@/pages/Disclaimer";

export const Route = createFileRoute("/de/disclaimer/")({
  component: Disclaimer,
});
