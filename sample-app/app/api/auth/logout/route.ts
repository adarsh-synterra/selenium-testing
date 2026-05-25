import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  clearAuthCookie();

  // If the request came from an HTML form submission, redirect to home.
  // This lets the logout button work without JS hydration — a more robust
  // pattern than relying on a client-side fetch + window.location.assign.
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  }

  return NextResponse.json({ ok: true });
}
