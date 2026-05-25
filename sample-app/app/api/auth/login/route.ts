import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { setAuthCookie } from "@/lib/session";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  setAuthCookie(user.id);
  const { password: _password, ...publicUser } = user;
  return NextResponse.json({ user: publicUser });
}
