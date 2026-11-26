import { createFileRoute } from "@tanstack/react-router";
import VerhuizenVanNaar from "@/pages/VerhuizenVanNaar";

export const Route = createFileRoute("/de/verhuizen/$from/$to/")({
  component: VerhuizenVanNaar,
});
