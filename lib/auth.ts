import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { safeEqual } from "./utils";

export interface ApprovalSession {
  ok?: boolean;
  user?: string;
  loginAt?: number;
}

const COOKIE_NAME = "li_approval";

function sessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET;
  const password =
    secret && secret.length >= 32
      ? secret
      : "dev-only-ephemeral-secret-do-not-use-in-production-min-32-chars";
  if (!secret || secret.length < 32) {
    console.warn(
      "[auth] SESSION_SECRET missing or < 32 chars. Using ephemeral dev secret. Set SESSION_SECRET in production."
    );
  }
  return {
    cookieName: COOKIE_NAME,
    password,
    ttl: 60 * 60 * 24 * 7, // 1 week (seconds)
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<ApprovalSession>(cookieStore, sessionOptions());
}

export async function isAuthenticated(): Promise<boolean> {
  const s = await getSession();
  return s.ok === true;
}

export async function authenticateWithPassword(
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const expected = process.env.APPROVAL_PASSWORD;
  if (!expected) {
    return {
      ok: false,
      error:
        "APPROVAL_PASSWORD is not set on the server. Set it in .env.local (dev) or Vercel env vars.",
    };
  }
  if (!safeEqual(password, expected)) {
    return { ok: false, error: "Incorrect password." };
  }
  const s = await getSession();
  s.ok = true;
  s.user = "approver";
  s.loginAt = Date.now();
  await s.save();
  return { ok: true };
}

export async function logout(): Promise<void> {
  const s = await getSession();
  s.destroy();
  await s.save();
}

// Shared constants for the middleware (which can't import server-only
// `next/headers` code).
export const COOKIE_NAME_EXPORT = COOKIE_NAME;
export function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  return "dev-only-ephemeral-secret-do-not-use-in-production-min-32-chars";
}