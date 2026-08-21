# Proxy.js — Next.js 16 Route Protection Convention

> **Status for this project**: ✅ **APPLIED**. The project runs **Next.js 16.3.1** and route protection lives in `proxy.ts` at the repo root (`middleware.ts` is gone). This document is now a reference for how our proxy works and what changed during the migration.

## What Changed

In Next.js 16, `middleware.ts` is **deprecated** and renamed to `proxy.ts`. The exported function name changes from `middleware` to `proxy`.

```diff
- // middleware.ts
- export function middleware(request: NextRequest) { ... }

+ // proxy.ts
+ export function proxy(request: NextRequest) { ... }
```

## Why the Rename

- The term "middleware" confused developers with Express.js middleware
- "Proxy" better describes what it does: a network boundary in front of the app that handles requests before they reach your code
- Encourages using it as a last resort, not a go-to pattern

## Migration Command

Used when upgrading to Next.js 16+ (already done for this project):

```bash
npx @next/codemod@canary middleware-to-proxy .
```

This renames the file and function automatically.

## Proxy Convention (Next.js 16+)

### File Location

Same as middleware — project root or `src/`:

```
proxy.ts          # project root
src/proxy.ts      # if using src/
```

### Function Export

Must export a single function named `proxy` (or default export):

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/home", request.url));
}
```

### Config / Matcher

Same pattern as middleware — export a `config` object with `matcher`:

```ts
export const config = {
  matcher: ["/patient/:path*", "/therapist/:path*", "/admin/:path*"],
};
```

### Key Differences from Middleware

| Feature | middleware.ts (v15) | proxy.ts (v16) |
|---|---|---|
| File name | `middleware.ts` | `proxy.ts` |
| Function name | `middleware()` | `proxy()` |
| Runtime | Edge (default), Node.js (v15.5+) | Node.js (default) |
| `runtime` config | Not allowed | Not allowed |
| `NextFetchEvent` | Supported | Supported |
| `waitUntil()` | Supported | Supported |
| Unit testing | `next/experimental/testing/server` | Same |

### What Stays the Same

- `NextRequest` / `NextResponse` APIs
- Cookie access via `request.cookies`
- Header manipulation
- `config.matcher` patterns (path-to-regexp)
- Negative matching with regex
- `has` / `missing` conditions
- CORS handling patterns
- `Response.json()` direct responses

## Our Current Implementation

Our `proxy.ts` at the project root (post-migration):

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/services/api/auth-session";
import { getRoleForPath, isPublicPath, ROLE_ROUTE, type UserRole } from "@/services/api/auth-constants";

const SESSION_COOKIE = "sahayatri.session";

const ONBOARDING_ROLE_MAP: Record<string, UserRole> = {
  "/onboarding/therapist": "therapist",
  "/onboarding/patient": "patient",
};

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

function getOnboardingRole(pathname: string): UserRole | null {
  for (const [prefix, role] of Object.entries(ONBOARDING_ROLE_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const onboardingRole = getOnboardingRole(pathname);
  if (onboardingRole) {
    if (!token) return redirectToAccess(request);

    const result = await verifySession(token);
    if (!result.ok) return clearSessionAndRedirect(request, "/access");
    if (result.payload.role !== onboardingRole) {
      return NextResponse.redirect(new URL(ROLE_ROUTE[result.payload.role], request.url));
    }
    return NextResponse.next();
  }

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
```

### Supporting Files

| File | Purpose |
|---|---|
| `src/services/api/auth-session.ts` | `verifySession()` — jose `jwtVerify` against `SECRET_KEY`/`JWT_SECRET` env (must match the backend's signing key). Returns a typed result: `{ ok: true, payload }` or `{ ok: false, reason: "missing" \| "expired" \| "invalid_signature" \| "invalid_role" \| "invalid_payload" }`. Validates the `role` claim against known roles. |
| `src/services/api/auth-constants.ts` | `UserRole` type, `ROLE_ROUTE` map (`/patient`, `/therapist`, `/admin`), `PUBLIC_PREFIXES` (`/access`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`), plus path helpers (`getRoleForPath`, `isPublicPath`, `isPathWithinRoute`). |
| `src/services/api/session-client.ts` | Client-side cookie removal for logout (the proxy only runs server-side). |

### Behavior Summary

| Situation | Result |
|---|---|
| No token on a protected prefix | Redirect `/access?callbackUrl=<path+query>` |
| Invalid/expired token | Clear cookie → redirect `/access` |
| Role mismatch (e.g. patient on `/admin`) | Redirect to the user's own role home |
| Therapist token on `/onboarding/patient` (or vice versa) | Redirect to the user's own role home |
| Logged-in user opens `/access` | Redirect to their role home |
| Invalid cookie while opening `/access` | Cookie cleared, page renders normally |
| Callback URL safety | Must start with a single `/` — protocol-relative `//` paths are rejected |

## What Changed Beyond the Codemod

The codemod only renames the file/function. We also reworked the logic during the migration:

1. **Real signature verification** — the old middleware base64-decoded the payload and compared `exp`. The proxy now verifies the HMAC signature with jose (`jwtVerify`) using the shared `SECRET_KEY`, so forged tokens are rejected, not just expired ones.
2. **Async function** — `export async function proxy()` because `jwtVerify` returns a promise.
3. **Role-aware redirects** — role mismatch sends users to their own role home instead of a generic page.
4. **Onboarding gating** — `/onboarding/therapist` and `/onboarding/patient` each require the matching role.
5. **Unified login** — all redirects point to `/access` (the old `/login` route no longer exists).
6. **Cookie hygiene** — invalid sessions are actively cleared via `response.cookies.delete()` instead of being left in the browser.
7. **Safe callback paths** — `isSafeCallbackPath` blocks open-redirect vectors (protocol-relative URLs).

## Version History

| Version | Change |
|---|---|
| v16.0.0 | `middleware` deprecated, `proxy` is the new convention |
| v15.5.0 | Middleware can use Node.js runtime (stable) |
| v15.2.0 | Middleware can use Node.js runtime (experimental) |
| v13.1.0 | Advanced middleware flags added |
| v13.0.0 | Middleware can modify request/response headers |
| v12.2.0 | Middleware stable |
| v12.0.0 | Middleware (Beta) added |
