# Proxy.js — Next.js 16 Route Protection Convention

> **Status for this project**: Not yet applicable. Our project uses **Next.js 15.5.20**, where `middleware.ts` is the correct convention. This document serves as a migration reference for when we upgrade to **Next.js 16+**.

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

When upgrading to Next.js 16+:

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

Our `middleware.ts` at project root:

```ts
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sahayatri.session";
const PROTECTED_PREFIXES = ["/patient", "/therapist", "/admin"];
const PUBLIC_PREFIXES = ["/login", "/api"];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
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
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/login" && token && !isJwtExpired(token)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/patient/:path*", "/therapist/:path*", "/admin/:path*", "/login"],
};
```

### When Upgrading to Next.js 16

After running the codemod, the only change is:

```diff
- // middleware.ts → renamed to proxy.ts
- export function middleware(request: NextRequest) {
+ export function proxy(request: NextRequest) {
```

Everything else — matcher config, cookie logic, JWT decoding, redirects — stays identical.

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
