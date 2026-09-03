import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  getOrCreateCsrfToken,
} from "@/lib/csrf";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/config";

// Paths that must never be treated as public localizable pages. A locale
// prefix in front of any of these is meaningless, so `/de/admin` is not a
// German admin panel — it is a 404. Getting this wrong previously let
// `/de/admin` render the admin UI while skipping the CSRF branch below.
const RESERVED_SEGMENTS = new Set([
  "admin",
  "api",
  "_next",
  "images",
  "brand",
  "fonts",
]);

const RESERVED_FILES = new Set([
  "/favicon.ico",
  "/icon.svg",
  "/apple-icon.png",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

/**
 * Public pages live under `app/[locale]`. English is served unprefixed, so
 * `/about-us` is rewritten to `/en/about-us` while the browser keeps showing
 * `/about-us`; `/de/about-us` matches its route directly.
 */
function isReserved(pathname: string): boolean {
  const [, firstSegment = ""] = pathname.split("/");
  return (
    RESERVED_SEGMENTS.has(firstSegment) ||
    RESERVED_FILES.has(pathname) ||
    // Any other file-looking request is a static asset, except the RSS feed
    // which is a real localized route.
    (/\.[a-z0-9]+$/i.test(pathname) && !pathname.endsWith("/stories/rss.xml"))
  );
}

export const runtime = "experimental-edge";

// In Next.js 16, `middleware.ts` is deprecated and renamed to `proxy.ts`, but
// `proxy.ts` always runs on the Node.js runtime and cannot be changed to Edge.
// Cloudflare Pages (via OpenNext) and Cloudflare Workers Builds require Edge
// middleware, so we keep the deprecated `middleware.ts` name which still
// allows `runtime = "experimental-edge"`. On Vercel, Edge middleware is also
// supported and preferred.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isReserved(pathname)) {
    const [, firstSegment = ""] = pathname.split("/");

    // `/en/...` is a duplicate of the canonical unprefixed English URL.
    // Redirect permanently rather than serving the same page at two URLs.
    if (firstSegment === defaultLocale) {
      const target = request.nextUrl.clone();
      target.pathname = pathname.slice(defaultLocale.length + 1) || "/";
      return NextResponse.redirect(target, 308);
    }

    // An explicit locale prefix is authoritative: `/de/about-us` renders
    // German regardless of any saved preference. No cookie is consulted here.
    if (isLocale(firstSegment)) {
      return NextResponse.next();
    }

    // Unprefixed request. The saved preference only decides where a visitor
    // *entering the site* lands; it must never override an explicit URL, so
    // it is applied at the site root alone. Deep English URLs keep rendering
    // English, which is what makes `/about-us` a stable shareable link.
    if (pathname === "/") {
      const savedLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
      if (isLocale(savedLocale) && savedLocale !== defaultLocale) {
        const target = request.nextUrl.clone();
        target.pathname = `/${savedLocale}`;
        return NextResponse.redirect(target);
      }
    }

    // Serve English from the `[locale]` tree without exposing `/en` in the
    // address bar.
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // Only set CSRF cookie for admin pages and admin API routes.
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const existingCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const token = getOrCreateCsrfToken(existingCookie);

  // Pass the token to the page via a request header so Server Components
  // can read it (they cannot set cookies, only read headers).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CSRF_HEADER_NAME, token);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set/refresh the CSRF cookie on the response. Only set it if it doesn't
  // already exist or needs refreshing (avoid setting on every request).
  // Path is "/" so the cookie is sent to both /admin/* pages and /api/admin/* routes.
  if (!existingCookie || existingCookie !== token) {
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day, matches admin session
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
