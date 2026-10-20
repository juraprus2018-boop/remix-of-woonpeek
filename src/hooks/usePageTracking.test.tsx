import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn().mockResolvedValue({ error: null }),
  trackPageView: vi.fn(),
}));
vi.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/woning-zoeken", search: "" }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
vi.mock("@/lib/analytics", () => ({ trackPageView: mocks.trackPageView }));

import { trackDaisyconClick, usePageTracking } from "./usePageTracking";

describe("retired database visitor tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mocks.from.mockReturnValue({ insert: mocks.insert });
  });

  it("does not write pageviews to the database when a page opens", () => {
    renderHook(() => usePageTracking());
    expect(mocks.trackPageView).toHaveBeenCalledWith("/woning-zoeken");
    expect(mocks.from).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("wp_session_id")).toBeNull();
  });

  it("keeps affiliate click attribution with a session created on click", async () => {
    await trackDaisyconClick("property-id", "https://example.com/listing", "partner");
    expect(mocks.from).toHaveBeenCalledWith("daisycon_clicks");
    const sessionId = sessionStorage.getItem("wp_session_id");
    expect(sessionId).toBeTruthy();
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ property_id: "property-id", session_id: sessionId }));
  });
});