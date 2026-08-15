import type { Metadata } from "next";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { Container } from "@/components/shared/Container";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; seconds?: string }>;
}) {
  const { error, seconds } = await searchParams;
  const csrfToken = await getCsrfTokenFromRequest();

  return (
    <section className="py-16 md:py-24">
      <Container className="max-w-md">
        <h1 className="text-2xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your admin username and password. If no admin accounts
          exist yet, leave the username blank and enter the bootstrap password
          (ADMIN_SECRET) to create the first admin.
        </p>

        <form
          method="post"
          action="/api/admin/login"
          className="mt-6 space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
        >
          <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username <span className="text-muted-foreground">(blank for bootstrap)</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Sign in
          </button>
          {error && (
            <p
              id="login-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {error === "rate-limited" &&
                "Too many login attempts. Please wait a minute and try again."}
              {error === "locked" &&
                `Too many failed attempts. Account locked for ${seconds || "900"} seconds.`}
              {error === "csrf" &&
                "Security check failed. Please reload the page and try again."}
              {error !== "rate-limited" &&
                error !== "csrf" &&
                error !== "locked" &&
                "Incorrect username or password. Please try again."}
            </p>
          )}
        </form>
      </Container>
    </section>
  );
}
