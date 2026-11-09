import { describe, expect, it } from "vitest";
import { refreshSeenListings, updateExistingListings } from "../../supabase/functions/daisycon-import/syncExisting";

describe("large Daisycon feeds", () => {
  it("refreshes the entire feed including its tail even when enrichment has no time left", async () => {
    const ids = Array.from({ length: 1051 }, (_, i) => `listing-${i}`);
    const seen: string[] = [];
    const batches: number[] = [];
    await refreshSeenListings(ids, async batch => { seen.push(...batch); batches.push(batch.length); });
    const result = await updateExistingListings(ids, () => false, async () => true);
    expect(seen).toEqual(ids);
    expect(seen.at(-1)).toBe("listing-1050");
    expect(batches).toEqual([200, 200, 200, 200, 200, 51]);
    expect(result).toEqual({ updated: 0, skipped: 1051, processed: 0 });
  });

  it("bounds parallel writes to ten and counts failed writes as skipped", async () => {
    let active = 0;
    let peak = 0;
    const result = await updateExistingListings(Array.from({ length: 25 }, (_, i) => i), () => true, async row => {
      active++;
      peak = Math.max(peak, active);
      await Promise.resolve();
      active--;
      return row !== 24;
    });
    expect(peak).toBe(10);
    expect(result).toEqual({ updated: 24, skipped: 1, processed: 25 });
  });

  it("stops and reports a failed presence refresh rather than silently continuing", async () => {
    await expect(refreshSeenListings(["tail"], async () => { throw new Error("write failed"); })).rejects.toThrow("write failed");
  });
});