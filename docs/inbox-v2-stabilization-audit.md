# Inbox V2 Stabilization Audit

**Date**: 2026-09-05
**Main**: `71bb6d7` (after merging PRs #67, #72, #68)
**Scope**: Read-only production verification, migration/schema safety review,
and workflow documentation for Admin Inbox V2 and case management.

---

## Summary

The Inbox V2 and case management system is architecturally sound. All
security controls are intact, the dual-state model (message delivery vs
case workflow) is correctly implemented, and the reply/retry/resolve
workflow is robust. The migration system is additive and idempotent.

**One critical data-integrity issue was found**: a constraint name collision
that leaves the `workflow_status` column without a database-level CHECK
constraint. This is fixable with a constraint rename.

---

## Findings

### F1. CRITICAL — Constraint name collision: `workflow_status` has no CHECK constraint

**Files**:
- `lib/db/schema.sql` lines 560–572
- `lib/db/migrations/case-management-pipeline.sql` lines 130–144

**Description**: Both files create a constraint named
`contact_messages_workflow_status_values`, but on different columns with
different value sets:

- `schema.sql` creates it on the `status` column:
  `CHECK (status IN ('new', 'awaiting_response', 'replied'))`
- `case-management-pipeline.sql` creates it on the `workflow_status` column:
  `CHECK (workflow_status IN ('new', 'triage', 'awaiting_vantage', ...))`

`setup-db.mjs` runs `schema.sql` first. When
`case-management-pipeline.sql` runs, its guard
`IF NOT EXISTS (... conname = 'contact_messages_workflow_status_values')`
finds the name already exists (from `schema.sql`) and skips creating the
`workflow_status` constraint.

**Impact**: The `workflow_status` column accepts any text value at the
database level. Application-layer Zod validation in
`app/api/admin/cases/update/route.ts` prevents invalid values through the
UI, but there is no defense-in-depth at the database level. Direct database
access (SQL editor, scripts) could write invalid values.

**Fix**: Rename the constraint in `schema.sql` from
`contact_messages_workflow_status_values` to
`contact_messages_status_values` (or
`contact_messages_delivery_status_values`). This frees the name for the
`case-management-pipeline.sql` constraint on `workflow_status`.

**Reversibility**: The fix is a constraint rename + add. It is additive and
safe to re-run. Existing data is not affected because the application only
writes valid values.

### F2. LOW — PGlite test helper only applies schema.sql

**File**: `tests/helpers/pg.ts` line 22

**Description**: The PGlite test helper only loads `lib/db/schema.sql`. It
does not apply `case-management-pipeline.sql` or
`organisation-relationship-pipeline.sql`.

**Impact**: Currently no tests use the PGlite helper (it is defined but not
imported by any test), so this is a latent issue. If tests are written using
this helper, they would fail on any query involving `workflow_status`,
`case_notes`, `case_actions`, etc.

**Fix**: Update `tests/helpers/pg.ts` to apply all three migration files in
the same order as `setup-db.mjs`.

### F3. LOW — `my_cases` filter count is always 0 in tab badges

**File**: `app/admin/(hq)/messages/page.tsx` line 419

**Description**: `getCountForFilter` maps `my_cases` to `0` because
`getCaseCounts()` does not take an `actorId` parameter. The `my_cases`
filter works correctly for the list (it passes `actorId` to
`searchCaseSummaries`), but the tab badge always shows 0.

**Impact**: Minor UX issue — the "My cases" tab shows a count of 0 even
when the admin has assigned cases.

**Fix**: Either compute the `my_cases` count separately with the actor id,
or suppress the count badge for `my_cases`.

### F4. INFO — Inbound email endpoint exists but AGENTS.md says "Phase 2"

**Files**: `app/api/inbound/email/route.ts`, `lib/db/inbound-email.ts`

**Description**: The AGENTS.md documentation says "Inbound replies are Phase
2" but the inbound email endpoint is already implemented. It is
authenticated via `INBOUND_EMAIL_SECRET`, has replay protection, thread
matching, and creates inbound reply rows. The `inbound_email_log` table is
created by `organisation-relationship-pipeline.sql`.

**Impact**: The endpoint fails closed (503) when `INBOUND_EMAIL_SECRET` is
not set, so it is safe in production. The AGENTS.md documentation is out of
date.

**Recommendation**: Update AGENTS.md to document the inbound email endpoint
as infrastructure-ready, or note that it requires Cloudflare Email Worker
configuration to activate.

### F5. INFO — Two flaky test timeouts on cold runs

**Files**: `tests/unit/contact-reply.test.ts`, `tests/unit/r2-client.test.ts`

**Description**: Both tests time out on dynamic `import()` during cold runs
but pass on re-run. This is a test environment issue (slow module loading on
Windows), not a code issue.

**Recommendation**: Consider increasing the test timeout for these files, or
running `vitest` with `--pool=forks` to reduce cold-start overhead.

---

## Security verification

All security controls were verified by code review:

| Control | Status |
|---|---|
| Session verification in every mutation route | ✓ |
| CSRF double-submit on all mutations | ✓ |
| Rate limiting on all mutations | ✓ |
| Audit logging on all mutations | ✓ |
| Recipient derived from stored row, not client input | ✓ |
| Idempotency scoped to `(message_id, idempotency_key)` | ✓ |
| `replied` status only set after provider-accepted send | ✓ |
| Failed replies remain visible and retryable | ✓ |
| Archived conversations stay archived when replied to | ✓ |
| Internal notes structurally separate from email replies | ✓ |
| No admin-to-admin messaging | ✓ |
| PII minimization at database level (160-char preview) | ✓ |
| Plain text rendering (never HTML) for message/reply bodies | ✓ |
| Build-time migration gate with preview protection | ✓ |
| Inbound email endpoint fails closed when secret unset | ✓ |
| No arbitrary case-ID injection in inbound email (thread matching) | ✓ |

---

## Migration safety verification

| Property | Status |
|---|---|
| All `ALTER TABLE` uses `ADD COLUMN IF NOT EXISTS` | ✓ |
| All `CREATE TABLE` uses `IF NOT EXISTS` | ✓ |
| All `CREATE INDEX` uses `IF NOT EXISTS` | ✓ |
| All `ADD CONSTRAINT` guarded by `DO $$ ... IF NOT EXISTS ... END $$` | ✓ |
| No destructive `DROP` or `ALTER` operations | ✓ |
| `migrate-on-build.mjs` is non-fatal (build continues on failure) | ✓ |
| Preview builds require `PREVIEW_DATABASE_ISOLATED=true` to migrate | ✓ |
| Migration order: schema → analytics → case-management → organisation | ✓ |

**Exception**: The constraint name collision in F1 is a correctness bug in
the migration logic, not a safety issue. The migrations are still safe to
re-run — they just do not create the intended constraint.

---

## Production smoke verification

Performed after merging PRs #67, #72, #68:

| Route | Status |
|---|---|
| `/` | 200 |
| `/en` | 308 → `/` (locale redirect) |
| `/es` | 200 (Spanish) |
| `/ar` | 200 (Arabic) |
| `/de` | 200 (German) |
| `/fr` | 200 (French) |
| `/stories` | 200 |
| `/contact` | 200 |
| `/donate` | 200 |
| `/our-work` | 200 |
| `/admin` | 307 → `/admin/login` (auth boundary intact) |

Vercel deployment `1us1axo7b` is Ready (Production).

---

## Local verification

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `eslint` | 0 errors, 1 warning (LanguageSelector `window.location.assign`) |
| `vitest run` | 658 passed, 27 skipped (integration tests need PostgreSQL), 2 flaky timeouts (pass on re-run) |

---

## Recommended next actions

1. **Fix F1** (constraint name collision) — this is the only critical
   finding. It is a small, additive migration.
2. **Fix F3** (`my_cases` count) — minor UX improvement.
3. **Update AGENTS.md** to document the inbound email endpoint (F4).
4. **Update PGlite test helper** (F2) when integration tests are added.
5. **Do not begin Phase 3** until F1 is fixed and the constraint is
   verified in production.
