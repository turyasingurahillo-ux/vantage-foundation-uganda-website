# Inbound Email Continuity — Cloudflare Email Worker Setup

This document describes how to configure Cloudflare Email Routing / Email Workers
to forward inbound replies to Vantage's outbound correspondence into the
application's authenticated inbound endpoint.

## Architecture

```
Inbound email (reply from enquirer)
  → Cloudflare Email Routing (MX records unchanged)
  → Cloudflare Email Worker (parses headers + body)
  → POST /api/inbound/email (authenticated with Bearer token)
  → Match In-Reply-To / References to stored outbound provider_message_id
  → Create inbound reply row
  → Update case workflow to 'awaiting_vantage'
  → Log to inbound_email_log (replay protection)
```

## What is implemented in code

- `app/api/inbound/email/route.ts` — authenticated POST endpoint
- `lib/db/inbound-email.ts` — processing logic, replay protection, thread matching
- `lib/db/migrations/organisation-relationship-pipeline.sql` — `inbound_email_log` table
- The existing `contact_message_replies` table already supports `direction = 'inbound'`
  and stores `provider_message_id` for threading

## What requires Cloudflare configuration

The following must be configured in the Cloudflare dashboard. These steps do NOT
require changing MX records and do NOT break existing email routing.

### 1. Set the inbound email secret

Set an environment variable in your deployment (Vercel/Cloudflare):

```
INBOUND_EMAIL_SECRET=<a strong random string, at least 32 chars>
```

This shared secret authenticates the Email Worker → application POST request.
Generate it with:

```bash
openssl rand -hex 32
```

### 2. Create a Cloudflare Email Worker

Create a new Email Worker in the Cloudflare dashboard (Workers & Pages → Email).

The Worker receives the raw email, parses the headers, extracts the plain-text
body, and POSTs JSON to the application endpoint.

**Worker code (`email-worker.js`):**

```javascript
export default {
  async email(message, env) {
    const INBOUND_URL = env.INBOUND_URL; // e.g. https://vantage-foundation.org/api/inbound/email
    const INBOUND_SECRET = env.INBOUND_EMAIL_SECRET;

    if (!INBOUND_URL || !INBOUND_SECRET) {
      console.error("Missing INBOUND_URL or INBOUND_EMAIL_SECRET");
      message.setReject("500 Configuration error");
      return;
    }

    // Extract headers
    const messageId = message.headers.get("message-id") || "";
    const inReplyTo = message.headers.get("in-reply-to") || null;
    const references = message.headers.get("references") || null;
    const subject = message.headers.get("subject") || null;
    const date = message.headers.get("date") || "";
    const from = message.from || "";

    if (!messageId || !from || !date) {
      console.warn("Missing required headers, rejecting");
      message.setReject("400 Missing required headers");
      return;
    }

    // Read the email body (raw stream)
    const rawEmail = await new Response(message.raw).text();

    // Extract plain-text body (simple extraction — for production, use a MIME parser)
    let body = rawEmail;
    const contentType = message.headers.get("content-type") || "";
    if (contentType.includes("multipart")) {
      // Try to find the text/plain part
      const textMatch = rawEmail.match(
        /Content-Type:\s*text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*?)(?:\r?\n--|\r?\n$)/i
      );
      if (textMatch) {
        body = textMatch[1].trim();
      }
    }

    // Truncate body to 200KB
    body = body.slice(0, 200000);

    const payload = {
      messageId: messageId.replace(/[<>]/g, ""),
      fromAddress: from,
      inReplyTo: inReplyTo ? inReplyTo.replace(/[<>]/g, "") : null,
      references: references
        ? references.split(/\s+/).map((r) => r.replace(/[<>]/g, "")).join(" ")
        : null,
      subject: subject,
      body: body,
      date: date,
    };

    try {
      const response = await fetch(INBOUND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INBOUND_SECRET}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Inbound endpoint returned ${response.status}`);
        // Don't reject — the email was received, just not processed
      }
    } catch (error) {
      console.error("Failed to POST to inbound endpoint:", error);
    }
  },
};
```

### 3. Configure Worker environment variables

In the Cloudflare Worker settings, set:

- `INBOUND_URL` — `https://your-domain.com/api/inbound/email`
- `INBOUND_EMAIL_SECRET` — the same secret set in the application environment

### 4. Create an Email Routing rule

In Cloudflare → Email → Email Routing:

1. Do NOT change MX records. The existing MX records for `foundationvantage@gmail.com`
   remain unchanged — Gmail continues to receive all mail.
2. Create a **routing rule** that forwards specific reply addresses to the Worker.
   This is typically done by creating a custom address like
   `replies@your-domain.com` and routing it to the Worker.
3. Alternatively, if using a dedicated reply-to domain (e.g. `mail.your-domain.com`),
   route all traffic on that domain to the Worker.

### 5. Update outbound reply-to header (optional but recommended)

For outbound replies sent from Vantage HQ, set the `Reply-To` header to the
address that routes to the Email Worker (e.g. `replies@your-domain.com`).
This ensures that when an enquirer replies, their email goes through the
Worker → endpoint pipeline rather than only to Gmail.

This is configured in `lib/email.ts` or the outbound email transport. The
`Reply-To` address should NOT be `foundationvantage@gmail.com` — that mailbox
is the protected operational inbox and should not be the public reply-to.

## Security model

- **Authentication**: Bearer token (`INBOUND_EMAIL_SECRET`) shared between Worker and app
- **Replay protection**: SHA-256 hash of (Message-ID + sender + date) stored in
  `inbound_email_log` with a UNIQUE constraint
- **Thread validation**: In-Reply-To / References must match a stored outbound
  `provider_message_id` — no arbitrary case-ID injection
- **Size limits**: Body truncated to 100KB in the application, 200KB in the Worker
- **No secret exposure**: The endpoint returns only `{ status, caseId }` — no
  secrets, no case details, no PII
- **Rate limited**: 60 requests per minute per IP

## What is deliberately deferred

- **Attachment handling**: Attachments are not parsed or stored. The Worker
  strips them (only plain-text body is forwarded). Attachment support can be
  added later by extending the Worker to upload attachments to R2 and
  reference them in the inbound reply.
- **HTML body parsing**: Only plain-text is extracted. A MIME parser library
  in the Worker would improve fidelity for HTML-only emails.
- **SPF/DKIM verification**: Cloudflare Email Routing validates these at the
  MX level. Additional application-level verification is not implemented.
