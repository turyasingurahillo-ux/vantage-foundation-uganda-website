<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Vantage Foundation Uganda Website

## Commands
- `npm run dev` — start the Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint
- `npm run type-check` — TypeScript check

## Project structure
- `app/` — Next.js App Router pages and special files (`sitemap.ts`, `robots.ts`, `actions.ts`)
- `components/sections/` — homepage section components
- `components/shared/` — reusable components (forms, cards, image placeholders)
- `components/admin/` — admin-only client components (media manager)
- `components/ui/` — small primitives (Button, Card, Input, etc.)
- `content/` — all editable content (site config, projects, stories, team, partners, impact, FAQ, reports, donation)
- `lib/` — utilities and content helpers
- `lib/storage/` — Cloudflare R2 client and object-key conventions (server-only)
- `lib/db/` — Neon PostgreSQL queries (`index.ts` = donations, `media.ts` = media objects, `schema.sql` = table definitions)
- `public/images/` — real images go here; placeholder filenames are handled by `ImageOrPlaceholder`
- `types/` — shared TypeScript interfaces

## Email privacy (important)
`foundationvantage@gmail.com` is a **protected operational mailbox** and must
never be published on the public site — not in `content/site.ts`, not in a
`mailto:` link, not in JSON-LD or metadata, and not in any `NEXT_PUBLIC_*`
variable. It lives only in `lib/contact-inbox.ts`, which imports `server-only`
so it cannot reach a client bundle.

Visitors contact Vantage through `/contact`. A public alias is displayed only
when `NEXT_PUBLIC_CONTACT_EMAIL` is set to a **verified** domain alias;
otherwise the site shows a "Contact Vantage" link instead of an address.

Full architecture, the anti-spam layers, and the outstanding Cloudflare/DNS/Gmail
actions: **[docs/email-privacy-and-contact.md](docs/email-privacy-and-contact.md)**.

## Editing content
All non-code content lives in the `content/` folder as TypeScript modules. To update a project, story, team member, partner or report, edit the relevant file. Placeholder data is marked with `[...]` or the `placeholder` boolean. Replace placeholder content with verified information before public launch.

## Environment variables
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_SITE_URL` — canonical site URL
- `DATABASE_URL` — Neon PostgreSQL connection string (server-side only, never commit)
- `ADMIN_SECRET` — password for the donation verification dashboard
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — optional email server for form notifications
- `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` — Cloudflare R2 object storage (server-only). Same bucket/credentials as the sibling kikumikyo project; Vantage objects live under a `vantage/` prefix. Do not rename these variables or create a new bucket.

## Database setup
1. Create a Neon PostgreSQL database.
2. Run `node scripts/setup-db.mjs` (or paste `lib/db/schema.sql` in the Neon SQL editor) to create the `donations`, `media_objects` and `blog_posts` tables. The script is idempotent — safe to re-run after schema updates.
3. Never commit `.env.local` or any real credentials.

## Admin dashboard
- `/admin/login` — sign in with `ADMIN_SECRET`.
- `/admin/donations` — view and verify/reject donor submissions. Donations are stored with status `pending` and are only marked `verified` after an administrator confirms the transfer against the official bank statement.
- `/admin/media` — upload and manage photos, documents, and logos stored in Cloudflare R2. New uploads default to `pending` consent and `unpublished`; set both before publishing. The browser uploads directly to R2 via a presigned PUT URL (issued by `/api/admin/media/presign`), then the server confirms the object via HEAD and records it in the `media_objects` table. R2 object keys are stored (never signed URLs) so the DB stays stable; presigned GET URLs are minted at render time.
- `/admin/messages` — read contact-form submissions. Every message is stored in
  `contact_messages` before the notification email is attempted, so an SMTP
  outage cannot lose an inquiry. Anything badged "Email failed" needs a manual
  reply and means SMTP needs attention.
- `/admin/blog` — write, edit and publish blog posts (stored in `blog_posts`), each optionally with a hero image uploaded the same way media is (folder `blog`, presigned PUT, HEAD-confirmed before saving). New posts default to a draft; publishing is a separate explicit toggle. `/blog` and `/blog/[slug]` merge published rows here with the (normally empty) static `content/blog.ts` manifest.

## Deployment
This project is configured for Vercel. Set the framework preset to Next.js and, if needed, the root directory to `vantage-website`.

