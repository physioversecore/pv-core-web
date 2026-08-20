import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/services/api/auth-session";
import { getRoleForPath, isPublicPath, ROLE_ROUTE } from "@/services/api/auth-constants";

const SESSION_COOKIE = "sahayatri.session";

function clearSessionAndRedirect(request: NextRequest, target: string): NextResponse {
  const url = new URL(target, request.url);
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

function redirectToAccess(request: NextRequest, callbackUrl?: string): NextResponse {
  const url = new URL("/access", request.url);
  if (callbackUrl) {
    url.searchParams.set("callbackUrl", callbackUrl);
  }
  return NextResponse.redirect(url);
}

function isSafeCallbackPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!isPublicPath(pathname) && getRoleForPath(pathname) !== null) {
    if (!token) {
      const callback = isSafeCallbackPath(pathname + search) ? pathname + search : undefined;
      return redirectToAccess(request, callback);
    }

    const result = await verifySession(token);
    if (!result.ok) {
      return clearSessionAndRedirect(request, "/access");
    }

    const { role } = result.payload;
    const requiredRole = getRoleForPath(pathname);
    if (requiredRole && role !== requiredRole) {
      return NextResponse.redirect(new URL(ROLE_ROUTE[role], request.url));
    }
  }

  if (pathname === "/access" && token) {
    const result = await verifySession(token);
    if (result.ok) {
      return NextResponse.redirect(new URL(ROLE_ROUTE[result.payload.role], request.url));
    }
    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    return response;
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
