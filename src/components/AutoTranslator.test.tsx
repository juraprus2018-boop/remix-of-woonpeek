import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";
import AutoTranslator from "./AutoTranslator";

it("does not send AI requests when a foreign-language page renders", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  window.history.replaceState({}, "", "/en/zoeken");
  renderToString(createElement(AutoTranslator));
  expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
});