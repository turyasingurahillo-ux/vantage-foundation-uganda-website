import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

import { StatusTabs } from "@/components/admin/hq/StatusTabs";

describe("StatusTabs ariaLabel", () => {
  it("uses custom ariaLabel when provided", () => {
    render(
      <StatusTabs
        tabs={[
          { label: "New", params: "filter=new", active: true, count: 3 },
        ]}
        basePath="/admin/messages"
        ariaLabel="Message filters"
      />,
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Message filters");
  });

  it("defaults to 'Filter by status' when ariaLabel not provided", () => {
    render(
      <StatusTabs
        tabs={[
          { label: "Pending", params: "status=pending", active: true },
        ]}
        basePath="/admin/donations"
      />,
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Filter by status");
  });
});
