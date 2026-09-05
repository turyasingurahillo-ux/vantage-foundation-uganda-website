import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "../globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "block",
});

export const metadata: Metadata = {
  title: {
    default: "Vantage Foundation Uganda",
    template: `%s | Vantage Foundation Uganda`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
