import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DonationCard } from "@/components/admin/hq/DonationCard";
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
    adminNotes: undefined,
    verifiedAt: undefined,
    deletedAt: null,
    ...overrides,
  };
}

describe("DonationCard", () => {
  it("renders donor name and email", () => {
    render(<DonationCard donation={makeDonation()} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("formats amount as UGX with thousands separators, not double-prefixed", () => {
    render(<DonationCard donation={makeDonation()} />);
    const amount = screen.getByText("UGX 100,000");
    expect(amount).toBeInTheDocument();
    expect(screen.queryByText("UGX UGX 100,000")).not.toBeInTheDocument();
  });

  it("renders campaign and reference", () => {
    render(<DonationCard donation={makeDonation()} />);
    expect(screen.getByText("General Fund")).toBeInTheDocument();
    expect(screen.getByText(/TXN-2026-0819/)).toBeInTheDocument();
  });

  it("renders status badge with text label", () => {
    render(<DonationCard donation={makeDonation({ status: "pending" })} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("links to the donation review page", () => {
    render(<DonationCard donation={makeDonation()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/donations/42");
  });

  it("renders a Review action", () => {
    render(<DonationCard donation={makeDonation()} />);
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("handles missing transaction reference gracefully", () => {
    render(
      <DonationCard
        donation={makeDonation({ transactionReference: undefined })}
      />,
    );
    expect(screen.queryByText(/Ref:/)).not.toBeInTheDocument();
  });

  it("handles different currencies correctly", () => {
    render(
      <DonationCard
        donation={makeDonation({ amount: 50.5, currency: "USD" })}
      />,
    );
    expect(screen.getByText("USD 51")).toBeInTheDocument();
  });
});
