import { createFileRoute } from "@tanstack/react-router";
import ContractCheck from "@/pages/ContractCheck";

export const Route = createFileRoute("/en/contract-check/")({
  component: ContractCheck,
});
