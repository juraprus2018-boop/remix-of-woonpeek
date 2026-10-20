import { describe, expect, it } from "vitest";
import { amsterdamDay, isVideoPublished } from "../../supabase/functions/post-to-facebook/videoState";

describe("Facebook daily publication", () => {
  it("does not count the accepted but uploading video as published", () => {
    expect(isVideoPublished({ published: true, status: { video_status: "uploading", publishing_phase: { status: "not_started" } } })).toBe(false);
  });
  it("requires ready video and completed publication", () => {
    expect(isVideoPublished({ published: true, status: { video_status: "ready", publishing_phase: { status: "complete" } } })).toBe(true);
    expect(isVideoPublished({ published: false, status: { video_status: "ready", publishing_phase: { status: "complete" } } })).toBe(false);
  });
  it("uses the Netherlands calendar day for one video per day", () => {
    expect(amsterdamDay(new Date("2026-10-20T22:30:00Z"))).toBe("2026-10-21");
  });
});