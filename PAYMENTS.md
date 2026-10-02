# Payments System — Current State & Work Needed

> Covers both repos: `pvc-web` (Next.js frontend) and `pvc-api` (FastAPI backend).
> Last verified: Sep 2026.

---

## 1. What payment options exist today

### 1.1 The user-facing list (booking flow)

The booking modal (`src/components/modals/BookingModal.tsx`) renders whatever
`GET /api/v1/settings/payment-methods` returns (admin-editable, stored in the
`Setting` table). The seeded list (`pvc-api/scripts/seed-settings.py`) is:

**Nepal**
| id | Label | Subtype | Real rail? |
|---|---|---|---|
| `esewa` | eSewa | Digital wallet | ✅ Live gateway |
| `khalti` | Khalti | Digital wallet | ✅ Live gateway |
| `connectips` | ConnectIPS | Bank transfer | ❌ Manual fallback (Phase 2, NCHL) |
| `fonepay` | FonePay | QR/mobile | ❌ Manual fallback |
| `cash` | Cash | Pay on visit | ✅ Manual (by design) |

**International**
| id | Label | Subtype | Real rail? |
|---|---|---|---|
| `card` | Card | Credit/Debit | ❌ Manual fallback |
| `paypal` | PayPal | Online wallet | ❌ Manual fallback |
| `googlepay` | Google Pay | Mobile wallet | ❌ Manual fallback |
| `applepay` | Apple Pay | Mobile wallet | ❌ Manual fallback |

Notes:
- **IME Pay removed from the UI** (merged into Khalti — "Khalti by IME").
  `seed-settings.py` idempotently prunes a stale `imepay` row; the backend keeps
  an `imepay → khalti` alias so legacy payments still route to Khalti.
- The legacy/unused component `src/components/booking/mockData.ts` still lists
  the old set (eSewa, Khalti, ConnectIPS, IME Pay, FonePay, Cash + card/paypal/
  googlepay/applepay). It is dead code — the real modal is
  `src/components/modals/BookingModal.tsx`.

### 1.2 The backend's "real rails"

`pvc-api/app/services/payments/` implements a pluggable gateway registry:

- `registry.py` — maps only `esewa` and `khalti` to real gateways.
- `gateway.py` — defines `GATEWAY_METHODS = ("esewa", "khalti")`,
  `_METHOD_ALIASES = {"imepay": "khalti"}`, plus shared statuses/interface.
- `esewa.py` — eSewa ePay v2 (signed hidden form + HMAC verification).
- `khalti.py` — Khalti KPG-2 Web Checkout (redirection + lookup verify).
- `manual.py` — everything else; marks the payment `COMPLETED` instantly
  (cash-on-visit / off-gateway). `verify()` returns `ref="CASH"`.

**Every method outside `esewa`/`khalti` silently resolves to `ManualGateway`.**
So 7 of the 9 advertised options never touch a payment rail.

### 1.3 Where payments appear elsewhere

| Surface | Options shown | Wired? |
|---|---|---|
| Product cart checkout (`src/components/modals/CartDrawer.tsx:108`) | eSewa, Khalti, Cash on Delivery (hardcoded) | ❌ **UI-only mock** — no backend checkout/order endpoint |
| Therapist earnings / payouts (`src/app/(dashboard)/therapist/earnings/page.tsx`) | eSewa, Khalti, Bank transfer (hardcoded) | ❌ Display-only; mock payout history + destinations |
| Admin payments page | Filter shows eSewa / Khalti / Cash / Bank | ⚠️ Real list API exists (`/admin/payments`) but page & hook carry hardcoded fallback rows |
| Landing / FAQ copy (`en.ts`/`ne.ts`) | "eSewa, Khalti, and cash on visit" | — |

---

## 2. Booking payment flow (the real one)

Flow for a patient booking a session (`POST /api/v1/payments/process`, router
`pvc-api/app/routers/payments.py`):

1. Session is created first (`create_session`). For **gateway** methods the
   session starts as `PENDING_HOLD` and the slot is **not** considered booked.
   For **manual** methods the session is `SCHEDULED` immediately (legacy).
2. A `Payment` row is created: `PENDING` for gateway methods, `COMPLETED` for
   manual methods.
3. For gateway methods the backend calls the gateway to get an initiation:
   - **eSewa** → returns a signed hidden form (`type="form"`) that the frontend
     auto-POSTs to the eSewa checkout URL.
   - **Khalti** → returns a `payment_url` (`type="redirect"`) the frontend
     navigates to (`window.location.assign`).
   - Missing credentials → 503 (gateway not configured), the hold session is
     cancelled so the slot is never leaked.
4. Gateway redirects back to `esewa_success_url` / `khalti_return_url`, both of
   which point at the Next.js webhook route:
   `src/app/api/webhooks/payments/[vendor]/route.ts`.
5. The webhook calls `POST /api/v1/payments/{payment_id}/confirm` which runs the
   gateway's `verify()`:
   - **eSewa** — decodes `?data=` base64, verifies HMAC signature, checks
     `transaction_uuid == payment.id` and amount match.
   - **Khalti** — `lookup/` with the `pidx`, resolves final status.
6. On `COMPLETED`, the `Payment` is settled and `_promote_hold_after_payment`
   lifts the `PENDING_HOLD` session to `SCHEDULED`. If the slot was taken in the
   meantime → `CONFLICT` (session cancelled, admin refund flagged).
7. User lands on `/book/confirmation` with `?status=...` (completed / failed /
   cancelled / pending / conflict).

Points redemption (`applyPoints`) runs client-side after a successful NPR
booking — unrelated to the payment rails.

---

## 3. Payment lifecycle & model

Statuses (`pvc-api/app/services/payments/gateway.py`):
`PENDING` → `COMPLETED` / `FAILED` / `CANCELLED` / `REFUNDED`

`Payment` model (`pvc-api/prisma/schema.prisma:338`):
`id, userId, amount, status, method (default "CASH"), sessionId, currency
(default "NPR"), platformFee, paymentType, transactionRef, cardLast4,
walletMobile, billingCountry, createdAt, updatedAt`

> `method` stores the **uppercased** normalized id (`ESHOPPOS`, `CASH`,
> `KHALTI`...). Seed data uses `ESHOPPOS` + `CASH`.

---

## 4. Configuration

Backend env vars (`pvc-api/app/config.py`):

**Common** — `APP_PUBLIC_URL` (public base URL for gateway return URLs),
`ESEWA_SUCCESS_URL` / `ESEWA_FAILURE_URL` / `KHALTI_RETURN_URL` (all default to
`http://localhost:3000/api/webhooks/payments/{vendor}`).

**eSewa** — `ESEWA_ENV` (`uat`|`prod`), `ESEWA_PRODUCT_CODE` (default
`EPAYTEST`), `ESEWA_SECRET_KEY` (**required — empty = gateway unavailable**).

**Khalti** — `KHALTI_ENV` (`test`|`live`), `KHALTI_SECRET_KEY` (**required**),
`KHALTI_PUBLIC_KEY` (used elsewhere/admin).

**ConnectIPS (NCHL, not yet implemented)** — `CONNECTIPS_ENV/MERCHANT_ID/
APP_ID/APP_NAME/APP_PASSWORD/PFX_PATH/PFX_PASSWORD` already reserved in config.

Admin can edit the option list via
`PUT /api/v1/settings/payment-methods` (currently no UI in the admin panel).

---

## 5. What still needs to be done by us

### 🔴 High priority / correctness
1. **Guard the UI against non-wired methods.** 7 of 9 options claim to work but
   `ManualGateway` silently completes them (recorded as `CASH`). Decide + either
   (a) disable methods outside `esewa`/`khalti` in `BookingModal`, or (b) clearly
   label them "pay on visit" / "coming soon". Currently the seed still lists them
   as normal options.
2. **ConnectIPS (NCHL) — Phase 2 rail.** Config + enumerated code exist but the
   gateway class does not. `gateway.py` explicitly warns it must NOT be added to
   `GATEWAY_METHODS` until implemented, or bookings get stuck PENDING.
3. **eSewa/Khalti live credentials + URL hardening.** UAT defaults everywhere;
   `ESEWA_SECRET_KEY` / `KHALTI_SECRET_KEY` start empty so neither gateway works
   out of the box. Confirm `success_url`/`return_url` are publicly reachable in
   production (localhost defaults will break real checkout).
4. **Refunds do not touch the gateway.** `REFUNDED` is just a status flag;
   reversing an eSewa/Khalti charge is manual (no reversal API). If needed, add
   eSewa refund / Khalti reverse to the refund admin flow.

### 🟠 Medium priority / product gaps
5. **Cart checkout is a mock.** `CartDrawer` offers eSewa / Khalti / COD but
   nothing is sent to the backend. Requires a real checkout endpoint
   (product orders + payment), or remove/hide CartDrawer checkout.
6. **International methods (Card/PayPal/Google Pay/Apple Pay) are display-only.**
   No Stripe/authorize/paypal integration. Either drop them or wire a rail
   (Stripe needs intl merchant account).
7. **FonePay** listed but never implemented (QR/mobile rail).
8. **Payouts (therapist earnings) are mocked.** "eSewa / Khalti / Bank transfer"
   destinations + payout history hardcoded in the earnings page; no
   `POST /earnings/payouts` flow persisting to the backend.
9. **Admin payments page+hook carry hardcoded fallback rows**
   (`src/hooks/useAdminPayments.ts`). Prefer the real `/admin/payments` API;
   keep fallback only as a deliberate resilience choice (document why).

### 🟡 Low priority / polish
10. **Admin UI to manage payment methods.** The `PUT /settings/payment-methods`
    endpoint exists but no admin screen can call it.
11. **Payment method icons are emoji** (`💳 🏦 📱 💵 🅿️ 🍎`) in seed + UI —
    swap for brand icons.
12. **Deal with the abandoned-hold sweep** (`expire_stale_pending_holds`) —
    confirm the interval is sane and PENDING holds are surfaced in the admin
    payment list so patients aren't charged with no booking.
13. **Dead code cleanup** — delete `src/components/booking/mockData.ts` +
    `StepPayment.tsx` (duplicate legacy payment lists) if unused.
14. **Currency switch is cosmetic** — rates just rescale the displayed NPR
    price; the gateway is only charged in ruin. Confirm this is intended.

---

## 6. Key files

**Frontend (pvc-web)**
- `src/components/modals/BookingModal.tsx` — booking + payment step, gateway hand-off
- `src/app/api/webhooks/payments/[vendor]/route.ts` — eSewa/Khalti callback → confirm → redirect
- `src/app/book/confirmation/page.tsx` — post-callback result page
- `src/services/api/payments.ts` — `confirmPayment()` / `getPaymentStatus()`
- `src/services/api/sessions.ts` — `processBooking()` → `/payments/process`
- `src/services/api/settings.ts` — `getPaymentMethods()` / `getCurrencies()`
- `src/components/modals/CartDrawer.tsx` — mock product checkout
- `src/hooks/useAdminPayments.ts`, `src/app/(dashboard)/admin/payments/page.tsx` — admin view

**Backend (pvc-api)**
- `app/routers/payments.py` — process / confirm / status / generic / admin
- `app/services/payments/` — `gateway.py`, `registry.py`, `esewa.py`, `khalti.py`, `manual.py`
- `app/routers/settings.py` — payment-methods CRUD
- `app/config.py` — gateway env config
- `scripts/seed-settings.py` — seeded payment-methods list (+ imepay pruning)
- `prisma/schema.prisma` — `Payment` model