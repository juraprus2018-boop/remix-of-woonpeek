import { describe, expect, it } from "vitest";
import { fetchAllPages, orderStable } from "./stablePagination";

const recorder = () => {
  const calls: string[] = [];
  const q = { order(c: string, o: { ascending: boolean }) { calls.push(`${c}:${o.ascending}`); return q; } };
  return { q, calls };
};

describe("orderStable", () => {
  it("voegt id als laatste sortering toe", () => {
    const { q, calls } = recorder();
    orderStable(q, [{ column: "provider_priority", ascending: true }, { column: "created_at", ascending: false }]);
    expect(calls).toEqual(["provider_priority:true", "created_at:false", "id:true"]);
  });
  it("voegt id niet dubbel toe", () => {
    const { q, calls } = recorder();
    orderStable(q, [{ column: "id", ascending: false }]);
    expect(calls).toEqual(["id:false"]);
  });
});

describe("fetchAllPages", () => {
  it("telt meer dan 1000 woningen mee in beheerstatistieken", async () => {
    const data = Array.from({ length: 2500 }, (_, i) => i);
    const rows = await fetchAllPages(async (from, to) => data.slice(from, to + 1), 1000);
    expect(rows).toHaveLength(2500);
  });
  it("stopt na precies een volle laatste pagina", async () => {
    let calls = 0;
    const data = Array.from({ length: 2000 }, (_, i) => i);
    const rows = await fetchAllPages(async (from, to) => { calls++; return data.slice(from, to + 1); }, 1000);
    expect(rows).toHaveLength(2000);
    expect(calls).toBe(3);
  });
});
