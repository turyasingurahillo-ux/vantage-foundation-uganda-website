import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminShell } from "@/components/admin/AdminShell";

describe("AdminShell keyboard and focus behaviour", () => {
  it("does not auto-focus the hamburger on initial mount", () => {
    render(
      <AdminShell csrfToken="token" actorName="Admin User">
        <div data-testid="page">Page content</div>
      </AdminShell>,
    );
    const trigger = screen.getByRole("button", { name: /open/i });
    expect(trigger).not.toHaveFocus();
    expect(document.activeElement).toBe(document.body);
  });

  it("Tab first moves focus to the skip link", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell csrfToken="token" actorName="Admin User">
        <div data-testid="page">Page content</div>
      </AdminShell>,
    );
    await user.tab();
    const skip = screen.getByRole("link", { name: /skip to .*content/i });
    expect(skip).toHaveFocus();
  });

  it("opens mobile drawer and focuses the close button", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell csrfToken="token" actorName="Admin User">
        <div data-testid="page">Page content</div>
      </AdminShell>,
    );
    const trigger = screen.getByRole("button", { name: /open/i });
    await user.click(trigger);
    const close = await screen.findByRole("button", { name: /close/i });
    await waitFor(() => expect(close).toHaveFocus());
  });

  it("Escape closes mobile drawer and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell csrfToken="token" actorName="Admin User">
        <div data-testid="page">Page content</div>
      </AdminShell>,
    );
    const trigger = screen.getByRole("button", { name: /open/i });
    await user.click(trigger);
    const close = await screen.findByRole("button", { name: /close/i });
    await waitFor(() => expect(close).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
