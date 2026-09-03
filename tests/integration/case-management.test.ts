/**
 * Database integration tests for case-management SQL correctness.
 *
 * These tests exercise the actual SQL queries from the application code
 * against a real PostgreSQL database to catch bugs that TypeScript tests
 * cannot detect:
 *   - Invalid SQL quoting (identifier vs string literal)
 *   - SQL functions bound as data ("now()" string)
 *   - Invalid enum values
 *   - Timestamp casting issues
 *   - Closed_at clearing on reopen
 *   - Neon nested fragment issues
 *
 * Requirements:
 *   - PostgreSQL running locally (default: localhost:5432)
 *   - INTEGRATION_TEST=1 environment variable
 *   - INTEGRATION_DATABASE_URL pointing to a migrated test database
 *   - Test database must have schema.sql + both migrations applied
 *
 * Run with:
 *   INTEGRATION_TEST=1 npx vitest run tests/integration/
 */

import { it, expect, beforeEach, afterAll, vi } from "vitest";

// vi.mock is hoisted to the top of the file by Vitest, so it runs before
// the application modules are imported. The factory must be self-contained.
vi.mock("@neondatabase/serverless", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg") as typeof import("pg");
  const dbUrl =
    process.env.INTEGRATION_DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/vantage_test";
  const p = new Pool({ connectionString: dbUrl, max: 5 });

  const sqlFn = function (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Record<string, unknown>[]> {
    let text = "";
    const params: unknown[] = [];
    for (let i = 0; i < strings.length; i++) {
      text += strings[i];
      if (i < values.length) {
        const val = values[i];
        if (val && typeof val === "object" && "__unsafe_sql" in val) {
          text += (val as { __unsafe_sql: string }).__unsafe_sql;
        } else {
          params.push(val);
          text += `$${params.length}`;
        }
      }
    }
    return p.query(text, params as never).then((r) => r.rows);
  };

  (sqlFn as unknown as { unsafe: (text: string) => unknown }).unsafe = (
    text: string,
  ) => ({ __unsafe_sql: text });

  (sqlFn as unknown as { query: (text: string, params: unknown[]) => Promise<Record<string, unknown>[]> }).query = (
    text: string,
    params: unknown[],
  ) => p.query(text, params as never).then((r) => r.rows);

  return { neon: () => sqlFn };
});

import {
  describeIntegration,
  cleanCaseTables,
  insertTestCase,
  closeTestPool,
} from "./db-helper";

import {
  createManualCase,
  updateCase,
  getCaseById,
} from "@/lib/db/cases";
import {
  getCaseSlaData,
  getSlaSummary,
  getSlaByCaseType,
} from "@/lib/db/case-history";

afterAll(async () => {
  await closeTestPool();
});

describeIntegration("Manual case intake (P0: SQL quoting bug)", () => {
  beforeEach(async () => {
    await cleanCaseTables();
  });

  it("WhatsApp intake creates a case in triage with correct fields", async () => {
    const caseId = await createManualCase({
      name: "Jane WhatsApp",
      phone: "+256700123456",
      category: "general",
      source: "whatsapp",
      caseType: "beneficiary_request",
      message: "Need help with healthcare access",
      priority: "high",
    });

    expect(caseId).toBeGreaterThan(0);

    const caseRow = await getCaseById(caseId);
    expect(caseRow).not.toBeNull();
    expect(caseRow!.workflowStatus).toBe("triage");
    expect(caseRow!.source).toBe("whatsapp");
    expect(caseRow!.caseType).toBe("beneficiary_request");
    expect(caseRow!.priority).toBe("high");
    expect(caseRow!.name).toBe("Jane WhatsApp");
    expect(caseRow!.phone).toBe("+256700123456");
    expect(caseRow!.receivedAt).toBeDefined();
  });

  it("phone/walk-in intake without email succeeds", async () => {
    const caseId = await createManualCase({
      name: "John Walk-in",
      phone: "+256788999000",
      category: "general",
      source: "walk_in",
      caseType: "organisation_assistance",
      message: "Walk-in enquiry about programmes",
    });

    expect(caseId).toBeGreaterThan(0);

    const caseRow = await getCaseById(caseId);
    expect(caseRow).not.toBeNull();
    expect(caseRow!.workflowStatus).toBe("triage");
    expect(caseRow!.source).toBe("walk_in");
    expect(caseRow!.email).toBe("(no email)");
  });

  it("intake with explicit receivedAt persists the timestamp", async () => {
    const receivedAt = new Date("2026-01-15T10:30:00Z");
    const caseId = await createManualCase({
      name: "Explicit Time",
      email: "explicit@example.com",
      category: "general",
      source: "phone",
      message: "Phone enquiry with known contact time",
      receivedAt,
    });

    const caseRow = await getCaseById(caseId);
    expect(caseRow).not.toBeNull();
    expect(caseRow!.receivedAt).toBeDefined();
    const diff = Math.abs(
      caseRow!.receivedAt!.getTime() - receivedAt.getTime(),
    );
    expect(diff).toBeLessThan(1000);
  });
});

describeIntegration("Terminal case transitions (P0: now() string bug)", () => {
  beforeEach(async () => {
    await cleanCaseTables();
  });

  it("active → accepted stamps closed_at", async () => {
    const caseId = await insertTestCase({
      workflow_status: "under_review",
      name: "Accept Test",
    });

    await updateCase(caseId, { workflowStatus: "accepted" });
    const updated = await getCaseById(caseId);
    expect(updated!.workflowStatus).toBe("accepted");
    expect(updated!.closedAt).not.toBeNull();
    expect(updated!.closedAt).toBeInstanceOf(Date);
  });

  it("active → completed stamps closed_at", async () => {
    const caseId = await insertTestCase({
      workflow_status: "under_review",
      name: "Complete Test",
    });

    await updateCase(caseId, { workflowStatus: "completed" });
    const updated = await getCaseById(caseId);
    expect(updated!.workflowStatus).toBe("completed");
    expect(updated!.closedAt).not.toBeNull();
  });

  it("active → archived stamps closed_at", async () => {
    const caseId = await insertTestCase({
      workflow_status: "triage",
      name: "Archive Test",
    });

    await updateCase(caseId, { workflowStatus: "archived" });
    const updated = await getCaseById(caseId);
    expect(updated!.workflowStatus).toBe("archived");
    expect(updated!.closedAt).not.toBeNull();
  });

  it("completed → under_review clears closed_at", async () => {
    const caseId = await insertTestCase({
      workflow_status: "completed",
      name: "Reopen Test",
    });

    // First set closed_at explicitly using the mocked neon client
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon("mock");
    await sql`UPDATE contact_messages SET closed_at = CURRENT_TIMESTAMP WHERE id = ${caseId}`;

    let row = await getCaseById(caseId);
    expect(row!.closedAt).not.toBeNull();

    // Now reopen
    await updateCase(caseId, { workflowStatus: "under_review" });
    row = await getCaseById(caseId);
    expect(row!.workflowStatus).toBe("under_review");
    // closedAt should be cleared (null in DB → undefined in mapper)
    expect(row!.closedAt).toBeFalsy();
  });
});

describeIntegration("SLA queries (Neon fragment + received_at)", () => {
  beforeEach(async () => {
    await cleanCaseTables();
  });

  it("getSlaSummary with 30d period does not throw", async () => {
    await insertTestCase({
      workflow_status: "completed",
      first_response_at: new Date(),
      received_at: new Date(),
    });
    const summary = await getSlaSummary("30d");
    expect(summary.sampleSize).toBeGreaterThan(0);
    expect(summary.respondedCount).toBeGreaterThan(0);
    expect(summary.periodLabel).toBe("Last 30 days");
    expect(summary.sourceBreakdown).toBeDefined();
    expect(summary.sourceBreakdown.length).toBeGreaterThan(0);
  });

  it("getSlaSummary with 90d period does not throw", async () => {
    await insertTestCase({ workflow_status: "new" });
    const summary = await getSlaSummary("90d");
    expect(summary.periodLabel).toBe("Last 90 days");
  });

  it("getSlaSummary with all-time period does not throw", async () => {
    await insertTestCase({ workflow_status: "new" });
    const summary = await getSlaSummary("all");
    expect(summary.periodLabel).toBe("All time");
  });

  it("getSlaByCaseType does not throw and returns rows", async () => {
    await insertTestCase({
      workflow_status: "completed",
      case_type: "partnership",
      first_response_at: new Date(),
      received_at: new Date(),
    });
    const rows = await getSlaByCaseType("all");
    expect(rows.length).toBeGreaterThan(0);
    const partnership = rows.find((r) => r.caseType === "partnership");
    expect(partnership).toBeDefined();
    expect(partnership!.caseCount).toBeGreaterThan(0);
  });
});

describeIntegration("Case SLA data and waiting party (exhaustive)", () => {
  beforeEach(async () => {
    await cleanCaseTables();
  });

  it("getCaseSlaData uses received_at when available", async () => {
    const receivedAt = new Date("2026-01-01T08:00:00Z");
    const firstResponseAt = new Date("2026-01-01T10:00:00Z");
    const caseId = await insertTestCase({
      received_at: receivedAt,
      first_response_at: firstResponseAt,
      workflow_status: "completed",
    });

    const sla = await getCaseSlaData(caseId);
    expect(sla).not.toBeNull();
    // Response time should be 2 hours = 7200000 ms
    expect(sla!.responseTimeMs).toBe(2 * 60 * 60 * 1000);
  });

  // Exhaustive waiting-party tests for every workflow status
  const vantageStatuses = [
    "new",
    "triage",
    "under_review",
    "due_diligence",
    "meeting_scheduled",
    "awaiting_vantage",
    "decision_required",
  ];
  for (const status of vantageStatuses) {
    it(`waiting party is 'vantage' for ${status}`, async () => {
      const caseId = await insertTestCase({ workflow_status: status });
      const sla = await getCaseSlaData(caseId);
      expect(sla!.currentWaitingParty).toBe("vantage");
    });
  }

  it("waiting party is 'external' for awaiting_external", async () => {
    const caseId = await insertTestCase({
      workflow_status: "awaiting_external",
    });
    const sla = await getCaseSlaData(caseId);
    expect(sla!.currentWaitingParty).toBe("external");
  });

  const nullStatuses = ["accepted", "completed", "archived", "declined", "referred"];
  for (const status of nullStatuses) {
    it(`waiting party is null for ${status}`, async () => {
      const caseId = await insertTestCase({ workflow_status: status });
      const sla = await getCaseSlaData(caseId);
      expect(sla!.currentWaitingParty).toBeNull();
    });
  }
});

describeIntegration("Full core workflow sequence", () => {
  beforeEach(async () => {
    await cleanCaseTables();
  });

  it("manual intake → triage → assign → review → respond → external → vantage → decision → complete", async () => {
    // 1. Manually log WhatsApp enquiry
    const caseId = await createManualCase({
      name: "Workflow Test",
      phone: "+256700111222",
      category: "general",
      source: "whatsapp",
      caseType: "beneficiary_request",
      message: "Full workflow test enquiry",
      receivedAt: new Date("2026-02-01T09:00:00Z"),
    });

    // 2. Case is created in triage
    let row = await getCaseById(caseId);
    expect(row!.workflowStatus).toBe("triage");
    expect(row!.receivedAt).toBeDefined();

    // 3. Assign owner
    await updateCase(caseId, { ownerId: "admin-1" });
    row = await getCaseById(caseId);
    expect(row!.ownerId).toBe("admin-1");

    // 4. Move to under review
    await updateCase(caseId, { workflowStatus: "under_review" });
    row = await getCaseById(caseId);
    expect(row!.workflowStatus).toBe("under_review");
    expect(row!.closedAt).toBeFalsy();

    // 5. (Send/log response — first_response_at would be set by reply system)
    // 6. Move to awaiting external
    await updateCase(caseId, { workflowStatus: "awaiting_external" });
    row = await getCaseById(caseId);
    expect(row!.workflowStatus).toBe("awaiting_external");
    expect(row!.closedAt).toBeFalsy();

    // 7. (Receive/log external reply)
    // 8. Move to awaiting Vantage
    await updateCase(caseId, { workflowStatus: "awaiting_vantage" });
    row = await getCaseById(caseId);
    expect(row!.workflowStatus).toBe("awaiting_vantage");
    expect(row!.closedAt).toBeFalsy();

    // 9. Record decision (move to decision_required)
    await updateCase(caseId, { workflowStatus: "decision_required" });
    row = await getCaseById(caseId);
    expect(row!.workflowStatus).toBe("decision_required");

    // 10. Complete case
    await updateCase(caseId, {
      workflowStatus: "completed",
      outcome: "accepted",
    });
    row = await getCaseById(caseId);

    // 11. closed_at is stamped correctly
    expect(row!.workflowStatus).toBe("completed");
    expect(row!.outcome).toBe("accepted");
    expect(row!.closedAt).not.toBeNull();
    expect(row!.closedAt).toBeInstanceOf(Date);

    // 12. SLA uses received_at (verify via getCaseSlaData)
    const sla = await getCaseSlaData(caseId);
    expect(sla!.receivedAt).toBeDefined();
    // receivedAt should be the original 2026-02-01 timestamp
    expect(sla!.receivedAt!.getFullYear()).toBe(2026);
  });

  it("completed case → reopened → closed_at cleared", async () => {
    const caseId = await createManualCase({
      name: "Reopen Test",
      email: "reopen@example.com",
      category: "general",
      source: "website_form",
      message: "Test reopen",
    });

    // Complete the case
    await updateCase(caseId, { workflowStatus: "completed" });
    let row = await getCaseById(caseId);
    expect(row!.closedAt).not.toBeNull();

    // Reopen
    await updateCase(caseId, { workflowStatus: "under_review" });
    row = await getCaseById(caseId);
    expect(row!.workflowStatus).toBe("under_review");
    expect(row!.closedAt).toBeFalsy();
  });
});
