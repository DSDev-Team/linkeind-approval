import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { ApprovalSession } from "@/lib/auth";
import { COOKIE_NAME_EXPORT, sessionSecret } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const raw = req.cookies.get(COOKIE_NAME_EXPORT)?.value;
  if (!raw) {
    return redirectToLogin(req, pathname);
  }
  try {
    const s = await getIronSession<ApprovalSession>(req as never, res, {
      cookieName: COOKIE_NAME_EXPORT,
      password: sessionSecret(),
    });
    if (s.ok !== true) return redirectToLogin(req, pathname);
  } catch {
    return redirectToLogin(req, pathname);
  }
  return res;
}

function redirectToLogin(req: NextRequest, next: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};