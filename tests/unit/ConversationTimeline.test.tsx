import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("server-only", () => ({}));

import { ConversationTimeline } from "@/components/admin/hq/ConversationTimeline";
import type { ContactMessageRow } from "@/lib/db/contact";
import type { ContactReplyRow } from "@/lib/db/contact-replies";

function makeMessage(
  overrides: Partial<ContactMessageRow> = {},
): ContactMessageRow {
  return {
    id: 42,
    createdAt: new Date("2026-08-19T10:39:00Z"),
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+256700123456",
    organisation: "Acme Corp",
    category: "general",
    message: "I would like to know more about your programmes.",
    emailSent: true,
    status: "new",
    ...overrides,
  };
}

function makeReply(
  overrides: Partial<ContactReplyRow> = {},
): ContactReplyRow {
  return {
    id: 1,
    messageId: 42,
    createdAt: new Date("2026-08-19T11:00:00Z"),
    direction: "outbound",
    body: "Thank you for your enquiry.",
    recipientEmail: "jane@example.com",
    adminActorId: "1",
    sendStatus: "sent",
    ...overrides,
  };
}

const commonProps = {
  fromAddress: "reply@vantagefoundation.org",
  csrfToken: "test-csrf",
  csrfFieldName: "csrf_token",
  maxLength: 5000,
};

describe("ConversationTimeline", () => {
  it("renders the original submission with sender name", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(
      screen.getByText("I would like to know more about your programmes."),
    ).toBeInTheDocument();
  });

  it("renders outbound replies with Vantage Foundation Uganda as sender", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[makeReply()]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    expect(screen.getByText("Vantage Foundation Uganda")).toBeInTheDocument();
    expect(screen.getByText("Thank you for your enquiry.")).toBeInTheDocument();
  });

  it("renders sent reply with Sent badge", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[makeReply({ sendStatus: "sent" })]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("renders failed reply with Not sent badge and error detail", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[
          makeReply({
            sendStatus: "failed",
            errorDetail: "SMTP connection refused",
          }),
        ]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    expect(screen.getByText("Not sent")).toBeInTheDocument();
    expect(
      screen.getByText(/SMTP connection refused/),
    ).toBeInTheDocument();
  });

  it("renders pending reply with Sending badge", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[makeReply({ sendStatus: "pending" })]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    expect(screen.getByText("Sending")).toBeInTheDocument();
  });

  it("resolves admin actor ID to username when available", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[makeReply({ adminActorId: "1" })]}
        adminNames={{ "1": "Hillary" }}
        {...commonProps}
      />,
    );
    expect(screen.getByText(/Sent by Hillary/)).toBeInTheDocument();
  });

  it("falls back to neutral label when actor ID is not in admin names", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[makeReply({ adminActorId: "999" })]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    expect(screen.getByText(/Sent by Vantage admin/)).toBeInTheDocument();
  });

  it("does not show actor label when adminActorId is absent", () => {
    render(
      <ConversationTimeline
        message={makeMessage()}
        replies={[makeReply({ adminActorId: undefined })]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    expect(screen.queryByText(/Sent by/)).not.toBeInTheDocument();
  });

  it("renders message body as plain text, preserving whitespace", () => {
    const message = makeMessage({
      message: "Line one\nLine two\n\nLine four after blank line",
    });
    const { container } = render(
      <ConversationTimeline
        message={message}
        replies={[]}
        adminNames={{}}
        {...commonProps}
      />,
    );
    // The whitespace-pre-wrap class ensures whitespace is preserved
    const messageEl = container.querySelector(".whitespace-pre-wrap");
    expect(messageEl).toBeInTheDocument();
    expect(messageEl?.textContent).toContain("Line one\nLine two");
  });

  it("renders replies in chronological order", () => {
    // The DB helper returns replies sorted by created_at ASC, id ASC.
    // We pass them in that order to the component.
    const replies = [
      makeReply({
        id: 1,
        body: "First reply",
        createdAt: new Date("2026-08-19T11:00:00Z"),
      }),
      makeReply({
        id: 2,
        body: "Second reply",
        createdAt: new Date("2026-08-19T12:00:00Z"),
      }),
    ];
    const { container } = render(
      <ConversationTimeline
        message={makeMessage()}
        replies={replies}
        adminNames={{}}
        {...commonProps}
      />,
    );
    const replyBodies = container.querySelectorAll(
      ".whitespace-pre-wrap",
    );
    // First whitespace-pre-wrap is the original message, then replies in order
    expect(replyBodies[1]?.textContent).toBe("First reply");
    expect(replyBodies[2]?.textContent).toBe("Second reply");
  });
});
