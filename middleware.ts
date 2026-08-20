import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sahayatri.session";

const ROLE_ROUTE: Record<string, string> = {
  patient: "/patient",
  therapist: "/therapist",
  admin: "/admin",
};

const PUBLIC_PREFIXES = ["/access", "/signup", "/forgot-password", "/reset-password", "/onboarding"];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return Object.values(ROLE_ROUTE).some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (isProtectedPath(pathname)) {
    if (!token) {
      const accessUrl = new URL("/access", request.url);
      accessUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(accessUrl);
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      const accessUrl = new URL("/access", request.url);
      accessUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(accessUrl);
    }

    if (payload.exp && Date.now() >= (payload.exp as number) * 1000) {
      const accessUrl = new URL("/access", request.url);
      accessUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(accessUrl);
    }

    const role = payload.role as string | undefined;
    if (role && ROLE_ROUTE[role] && !pathname.startsWith(ROLE_ROUTE[role])) {
      return NextResponse.redirect(new URL(ROLE_ROUTE[role], request.url));
    }
  }

  if (pathname === "/access" && token) {
    const payload = decodeJwtPayload(token);
    if (payload && !(payload.exp && Date.now() >= (payload.exp as number) * 1000)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
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
    "/onboarding/:path*",
  ],
};
