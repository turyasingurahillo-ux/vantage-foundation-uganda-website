import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCsrf, clearCsrfCookie } from "@/lib/csrf";
import { sessionCookieName } from "@/lib/session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const formData = await request.formData();

  if (!validateCsrf(cookieStore, formData)) {
    return NextResponse.redirect(new URL("/admin/login?error=csrf", request.url), 302);
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url), 302);
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  clearCsrfCookie(response);
  return response;
}
