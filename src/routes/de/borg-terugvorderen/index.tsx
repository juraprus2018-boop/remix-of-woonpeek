import { createFileRoute } from "@tanstack/react-router";
import BorgTerugvorderen from "@/pages/BorgTerugvorderen";

export const Route = createFileRoute("/de/borg-terugvorderen/")({
  component: BorgTerugvorderen,
});
