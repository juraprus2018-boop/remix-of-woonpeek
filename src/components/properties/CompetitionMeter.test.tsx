import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CompetitionMeter from "./CompetitionMeter";

describe("listing interest", () => {
  it("shows only the real total view count", () => {
    render(<CompetitionMeter viewsCount={62} />);
    expect(screen.getByText("62")).toBeTruthy();
    expect(screen.queryByText(/bekijken deze woning nu/i)).toBeNull();
    expect(screen.queryByText(/afgelopen 24 uur/i)).toBeNull();
    expect(screen.queryByText(/gemiddeld.*reacties/i)).toBeNull();
  });

  it("makes no interest claim when there are no registered views", () => {
    const { container } = render(<CompetitionMeter viewsCount={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
