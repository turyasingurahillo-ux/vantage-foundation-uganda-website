import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("server-only", () => ({}));

import { ReplyComposer } from "@/components/admin/ReplyComposer";

const PROPS = {
  messageId: 27,
  recipientName: "Jane Doe",
  recipientEmail: "jane@example.com",
  fromAddress: "noreply@vantage.org",
  csrfToken: "csrf-token",
  csrfFieldName: "csrf_token",
  maxLength: 5000,
} as const;

function getForm() {
  return screen.getByRole("textbox", { name: /Reply to Jane Doe/ }).closest("form")!;
}

function getTextarea() {
  return screen.getByRole("textbox", { name: /Reply to Jane Doe/ }) as HTMLTextAreaElement;
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /Send reply|Sending/ });
}

describe("ReplyComposer — body submission", () => {
  it("includes the typed body in the form data", () => {
    render(<ReplyComposer {...PROPS} />);
    const textarea = getTextarea();
    fireEvent.change(textarea, { target: { value: "Thanks for your message." } });

    const form = getForm();
    const data = new FormData(form);
    expect(data.get("body")).toBe("Thanks for your message.");
    expect(data.get("id")).toBe("27");
    expect(data.get("csrf_token")).toBe("csrf-token");
  });

  it("does not disable the textarea while a reply is in flight (regression)", () => {
    // The production bug: `disabled` controls are omitted from FormData, so
    // the submitted body became null. The textarea must stay in the form
    // (readOnly, not disabled) while pending so the body is still submitted.
    render(<ReplyComposer {...PROPS} />);
    const textarea = getTextarea();
    const form = getForm();

    fireEvent.change(textarea, { target: { value: "Hello there." } });

    // Stop the form from navigating jsdom while still letting React's
    // onSubmit run and flip `pending` to true.
    const preventNavigation = (e: Event) => e.preventDefault();
    form.addEventListener("submit", preventNavigation);

    fireEvent.submit(form);

    // After submit, pending is true → the textarea must be readOnly, NOT
    // disabled, so the body remains part of the submitted form.
    expect(textarea).toHaveAttribute("readonly");
    expect(textarea).not.toBeDisabled();
    expect(textarea).toHaveAttribute("aria-disabled", "true");

    // The body is still present in the form data the browser would serialise.
    const data = new FormData(form);
    expect(data.get("body")).toBe("Hello there.");

    form.removeEventListener("submit", preventNavigation);
  });

  it("shows the Sending… state while pending", () => {
    render(<ReplyComposer {...PROPS} />);
    const textarea = getTextarea();
    const form = getForm();

    fireEvent.change(textarea, { target: { value: "Hello there." } });
    const preventNavigation = (e: Event) => e.preventDefault();
    form.addEventListener("submit", preventNavigation);

    fireEvent.submit(form);

    expect(getSubmitButton()).toHaveTextContent("Sending…");

    form.removeEventListener("submit", preventNavigation);
  });

  it("prevents double submission via the send button", () => {
    render(<ReplyComposer {...PROPS} />);
    const textarea = getTextarea();
    const form = getForm();

    fireEvent.change(textarea, { target: { value: "Hello there." } });
    const preventNavigation = (e: Event) => e.preventDefault();
    form.addEventListener("submit", preventNavigation);

    fireEvent.submit(form);

    // Once pending, the submit button is disabled and cannot be clicked again.
    const button = getSubmitButton();
    expect(button).toBeDisabled();

    form.removeEventListener("submit", preventNavigation);
  });

  it("blocks submission of an empty body", () => {
    render(<ReplyComposer {...PROPS} />);
    const button = getSubmitButton();
    // No text entered → button stays disabled.
    expect(button).toBeDisabled();
  });

  it("blocks submission of a whitespace-only body", () => {
    render(<ReplyComposer {...PROPS} />);
    const textarea = getTextarea();
    fireEvent.change(textarea, { target: { value: "   \n  " } });
    expect(getSubmitButton()).toBeDisabled();
  });

  it("carries a one-shot idempotency key that is stable for the mount", () => {
    render(<ReplyComposer {...PROPS} />);
    const form = getForm();
    const first = new FormData(form).get("idempotencyKey");
    expect(first).toBeTruthy();
    expect(String(first).length).toBeGreaterThanOrEqual(8);

    // Re-rendering the same instance keeps the same key (useState initialiser
    // runs once per mount). A second render call creates a new instance, so we
    // instead check the key does not change across a value update.
    fireEvent.change(getTextarea(), { target: { value: "Hello." } });
    const second = new FormData(form).get("idempotencyKey");
    expect(second).toBe(first);
  });
});
