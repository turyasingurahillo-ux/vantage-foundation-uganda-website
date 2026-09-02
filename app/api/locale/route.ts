import { NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE_NAME } from "@/lib/i18n/config";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { locale?: string } | null;
  if (!isLocale(body?.locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale: body.locale });
  response.cookies.set(LOCALE_COOKIE_NAME, body.locale, {
    httpOnly: true,
    // Only mark the cookie Secure when the request was made over HTTPS.
    // Local e2e runs against http://localhost:3100 and must still be able
    // to send the preference cookie back for unprefixed redirects.
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
