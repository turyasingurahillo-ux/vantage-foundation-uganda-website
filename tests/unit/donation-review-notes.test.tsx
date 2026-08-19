import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock server-only dependencies before importing the page.
vi.mock("server-only", () => ({}));

vi.mock("@/lib/session", () => ({
  sessionCookieName: "admin_session",
  verifySessionToken: vi.fn(() => true),
}));

vi.mock("@/lib/csrf", () => ({
  CSRF_FIELD_NAME: "csrf_token",
  getCsrfTokenFromRequest: vi.fn(() => "test-csrf-token"),
}));

vi.mock("@/lib/db", () => ({
  getDonationById: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: "valid-token" })),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// next/link needs to render as an anchor in jsdom
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// next/image — minimal mock, the review page doesn't render images
vi.mock("next/image", () => ({
  default: ({ alt }: { src: string; alt: string }) => (
    <span aria-label={alt} />
  ),
}));

import { getDonationById } from "@/lib/db";
import type { DonationRow } from "@/lib/db";

function makeDonation(overrides: Partial<DonationRow> = {}): DonationRow {
  return {
    id: 42,
    createdAt: new Date("2026-08-19T10:39:00Z"),
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+256700123456",
    amount: 100000,
    currency: "UGX",
    frequency: "one-time",
    campaign: "General Fund",
    transactionReference: "TXN-2026-0819",
    message: undefined,
    status: "pending",
    adminNotes: "Existing note from before",
    verifiedAt: undefined,
    deletedAt: null,
    ...overrides,
  };
}

// We need to import the page component dynamically because it's a server
// component. In the test environment, we render it directly.
async function renderDonationReview(donation: DonationRow | null) {
  vi.mocked(getDonationById).mockResolvedValue(donation);
  const mod = await import("@/app/admin/(hq)/donations/[id]/page");
  const Page = mod.default;
  // The page is an async server component — await it like React does.
  const result = await Page({
    params: Promise.resolve({ id: "42" }),
  });
  return render(result as React.ReactElement);
}

describe("Donation review page — admin notes preservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-fills existing admin notes in the Verify form textarea", async () => {
    await renderDonationReview(makeDonation({ status: "pending" }));
    const verifyTextarea = screen.getByRole("textbox", {
      name: /admin notes/i,
    });
    expect(verifyTextarea).toHaveValue("Existing note from before");
  });

  it("pre-fills existing admin notes in the Reject form textarea", async () => {
    await renderDonationReview(makeDonation({ status: "pending" }));
    const rejectTextarea = screen.getByRole("textbox", {
      name: /rejection reason/i,
    });
    expect(rejectTextarea).toHaveValue("Existing note from before");
  });

  it("uses empty string defaultValue when no admin notes exist", async () => {
    await renderDonationReview(
      makeDonation({ status: "pending", adminNotes: undefined }),
    );
    const verifyTextarea = screen.getByRole("textbox", {
      name: /admin notes/i,
    });
    expect(verifyTextarea).toHaveValue("");
  });

  it("pre-fills existing notes in the verified→rejected correction form", async () => {
    await renderDonationReview(
      makeDonation({ status: "verified", adminNotes: "Verified on Aug 19" }),
    );
    // The correction form is inside a <details> — expand it
    const summary = screen.getByText("Need to correct this?");
    summary.click();
    const correctTextarea = screen.getByRole("textbox", {
      name: /reason for correction/i,
    });
    expect(correctTextarea).toHaveValue("Verified on Aug 19");
  });

  it("pre-fills existing notes in the rejected→verified correction form", async () => {
    await renderDonationReview(
      makeDonation({ status: "rejected", adminNotes: "No matching txn" }),
    );
    const summary = screen.getByText("Need to correct this?");
    summary.click();
    const correctTextarea = screen.getByRole("textbox", {
      name: /reason for correction/i,
    });
    expect(correctTextarea).toHaveValue("No matching txn");
  });
});
