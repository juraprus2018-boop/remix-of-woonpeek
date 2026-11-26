import { createFileRoute } from "@tanstack/react-router";
import VerhuizenVanNaar from "@/pages/VerhuizenVanNaar";

export const Route = createFileRoute("/en/verhuizen/$from/$to/")({
  component: VerhuizenVanNaar,
});
