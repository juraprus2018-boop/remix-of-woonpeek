import { createFileRoute } from "@tanstack/react-router";
import WozWaardeCity from "@/pages/WozWaardeCity";

export const Route = createFileRoute("/de/woz-waarde/$city/")({
  component: WozWaardeCity,
});
