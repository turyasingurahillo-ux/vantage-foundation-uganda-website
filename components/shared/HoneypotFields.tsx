"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * Renders hidden honeypot and time-trap fields for bot detection.
 *
 * - "website" and "company_url": honeypot fields that should stay empty.
 *   Bots tend to fill all fields; humans won't see these.
 * - "form_loaded_at": timestamp set when the form mounts. If the form is
 *   submitted within 2 seconds, it's likely a bot.
 *
 * Also includes an optional idempotency token for forms that need
 * duplicate-submission protection (e.g. donation form).
 *
 * The initial hidden values are deterministic empty strings so the server-
 * rendered HTML and the client hydrate without mismatch. The real values
 * are populated after hydration via useSyncExternalStore, keeping the form
 * stable for the rest of the page session.
 */
interface HoneypotFieldsProps {
  /** When true, includes a hidden submissionId field for idempotency. */
  withIdempotency?: boolean;
}

type HoneypotValues = {
  loadedAt: string;
  submissionId: string;
};

const SERVER_VALUES: HoneypotValues = { loadedAt: "", submissionId: "" };

function generateSubmissionId(timestamp: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${timestamp}-${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID().
  return `${timestamp}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
}

function createHoneypotStore() {
  let client: HoneypotValues | null = null;
  const listeners = new Set<() => void>();
  let scheduled = false;

  function setClient() {
    if (client) return;
    const now = Date.now().toString();
    client = { loadedAt: now, submissionId: generateSubmissionId(now) };
    listeners.forEach((listener) => listener());
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    if (typeof window !== "undefined") {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(setClient);
      } else {
        setTimeout(setClient, 0);
      }
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (!client) schedule();
    return () => listeners.delete(listener);
  }

  function getSnapshot(): HoneypotValues {
    return client ?? SERVER_VALUES;
  }

  function getServerSnapshot(): HoneypotValues {
    return SERVER_VALUES;
  }

  return { subscribe, getSnapshot, getServerSnapshot };
}

export function HoneypotFields({ withIdempotency }: HoneypotFieldsProps) {
  const [store] = useState(createHoneypotStore);
  const values = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const { loadedAt, submissionId } = values;

  return (
    <>
      {/* Honeypot 1: "website" — should be empty */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      {/* Honeypot 2: "company_url" — realistic name, should be empty */}
      <input
        type="text"
        name="company_url"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      {/* Time-trap: timestamp of form load */}
      <input type="hidden" name="form_loaded_at" value={loadedAt} />
      {/* Idempotency token: unique per form mount */}
      {withIdempotency && (
        <input type="hidden" name="submissionId" value={submissionId} />
      )}
    </>
  );
}
