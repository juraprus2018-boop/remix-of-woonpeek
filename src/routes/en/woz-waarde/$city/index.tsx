import { createFileRoute } from "@tanstack/react-router";
import WozWaardeCity from "@/pages/WozWaardeCity";

export const Route = createFileRoute("/en/woz-waarde/$city/")({
  component: WozWaardeCity,
});
