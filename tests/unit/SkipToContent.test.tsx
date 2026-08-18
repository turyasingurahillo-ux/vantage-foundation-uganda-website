import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkipToContent } from "@/components/shared/SkipToContent";

describe("SkipToContent", () => {
  it("focuses the <main id='main'> element when activated", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SkipToContent />
        <main id="main" tabIndex={-1}>
          Content
        </main>
      </>,
    );
    const skip = screen.getByRole("link", { name: /skip to .*content/i });
    await user.click(skip);
    const main = document.getElementById("main");
    expect(main).toHaveFocus();
  });
});
