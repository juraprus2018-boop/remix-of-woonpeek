import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AutoTranslator from "./AutoTranslator";

it("does not send AI requests when a foreign-language page renders", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  window.history.replaceState({}, "", "/en/zoeken");
  render(<AutoTranslator />);
  expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
});