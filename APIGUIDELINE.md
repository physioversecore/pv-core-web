# API Integration(Calling) Guidelines — Physiotherapy-at-Home App (Next.js App Router)

These rules govern **how the frontend talks to the backend**. Follow this decision order for every new feature before writing fetch/API code.

---

## Core Principle

Never call the backend directly from client-side JavaScript (`"use client"` components). All backend calls must go through the Next.js server layer (Server Components, Server Actions, or Route Handlers). This app handles patient health data, therapist scheduling, and payments — none of that should touch the browser with exposed tokens.

---

## Decision Tree

**Q1: Is this data needed to render the page (on initial load)?**
→ Yes: Use a **Server Component** with a direct `fetch()` to the backend.
→ No, it's triggered by a user action (click, form submit): go to Q2.

**Q2: Does the action mutate data (book, cancel, reschedule, submit form, update profile)?**
→ Yes: Use a **Server Action**.
→ No, it's a webhook, third-party integration, or needed by a separate client (mobile app): go to Q3.

**Q3: Is this consumed by an external caller (payment gateway webhook, mobile app, partner integration)?**
→ Yes: Use a **Route Handler** (`app/api/.../route.ts`).
→ No: Is it genuinely live/real-time (map tracking, chat)?
→ Yes: Client-side fetch/WebSocket is allowed, but **only against our own Route Handler**, never the raw backend URL.

---

## 1. Server Components — default for all page data

Use for: appointment lists, therapist profiles, booking history, dashboards, service catalogs.

```tsx
// app/appointments/page.tsx
export default async function AppointmentsPage() {
  const session = await getSession(); // server-side auth check, redirect if missing
  const res = await fetch(`${process.env.BACKEND_URL}/appointments`, {
    headers: { Authorization: `Bearer ${session.token}` },
    cache: "no-store", // appointment/schedule data must not be stale
  });
  if (!res.ok) throw new Error("Failed to load appointments");
  const appointments = await res.json();
  return <AppointmentList data={appointments} />;
}
```

**Rules:**
- Auth/session check happens here, server-side, before any data leaves the backend.
- Use `cache: "no-store"` for anything time-sensitive (appointment slots, therapist availability, live status).
- Use `next: { revalidate: N }` only for genuinely stable data (service list, static content, pricing tiers).
- Never expose `BACKEND_URL` or tokens via `NEXT_PUBLIC_` env vars.

---

## 2. Server Actions — default for all mutations

Use for: booking a session, cancelling/rescheduling, submitting intake/health forms, updating patient/therapist profile, submitting reviews.

```tsx
// app/actions/booking.ts
"use server";
import { revalidatePath } from "next/cache";

export async function bookSession(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.BACKEND_URL}/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      therapistId: formData.get("therapistId"),
      slot: formData.get("slot"),
      patientId: session.userId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Booking failed");
  }

  revalidatePath("/appointments");
  return { success: true };
}
```

**Rules:**
- Always re-check auth/session inside the action itself — never trust that the UI only shows the button to authorized users.
- Booking/slot actions must let the backend do the final availability/lock check (race condition safety — two patients booking the same slot).
- Always `revalidatePath` or `revalidateTag` after a successful mutation so the UI reflects fresh data.
- Return structured `{ success, error }` shapes so client components can show proper form errors, not raw exceptions.
- Never put PHI/health-intake data through client fetch — only through Server Actions.

---

## 3. Route Handlers — only for external-facing endpoints

Use for: payment gateway webhooks, mobile app API surface (if/when built), third-party integrations calling into us.

```tsx
// app/api/webhooks/payment/route.ts
export async function POST(req: Request) {
  const signature = req.headers.get("x-webhook-signature");
  const body = await req.text();

  if (!verifySignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);
  await updateBookingPaymentStatus(event); // internal server-side call
  return new Response("OK", { status: 200 });
}
```

**Rules:**
- Always verify webhook signatures before trusting payload contents.
- Route Handlers are the only acceptable place for a stable, versioned REST-style contract if we later build a therapist-facing mobile app.
- Do not use Route Handlers as a generic "client calls this, this calls backend" proxy layer for page data — that's what Server Components/Actions are for. Only use when there's a real external caller.

---

## 4. Client-side fetch — narrow exception, not default

Only acceptable for:
- Live therapist location tracking (map, en route to patient home)
- Real-time chat between patient and therapist
- Search-as-you-type UI against our own backend

**Rules:**
- Client fetch must always target **our own Route Handler** (`/api/...`), never the raw backend URL directly.
- Never put backend API keys, secrets, or unprefixed `BACKEND_URL` in client-accessible code.
- If polling, respect reasonable intervals (avoid hammering the backend); prefer WebSocket/SSE for true real-time needs like live location.

---

## Non-negotiables (apply everywhere)

1. **No backend secrets or non-`NEXT_PUBLIC_` env vars ever referenced in a `"use client"` file.**
2. **Auth/session validation happens server-side**, on every Server Component render and every Server Action call — never assume the client only reached this code path because it was "supposed to."
3. **Patient health data (intake forms, treatment notes, medical history) only ever flows through Server Components/Actions**, never raw client fetch.
4. **Booking/scheduling mutations must go through Server Actions** so slot-locking/availability checks happen server-side, avoiding double-booking.
5. **Payment webhooks must verify signatures** before acting on the payload.
6. **Revalidate after every mutation** (`revalidatePath`/`revalidateTag`) so stale data isn't shown post-action.
7. When in doubt about which layer to use, default to **Server Component (for reads) or Server Action (for writes)** — Route Handlers and client fetch are the exception, not the default.

---

## Quick Reference Table

| Scenario | Approach |
|---|---|
| Load appointment list / dashboard / therapist profile | Server Component, direct fetch |
| Book / cancel / reschedule a session | Server Action |
| Submit intake or health form | Server Action |
| Update patient/therapist profile | Server Action |
| Payment gateway webhook | Route Handler |
| Future mobile app API surface | Route Handler |
| Live therapist location tracking | Client fetch/WebSocket → our own Route Handler |
| Live chat | Client fetch/WebSocket → our own Route Handler |
| Anything involving PHI/health data | Server Component/Action only — never client fetch |