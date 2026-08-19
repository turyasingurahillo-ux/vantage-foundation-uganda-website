import "server-only";

import { z } from "zod";
import { REPLY_MAX_LENGTH } from "@/lib/contact-reply";

/**
 * Validation for the admin contact-message reply form.
 *
 * Extracted from the route handler so the rules — and, critically, the
 * mapping of validation failures onto safe application error codes — can be
 * unit-tested in isolation.
 *
 * Why this exists: a previous version of `ReplyComposer` disabled the textarea
 * while a reply was in flight. Disabled form controls are omitted from
 * `FormData`, so `formData.get("body")` returned `null` and Zod's default
 * `"Expected string, received null"` message leaked straight into the redirect
 * URL (`?error=Expected%20string%2C%20received%20null`). Raw validation-library
 * internals must never appear in a browser URL, so every failure mode here is
 * normalised onto one of a small, fixed set of application codes.
 */

export type ReplyFormErrorCode = "empty" | "too-long" | "invalid";

export interface ReplyFormInput {
  id: FormDataEntryValue | null;
  body: FormDataEntryValue | null;
  idempotencyKey: FormDataEntryValue | null;
}

export type ReplyFormResult =
  | { ok: true; data: { id: number; body: string; idempotencyKey: string } }
  | { ok: false; code: ReplyFormErrorCode };

const schema = z.object({
  id: z.coerce.number().int("invalid").positive("invalid"),
  body: z.string().trim().min(1, "empty").max(REPLY_MAX_LENGTH, "too-long"),
  idempotencyKey: z.string().min(8, "invalid").max(100, "invalid"),
});

/**
 * Parses the raw reply form values into either a validated payload or a
 * controlled application error code. Never returns raw Zod error text.
 */
export function parseReplyForm(input: ReplyFormInput): ReplyFormResult {
  // Belt-and-braces: a non-string `body` (the production bug — a disabled
  // textarea submits no field, so formData.get returns null) is rejected
  // before Zod can produce its default type-error message. The schema below
  // would also map this onto "invalid", but the explicit guard makes the
  // intent obvious and keeps the test honest.
  if (typeof input.body !== "string") {
    return { ok: false, code: "invalid" };
  }
  if (typeof input.idempotencyKey !== "string") {
    return { ok: false, code: "invalid" };
  }

  const parsed = schema.safeParse({
    id: input.id,
    body: input.body,
    idempotencyKey: input.idempotencyKey,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message;
    if (issue === "empty") return { ok: false, code: "empty" };
    if (issue === "too-long") return { ok: false, code: "too-long" };
    return { ok: false, code: "invalid" };
  }
  return { ok: true, data: parsed.data };
}
