import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { AttentionCard } from "@/components/admin/hq/AttentionCard";
import { StatusBadge } from "@/components/admin/hq/StatusBadge";
import { EmptyState } from "@/components/admin/hq/EmptyState";
import { StatusTabs, type StatusTab } from "@/components/admin/hq/StatusTabs";
import { Alert } from "@/components/admin/hq/Alert";
import { QuickAction } from "@/components/admin/hq/QuickAction";
import { Wallet } from "lucide-react";

describe("PageHeader", () => {
  it("renders title as h1", () => {
    render(<PageHeader title="Dashboard" />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Dashboard" });
    expect(h1).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Dashboard" description="Overview" />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <PageHeader title="Dashboard" actions={<button>Action</button>} />,
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});

describe("AttentionCard", () => {
  it("shows count and links to the workflow", () => {
    render(
      <AttentionCard
        href="/admin/donations?status=pending"
        label="Pending donations"
        description="Awaiting verification"
        count={5}
        urgent
        countLabel="5 pending"
      />,
    );
    const link = screen.getByRole("link", { name: /pending donations/i });
    expect(link).toHaveAttribute("href", "/admin/donations?status=pending");
    expect(screen.getByText("5 pending")).toBeInTheDocument();
  });

  it("shows resolved state when count is zero", () => {
    render(
      <AttentionCard
        href="/admin/donations"
        label="Pending donations"
        description="Awaiting verification"
        count={0}
        countLabel="0 pending"
      />,
    );
    expect(screen.getByText("All caught up")).toBeInTheDocument();
  });

  it("shows unavailable state when source is unavailable", () => {
    render(
      <AttentionCard
        href="/admin/donations"
        label="Pending donations"
        description="Awaiting verification"
        count={0}
        unavailable
      />,
    );
    expect(screen.getByText("Data unavailable")).toBeInTheDocument();
  });
});

describe("StatusBadge", () => {
  it("renders pending status with text label", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders verified status with text label", () => {
    render(<StatusBadge status="verified" />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders rejected status with text label", () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No donations waiting"
        description="New submissions will appear here."
      />,
    );
    expect(screen.getByText("No donations waiting")).toBeInTheDocument();
    expect(
      screen.getByText("New submissions will appear here."),
    ).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Go somewhere</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Go somewhere" }),
    ).toBeInTheDocument();
  });
});

describe("StatusTabs", () => {
  const tabs: StatusTab[] = [
    { label: "Pending", params: "status=pending", active: true, count: 3 },
    { label: "Verified", params: "status=verified", active: false, count: 12 },
    { label: "All", params: "status=all", active: false, count: 15 },
  ];

  it("renders all tabs as links", () => {
    render(<StatusTabs tabs={tabs} basePath="/admin/donations" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/admin/donations?status=pending");
    expect(links[1]).toHaveAttribute("href", "/admin/donations?status=verified");
    expect(links[2]).toHaveAttribute("href", "/admin/donations?status=all");
  });

  it("marks the active tab with aria-current", () => {
    render(<StatusTabs tabs={tabs} basePath="/admin/donations" />);
    const activeTab = screen.getByRole("link", { name: /pending/i });
    expect(activeTab).toHaveAttribute("aria-current", "page");
  });

  it("renders counts for each tab", () => {
    render(<StatusTabs tabs={tabs} basePath="/admin/donations" />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("supports keyboard navigation via Tab", async () => {
    const user = userEvent.setup();
    render(<StatusTabs tabs={tabs} basePath="/admin/donations" />);
    const links = screen.getAllByRole("link");
    await user.tab();
    // First focusable should be the first tab (or the nav itself)
    expect(links[0]).toHaveFocus();
  });
});

describe("Alert", () => {
  it("uses role=status for success", () => {
    render(<Alert variant="success">Done</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for error", () => {
    render(<Alert variant="error">Failed</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("QuickAction", () => {
  it("renders as a link with label and icon", () => {
    render(
      <QuickAction
        href="/admin/donations"
        label="Review donations"
        icon={Wallet}
      />,
    );
    const link = screen.getByRole("link", { name: /review donations/i });
    expect(link).toHaveAttribute("href", "/admin/donations");
  });

  it("renders description when provided", () => {
    render(
      <QuickAction
        href="/admin/donations"
        label="Review donations"
        description="Verify pending submissions"
        icon={Wallet}
      />,
    );
    expect(
      screen.getByText("Verify pending submissions"),
    ).toBeInTheDocument();
  });
});
