import { createFileRoute } from "@tanstack/react-router";
import ContractCheck from "@/pages/ContractCheck";

export const Route = createFileRoute("/de/contract-check/")({
  component: ContractCheck,
});
