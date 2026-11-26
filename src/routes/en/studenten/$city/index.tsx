import { createFileRoute } from "@tanstack/react-router";
import StudentenCity from "@/pages/StudentenCity";

export const Route = createFileRoute("/en/studenten/$city/")({
  component: StudentenCity,
});
