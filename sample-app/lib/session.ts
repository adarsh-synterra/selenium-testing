import { cookies } from "next/headers";
import { findUserById } from "./db";
import type { PublicUser, User } from "./types";

const AUTH_COOKIE = "sid";
const ANON_COOKIE = "anon";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  // 7 days
  maxAge: 60 * 60 * 24 * 7,
};

function b64encode(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

function b64decode(s: string): string {
  try {
    return Buffer.from(s, "base64url").toString("utf8");
  } catch {
    return "";
  }
}

export function setAuthCookie(userId: string): void {
  cookies().set(AUTH_COOKIE, b64encode(userId), COOKIE_OPTS);
}

export function clearAuthCookie(): void {
  cookies().delete(AUTH_COOKIE);
}

export function getCurrentUser(): User | null {
  const raw = cookies().get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  const userId = b64decode(raw);
  if (!userId) return null;
  return findUserById(userId) ?? null;
}

export function getCurrentPublicUser(): PublicUser | null {
  const u = getCurrentUser();
  if (!u) return null;
  const { password: _password, ...rest } = u;
  return rest;
}

// Anonymous session id used to key carts before login.
export function getSessionId(): string {
  const existing = cookies().get(ANON_COOKIE)?.value;
  if (existing) return existing;
  const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  cookies().set(ANON_COOKIE, id, COOKIE_OPTS);
  return id;
}

// Read-only variant for routes that should NOT create a new cookie (e.g. GETs from server components).
export function peekSessionId(): string | null {
  return cookies().get(ANON_COOKIE)?.value ?? null;
}
