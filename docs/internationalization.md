# Internationalization

The public site supports English (`en`), German (`de`) and French (`fr`). English is the default and remains unprefixed; German and French use `/de/...` and `/fr/...` URLs.

## Architecture

- `lib/i18n/config.ts` is the locale registry and URL helper. Add future locales there first.
- `lib/i18n/dictionaries.ts` contains stable-key interface dictionaries. Locale dictionaries are merged over English, so a missing localized value renders English rather than a raw key.
- `lib/i18n/page-content.ts` contains longer translated editorial copy for pages and sections already migrated.
- `middleware.ts` rewrites locale-prefixed public URLs to the existing App Router pages and supplies the locale to Server Components. It excludes admin, API and static-asset routes and preserves query strings.
- `POST /api/locale` stores an explicit selection in the `vantage_locale` HTTP-only, SameSite cookie for one year. The middleware uses it on later unprefixed public requests. Browser-language detection is deliberately not enabled.
- `components/layout/LanguageSelector.tsx` preserves the current route, query string and fragment while changing locale.

## Content policy

Static interface copy belongs in the dictionaries and uses semantic keys. Organisation and programme names, personal names, URLs, account details and identifiers remain unchanged.

Database/CMS stories, projects, team biographies, uploaded media metadata and user submissions remain in their authored language. They are never sent to an external translation service. A later CMS phase should add reviewed per-locale fields (for example `title_de`, `title_fr`, localized excerpts and Markdown bodies) with English/source-language fallback.

## Current release scope

Translated now: the desktop/mobile header, language selector, footer, skip link, homepage hero and major homepage sections, About page, Contact page, contact form, newsletter form, contact categories, and the Our Work page shell. Locale-aware routes work for all public pages, and the shared shell remains translated while source-language dynamic content is displayed safely.

Still English in Phase 1: admin/authenticated screens; API/provider messages; long-form legal and policy bodies; donation form and detailed donation guidance; some impact, reports, gallery, FAQ, team, programme, project and story body copy; database/CMS content. These surfaces should be migrated in Phase 2 after review by fluent German and French speakers, especially safeguarding, privacy, financial and consent language.

## SEO

`createPublicMetadata` emits localized canonical URLs, `en`/`de`/`fr`/`x-default` alternates and localized Open Graph locale values. The homepage, About, Contact and Our Work pages also localize titles and descriptions. The sitemap includes all three locale variants and language alternates for public static routes.
