// Pure constants for CSRF protection so client components can import them
// without pulling in server-only `next/headers`.

export const CSRF_COOKIE_NAME = "vantage_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";
export const CSRF_FIELD_NAME = "csrf_token";
