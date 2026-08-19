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
import type { ContactMessageRow } from "@/lib/db/contact";

function makeMessage(
  overrides: Partial<ContactMessageRow> = {},
): ContactMessageRow {
  return {
    id: 42,
    createdAt: new Date("2026-08-19T10:39:00Z"),
    name: "Jane Doe",
    email: "jane@example.com",
    phone: undefined,
    organisation: undefined,
    category: "general",
    message: "I would like to know more about your programmes.",
    emailSent: true,
    status: "new",
    ...overrides,
  };
}

describe("MessageListItem", () => {
  it("renders sender name", () => {
    render(
      <MessageListItem
        message={makeMessage()}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders a message preview", () => {
    render(
      <MessageListItem
        message={makeMessage()}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(
      screen.getByText(/I would like to know more/),
    ).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(
      <MessageListItem
        message={makeMessage({ status: "awaiting_response" })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText("Awaiting response")).toBeInTheDocument();
  });

  it("shows notification warning when emailSent is false", () => {
    render(
      <MessageListItem
        message={makeMessage({ emailSent: false })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText("Notification not sent")).toBeInTheDocument();
  });

  it("does not show notification warning when emailSent is true", () => {
    render(
      <MessageListItem
        message={makeMessage({ emailSent: true })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.queryByText("Notification not sent")).not.toBeInTheDocument();
  });

  it("links to the conversation with open param and preserved filter", () => {
    render(
      <MessageListItem
        message={makeMessage({ id: 77 })}
        selected={false}
        preserveParams="filter=new&q=hello"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/messages?filter=new&q=hello&open=77");
  });

  it("marks selected item with aria-current", () => {
    render(
      <MessageListItem
        message={makeMessage()}
        selected={true}
        preserveParams="filter=new"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-current", "true");
  });

  it("does not mark unselected item with aria-current", () => {
    render(
      <MessageListItem
        message={makeMessage()}
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
        message={makeMessage()}
        selected={false}
        preserveParams="filter=new"
        replyCount={3}
      />,
    );
    expect(screen.getByText("3 replies")).toBeInTheDocument();
  });

  it("does not show reply count when 0", () => {
    render(
      <MessageListItem
        message={makeMessage()}
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
        message={makeMessage({ organisation: "Acme Corp" })}
        selected={false}
        preserveParams="filter=new"
      />,
    );
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });
});
