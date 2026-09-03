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

import { MessageListItem } from "@/components/admin/hq/MessageListItem";
import type { ContactMessageSummary } from "@/lib/db/contact";

function makeSummary(
  overrides: Partial<ContactMessageSummary> = {},
): ContactMessageSummary {
  return {
    id: 42,
    createdAt: new Date("2026-08-19T10:39:00Z"),
    name: "Jane Doe",
    email: "jane@example.com",
    phone: undefined,
    organisation: undefined,
    category: "general",
    messagePreview: "I would like to know more about your programmes.",
    emailSent: true,
    status: "new",
    ...overrides,
  };
}

describe("MessageListItem", () => {
  it("renders sender name", () => {
    render(
      <MessageListItem
        message={makeSummary()}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders the bounded message preview, not the full body", () => {
    render(
      <MessageListItem
        message={makeSummary({
          messagePreview: "Short preview text",
        })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText("Short preview text")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(
      <MessageListItem
        message={makeSummary({ status: "awaiting_response" })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText("Awaiting response")).toBeInTheDocument();
  });

  it("shows notification warning when emailSent is false", () => {
    render(
      <MessageListItem
        message={makeSummary({ emailSent: false })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText("Notification not sent")).toBeInTheDocument();
  });

  it("does not show notification warning when emailSent is true", () => {
    render(
      <MessageListItem
        message={makeSummary({ emailSent: true })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.queryByText("Notification not sent")).not.toBeInTheDocument();
  });

  it("links to the conversation with open param and preserved filter", () => {
    render(
      <MessageListItem
        message={makeSummary({ id: 77 })}
        selected={false}
        preserveParams="filter=new&q=hello"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/messages?filter=new&q=hello&open=77");
  });

  it("marks selected item with aria-current=page", () => {
    render(
      <MessageListItem
        message={makeSummary()}
        selected={true}
        preserveParams="filter=new"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("does not mark unselected item with aria-current", () => {
    render(
      <MessageListItem
        message={makeSummary()}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("shows reply count when > 0", () => {
    render(
      <MessageListItem
        message={makeSummary()}
        selected={false}
        preserveParams="filter=new"
        replyCount={3}
      />,
    );
    expect(screen.getByText("3 replies")).toBeInTheDocument();
  });

  it("shows singular 'reply' for count of 1", () => {
    render(
      <MessageListItem
        message={makeSummary()}
        selected={false}
        preserveParams="filter=new"
        replyCount={1}
      />,
    );
    expect(screen.getByText("1 reply")).toBeInTheDocument();
  });

  it("does not show reply count when 0", () => {
    render(
      <MessageListItem
        message={makeSummary()}
        selected={false}
        preserveParams="filter=new"
        replyCount={0}
      />,
    );
    expect(screen.queryByText(/repl/)).not.toBeInTheDocument();
  });

  it("shows organisation when present", () => {
    render(
      <MessageListItem
        message={makeSummary({ organisation: "Acme Corp" })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });

  it("uses native list item semantics (no role=none, no listbox)", () => {
    const { container } = render(
      <MessageListItem
        message={makeSummary()}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    const li = container.querySelector("li");
    expect(li).toBeInTheDocument();
    expect(li).not.toHaveAttribute("role");
  });
});
