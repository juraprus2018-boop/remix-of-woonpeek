import { createFileRoute } from "@tanstack/react-router";
import WoonQuiz from "@/pages/WoonQuiz";

export const Route = createFileRoute("/fr/woonkompas/")({
  component: WoonQuiz,
});
