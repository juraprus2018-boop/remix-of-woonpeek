import { createFileRoute } from "@tanstack/react-router";
import VerhuisServiceCity from "@/pages/VerhuisServiceCity";

export const Route = createFileRoute("/verhuisservice/$city/")({
  component: VerhuisServiceCity,
});
