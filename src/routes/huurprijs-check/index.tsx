import { createFileRoute } from "@tanstack/react-router";
import HuurprijsCheck from "@/pages/HuurprijsCheck";

export const Route = createFileRoute("/huurprijs-check/")({
  component: HuurprijsCheck,
});
