import { createFileRoute } from "@tanstack/react-router";
import StudentenCity from "@/pages/StudentenCity";

export const Route = createFileRoute("/fr/studenten/$city/")({
  component: StudentenCity,
});
