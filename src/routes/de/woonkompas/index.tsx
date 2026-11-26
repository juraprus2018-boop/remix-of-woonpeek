import { createFileRoute } from "@tanstack/react-router";
import WoonQuiz from "@/pages/WoonQuiz";

export const Route = createFileRoute("/de/woonkompas/")({
  component: WoonQuiz,
});
