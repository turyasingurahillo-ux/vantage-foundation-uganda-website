import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("server-only", () => ({}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { MessageStatusBadge } from "@/components/admin/hq/MessageStatusBadge";
import type { ContactMessageStatus } from "@/lib/db/contact";

describe("MessageStatusBadge", () => {
  it("renders the status label text", () => {
    render(<MessageStatusBadge status="new" />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders awaiting_response status", () => {
    render(<MessageStatusBadge status="awaiting_response" />);
    expect(screen.getByText("Awaiting response")).toBeInTheDocument();
  });

  it("renders replied status", () => {
    render(<MessageStatusBadge status="replied" />);
    expect(screen.getByText("Replied")).toBeInTheDocument();
  });

  it("renders archived status", () => {
    render(<MessageStatusBadge status="archived" />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("status is not communicated by colour alone — text label is always present", () => {
    const statuses: ContactMessageStatus[] = [
      "new",
      "awaiting_response",
      "replied",
      "archived",
    ];
    for (const status of statuses) {
      const { container } = render(<MessageStatusBadge status={status} />);
      const badge = container.querySelector("span");
      expect(badge?.textContent).toBeTruthy();
      expect(badge?.textContent?.length).toBeGreaterThan(0);
    }
  });
});
