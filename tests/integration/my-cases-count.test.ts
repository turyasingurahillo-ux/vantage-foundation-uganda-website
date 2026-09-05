// @vitest-environment node
/**
 * Regression tests for the my_cases count in getCaseCounts().
 *
 * These verify that:
 *   1. getCaseCounts(actorId) returns a my_cases count matching the number
 *      of cases owned by that actor.
 *   2. The count uses the same `owner_id = actorId` predicate as
 *      searchCaseSummaries' `my_cases` filter — the tab badge is always
 *      consistent with the result set.
 *   3. When actorId is not provided, my_cases is 0.
 *   4. Cases with a different owner are not counted.
 *   5. Soft-deleted cases are not counted.
 *
 * Uses PGlite (real PostgreSQL) so the actual SQL is exercised.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createTestDatabase,
  seedMessage,
  type TestDatabase,
} from "../helpers/pg";
import type { SqlClient } from "@/lib/db/client";

// Set a dummy DATABASE_URL so the shared getSql() in lib/db/client.ts
// does not throw when called. The PGlite override installed by
// createTestDatabase() takes precedence over the neon() fallback.
process.env.DATABASE_URL = "postgres://test";

// Import after env is set and before tests run. The module will use
// the PGlite override installed by createTestDatabase().
import { getCaseCounts, searchCaseSummaries } from "@/lib/db/cases";

describe("getCaseCounts my_cases", () => {
  let testDb: TestDatabase;
  let sql: SqlClient;

  beforeEach(async () => {
    testDb = await createTestDatabase();
    sql = testDb.sql;
  }, 30000);

  afterEach(async () => {
    await testDb.close();
  });

  it("returns my_cases = 0 when actorId is not provided", async () => {
    const counts = await getCaseCounts();
    expect(counts.my_cases).toBe(0);
  });

  it("returns my_cases = 0 when no cases are owned by the actor", async () => {
    await seedMessage(sql, { name: "Unowned" });
    const counts = await getCaseCounts("42");
    expect(counts.my_cases).toBe(0);
  });

  it("counts cases owned by the given actorId", async () => {
    await seedMessage(sql, { name: "Owned 1" });
    await seedMessage(sql, { name: "Owned 2" });
    // Set owner_id directly
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1 WHERE name IN ($2, $3)",
      ["42", "Owned 1", "Owned 2"],
    );
    // Add an unowned case
    await seedMessage(sql, { name: "Unowned" });

    const counts = await getCaseCounts("42");
    expect(counts.my_cases).toBe(2);
  });

  it("does not count cases owned by a different actor", async () => {
    await seedMessage(sql, { name: "Owned by 42" });
    await seedMessage(sql, { name: "Owned by 99" });
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1 WHERE name = $2",
      ["42", "Owned by 42"],
    );
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1 WHERE name = $2",
      ["99", "Owned by 99"],
    );

    const counts42 = await getCaseCounts("42");
    const counts99 = await getCaseCounts("99");
    expect(counts42.my_cases).toBe(1);
    expect(counts99.my_cases).toBe(1);
  });

  it("does not count soft-deleted cases", async () => {
    await seedMessage(sql, { name: "Active owned" });
    await seedMessage(sql, { name: "Deleted owned" });
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1 WHERE name IN ($2, $3)",
      ["42", "Active owned", "Deleted owned"],
    );
    await sql.query(
      "UPDATE contact_messages SET deleted_at = CURRENT_TIMESTAMP WHERE name = $1",
      ["Deleted owned"],
    );

    const counts = await getCaseCounts("42");
    expect(counts.my_cases).toBe(1);
  });

  it("my_cases count matches searchCaseSummaries result count for the same actor", async () => {
    // This is the key consistency test: the tab badge count must match
    // the actual number of results shown when the user clicks "My cases".
    await seedMessage(sql, { name: "Owned 1" });
    await seedMessage(sql, { name: "Owned 2" });
    await seedMessage(sql, { name: "Owned 3" });
    await seedMessage(sql, { name: "Unowned" });
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1 WHERE name IN ($2, $3, $4)",
      ["42", "Owned 1", "Owned 2", "Owned 3"],
    );

    const [counts, results] = await Promise.all([
      getCaseCounts("42"),
      searchCaseSummaries({ filter: "my_cases", actorId: "42" }),
    ]);

    expect(counts.my_cases).toBe(3);
    expect(results).toHaveLength(3);
    expect(counts.my_cases).toBe(results.length);
  });

  it("my_cases count is consistent across different workflow statuses", async () => {
    // Owned cases in various workflow states should all be counted
    await seedMessage(sql, { name: "New case" });
    await seedMessage(sql, { name: "Triage case" });
    await seedMessage(sql, { name: "Accepted case" });
    await seedMessage(sql, { name: "Archived case" });
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1, workflow_status = $2 WHERE name = $3",
      ["42", "new", "New case"],
    );
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1, workflow_status = $2 WHERE name = $3",
      ["42", "triage", "Triage case"],
    );
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1, workflow_status = $2 WHERE name = $3",
      ["42", "accepted", "Accepted case"],
    );
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1, workflow_status = $2 WHERE name = $3",
      ["42", "archived", "Archived case"],
    );

    const counts = await getCaseCounts("42");
    // All 4 owned cases are counted regardless of workflow status
    expect(counts.my_cases).toBe(4);
  });

  it("other counts are unaffected by the actorId parameter", async () => {
    await seedMessage(sql, { name: "Case A" });
    await seedMessage(sql, { name: "Case B" });
    await sql.query(
      "UPDATE contact_messages SET owner_id = $1 WHERE name = $2",
      ["42", "Case A"],
    );

    const withoutActor = await getCaseCounts();
    const withActor = await getCaseCounts("42");

    // All counts except my_cases should be identical
    expect(withActor.new).toBe(withoutActor.new);
    expect(withActor.active).toBe(withoutActor.active);
    expect(withActor.all).toBe(withoutActor.all);
    expect(withActor.overdue).toBe(withoutActor.overdue);
    // my_cases differs
    expect(withoutActor.my_cases).toBe(0);
    expect(withActor.my_cases).toBe(1);
  });
});
