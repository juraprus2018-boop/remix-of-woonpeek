import { createFileRoute } from "@tanstack/react-router";
import VerhuisService from "@/pages/VerhuisService";

export const Route = createFileRoute("/fr/verhuisservice/")({
  component: VerhuisService,
});
