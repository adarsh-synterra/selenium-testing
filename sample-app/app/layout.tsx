import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { getCurrentPublicUser, peekSessionId } from "@/lib/session";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sample Shop",
  description: "Learning sandbox for Selenium / Playwright / Appium testing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentPublicUser();
  const sid = peekSessionId();
  const cartCount = sid
    ? (db.carts.get(sid)?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0)
    : 0;

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Nav user={user} cartCount={cartCount} />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
