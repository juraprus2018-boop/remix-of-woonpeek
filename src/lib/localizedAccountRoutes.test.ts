import { readFileSync } from "node:fs";
import { createRootRoute, createRoute, createRouter, createMemoryHistory } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { withLocale } from "./locale";

const features = ["mijn-reacties", "mijn-verhuizing", "mijn-huurdersprofiel"] as const;
const locales = ["en", "de", "fr"] as const;

describe("localized account destinations", () => {
  for (const locale of locales) {
    for (const feature of features) {
      it(`${locale}/${feature} matches an explicit account page, not a legacy city`, () => {
        const source = readFileSync(`src/routes/${locale}/${feature}/index.tsx`, "utf8");
        const routePath = source.match(/createFileRoute\("([^"]+)"\)/)?.[1];
        if (!routePath) throw new Error("Missing account route declaration");
        const root = createRootRoute();
        const account = createRoute({ getParentRoute: () => root, path: routePath });
        const legacyCity = createRoute({ getParentRoute: () => root, path: `/${locale}/$city/` });
        const router = createRouter({
          routeTree: root.addChildren([account, legacyCity]),
          history: createMemoryHistory(),
        });
        const destination = withLocale(`/${feature}`, locale);
        const matches = router.matchRoutes(destination);
        expect(matches.at(-1)?.routeId).toBe(`/${locale}/${feature}/`);
      });
    }
  }
});