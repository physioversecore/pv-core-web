import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sahayatri.session";

const PROTECTED_PREFIXES = ["/patient", "/therapist", "/admin"];
const PUBLIC_PREFIXES = ["/access", "/signup", "/forgot-password", "/reset-password"];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (isProtectedPath(pathname)) {
    if (!token || isJwtExpired(token)) {
      const accessUrl = new URL("/access", request.url);
      accessUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(accessUrl);
    }
  }

  if (pathname === "/access" && token && !isJwtExpired(token)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/patient/:path*",
    "/therapist/:path*",
    "/admin/:path*",
    "/access",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
