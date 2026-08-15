import type { Metadata } from "next";

// Centralized noindex for all admin routes. Individual admin pages can still
// override this if needed, but this ensures no admin page is ever indexed
// even if someone forgets to add robots metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
