import { createFileRoute } from "@tanstack/react-router";
import BorgTerugvorderen from "@/pages/BorgTerugvorderen";

export const Route = createFileRoute("/en/borg-terugvorderen/")({
  component: BorgTerugvorderen,
});
