# National (Nepal) Payment Integration Plan — Sahayatri Physio

> **Status**: Draft / planning — no gateway code in the app yet.
> **Scope**: Integrate real payment processing for NPR transactions. Three distinct rails:
> **eSewa**, **Khalti/IME** (digital wallets), and **ConnectIPS** (direct bank-to-bank, for high-value/B2B).
> Cash-on-visit stays as a manual method.
>
> This plan maps onto the existing `pvc-api` (FastAPI) + `pvc-web` (Next.js) architecture and follows
> `APIGUIDELINE.md` (server actions for mutations, server-only API layer, webhook/route-handler for callbacks).

---

## 1. Current state (what already exists)

| Layer | What's there today |
|---|---|
| DB model | `Payment` row (`pvc-api/prisma/schema.prisma`): `status`/`method` are **free-text strings**, includes `currency`, `platformFee`, `paymentType`, `transactionRef`, `cardLast4`, `walletMobile`, `billingCountry` |
| Endpoint | `POST /api/v1/payments/process` — atomically creates `Session` + `Payment`, **hardcodes `status="COMPLETED"`** — no gateway verification, no PENDING lifecycle |
| Admin | `GET /admin/payments`, `PUT /admin/payments/{id}`, stats, payouts (aggregates) |
| Settings | `GET/PUT /settings/payment-methods` — JSON array served from `Setting` table |
| Frontend | `BookingModal` (patient) + admin `StepPayment` — collect method/consume fields, call `processBooking()`; `CartDrawer` shop checkout is **entirely local/mock** (random order ID, no backend call) |
| **No gateway** | No eSewa/Khalti/ConnectIPS SDK, no webhook route, no outbound PSP HTTP call anywhere |

**Key gap:** Payments are bookkeeping-only. A session is marked paid before any money actually moves.
The rest of this plan makes the money move, and formalizes a **PENDING → COMPLETED** lifecycle
driven by gateway callbacks (not a client-trusting hardcode).

---

## 2. Gateway selection & comparison

| Criteria | eSewa (ePay v2) | Khalti/IME (KPG-2) | ConnectIPS (NCHL) |
|---|---|---|---|
| Network | eSewa wallet + linked banks/IPS | Khalti wallet + eBanking + cards + IME Pay (merged) + connectIPS | Direct bank-to-bank (all NCHL member banks), T+0 |
| Best for | Retail, low/medium value, widest wallet reach | Custom dev UX, best docs & sandbox, cards/wallets | High value (>NPR 50k), B2B, formal audit trail |
| MDR (typical) | 1.5–2.0% | 1.5–2.0% | Flat NPR 10–25 per txn |
| Settlement | T+1 to T+3 | T+1 to T+2 | Real-time / T+0 |
| Auth style | HMAC-SHA256 signature (form POST) | Bearer secret key (`Key live_secret_key_...`) | RSA-SHA256 (CREDITOR.pfx) + HTTP Basic Auth |
| Sandbox | Public UAT creds (EPAYTEST) | test-admin.khalti.com, test OTP `987654` | Requires NCHL credentials (no self-serve) |
| Startup burden | Low (public UAT creds) | Low (self-serve merchant portal) | High (NCHL + bank KYC, .pfx keys) |

**Recommendation:** Ship **eSewa + Khalti/IME first** (both low-friction, cover ~90% of retail intent).
Add **ConnectIPS later** for high-value sessions / corporate physio contracts. Each gateway is a
drop-in behind one common internal payment interface, so enabling ConnectIPS later touches only
one provider module — not the booking flow.

---

## 3. Proposed architecture

### 3.1 Payment lifecycle (PENDING → COMPLETED)

Today `POST /payments/process` immediately marks `COMPLETED`. New behavior:

```
1. PATIENT books → backend creates Session + Payment (status = PENDING, method = chosen gateway)
2. Backend builds the gateway "initiate" request → returns a redirect/checkout URL (or signed form)
3. Frontend redirects user to the hosted gateway page (nothing sensitive touches the browser)
4. User pays on the gateway's own page
5. Gateway calls our webhook/returns the user to our return_url with a signed payload
6. Backend VERIFIES with the gateway's status/lookup API (server-side, never trust the redirect alone)
7. On verified COMPLETED → mark Payment COMPLETED, fire booking-confirmed side-effects
8. On failure/cancel/pending → leave PENDING (or CANCELLED), release the slot
```

> **Anti-fraud invariant (all gateways):** the only thing that flips `status → COMPLETED` is a
> **server-side verification call to the gateway** (lookup API for Khalti; signature-verified
> callback + status check for eSewa; validate API for ConnectIPS). A user redirect or a
> client-posted "success" is never trusted on its own.

### 3.2 Backend structure (pvc-api)

Follow the existing 3-layer convention (`routers → services → Prisma`). Introduce two new concepts:

```
app/services/payments/
  gateway.py            # PaymentGateway ABC: initiate(), verify(), (refund())
  registry.py           # get_gateway(method) -> concrete gateway (esewa|khalti|connectips|manual)
  esewa.py              # ePay v2 + intent
  khalti.py             # KPG-2 epayment
  connectips.py         # RSA-signed form + validate API
  manual.py             # cash-on-visit: no-op, as today
```

- `PaymentGateway` ABC:
  - `initiate(db, payment) -> GatewayInitiation` where `GatewayInitiation = { redirect_url | form_fields, expires_at }`
  - `verify(db, payment, callback_params) -> GatewayVerification(status: COMPLETED|PENDING|FAILED, ref)`
  - `refund(db, payment) -> None` (Khalti has a refund API; eSewa/ConnectIPS refund is via merchant portal — phase 2)

- **HTTP surface changes** (`app/routers/payments.py`):
  - `POST /payments/process` → **stops** marking COMPLETED. Creates `Session` + `Payment(PENDING)`, calls `gateway.initiate()`, returns `{ session, payment, initiation }`.
  - `GET /payments/{id}/initiate` (authenticated owner) → returns the current checkout/redirect payload (lets the client resume a pending checkout on page refresh).
  - `GET /payments/{id}/status` (owner/admin) → refresh payment status from the gateway.
  - `POST /api/webhooks/payments/{vendor}` — **new public route handler** in `pvc-web` (`app/api/webhooks/...`) for gateway callbacks (see §3.4).
  - `PUT /payments/{id}/status` (admin) — retained for manual reconciliation (cash / portal-drift).

- **Prisma**: keep `Payment` free-text `status`/`method` (backwards compatible) but add a helper/constant for allowed status values `PENDING | COMPLETED | FAILED | CANCELLED | REFUNDED`. Add a nullable `gatewayRef`/`gatewayPayload` column if you want to persist the gateway's raw response for reconciliation (additive migration).

### 3.3 Frontend structure (pvc-web)

- **Server layer only** for all gateway calls (per `APIGUIDELINE.md`):
  - `src/lib/actions/payments.ts` — `initiatePayment()`, `refreshPaymentStatus()` (Server Actions)
  - `src/app/api/webhooks/payments/[vendor]/route.ts` — Route Handler receiving gateway callbacks → forwards to backend verify
- **Client** (`src/components/modals/BookingModal.tsx` `StepPayment`):
  - For **eSewa**: backend returns a signed form + endpoint; frontend renders a hidden auto-submit form (no secret key in browser).
  - For **Khalti/IME**: backend returns `payment_url`; frontend `window.location.assign()` / `router` to it.
  - For **ConnectIPS**: backend returns a signed `form_action_url` + fields; frontend renders an auto-submitting form.
  - On return (`/book/...?status=...`): call `refreshPaymentStatus()` to let the backend verify via lookup API, then show success/failure and invalidate queries (sessions, dashboard, slots).
- **Redirect strategy**: honor existing rule — use `router.*` for in-app navigation, use `window.location` only for a **full external redirect** to a gateway (outside our app) which is the single correct exception.

### 3.4 Gateway callbacks (webhooks / return URLs)

Because FastAPI lives separately from Next.js and both are on different hosts/ports in dev, define clearly where callbacks terminate:

1. **Preferred**: gateway `return_url`/callback points to a **`pvc-web` Route Handler** (`/api/webhooks/payments/[vendor]`), which:
   - verifies signature (or forwards the raw body), then
   - calls the backend's verify endpoint **server-to-server** (adds no secret to client).
   - Returns 200 fast; returns 4xx/5xx to trigger gateway retries (Khalti retries deliver callbacks).
2. **Alternative**: point return_url directly at the FastAPI backend (works when the backend is publicly reachable). Simpler, but couples callback handling into the API layer. Choose one and document the canonical public base URL in env.

> Webhook signature handling is **mandatory** for all three vendors (see §5).

---

## 4. Provider integration detail (implementation reference)

### 4.1 eSewa — ePay v2 (Web) + Intent (new)

**Credentials (from merchant panel / eSewa support):**
- `ESEWA_PRODUCT_CODE` (e.g. `EPAYTEST` in sandbox)
- `ESEWA_SECRET_KEY` (sandbox: `8gBm/:&EnhH.1/q`)
- `ESEWA_ENV=uat|prod`

**Environments:**
| | Sandbox | Production |
|---|---|---|
| Payment form | `https://rc-epay.esewa.com.np/api/epay/main/v2/form` | `https://epay.esewa.com.np/api/epay/main/v2/form` |
| Status check | `https://rc.esewa.com.np/api/epay/transaction/status/` | `https://esewa.com.np/api/epay/transaction/status/` |
| Intent book (new) | `https://rc-checkout.esewa.com.np/api/client/intent/payment/book` | `https://checkout.esewa.com.np/api/client/intent/payment/book` |

**Form fields (all required):**
`amount`, `tax_amount`, `product_service_charge`, `product_delivery_charge`,
`product_code`, `transaction_uuid`, `signed_field_names`, `signature`,
`success_url`, `failure_url`.

**Signature (HMAC-SHA256, base64):**
```
message  = total_amount=<amount>,transaction_uuid=<uuid>,product_code=<product_code>
signature = base64( HMAC-SHA256( message, secret_key ) )
```
`signed_field_names = "total_amount,transaction_uuid,product_code"` (exact order matters).

**Success callback** — eSewa redirects to `success_url?data=<base64>`:
```json
{ "transaction_code": "...", "status": "COMPLETE", "total_amount": "1000.0",
  "transaction_uuid": "...", "product_code": "...",
  "signed_field_names": "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",
  "signature": "..." }
```
Verify `signature` over the canonical signed string + cross-check `status == COMPLETE`,
`transaction_uuid == our stored uuid` (replay protection), and amount matches (tamper detection).

**Status check (defense-in-depth):**
`GET /api/epay/transaction/status/?product_code=..&total_amount=..&transaction_uuid=..` → `{ status: "COMPLETE", ... }`.

**Sandbox test users:** eSewa ID `9806800001..05`, pass `Nepal@123`, MPIN `1122`, token `123456`.

> **Recommendation:** prefer **eSewa Intent Payment** (newer) over the legacy form for mobile-friendly
> "pay in the eSewa app" UX. It POSTs to `/intent/payment/book`, returns a `booking_id` + metadata,
> and verifies via HMAC over `product_code, amount, transaction_uuid`. Keep both in the gateway module;
> ship Web ePay v2 first (simplest, works everywhere), add Intent in a follow-up PR.

### 4.2 Khalti / IME — Web Checkout (KPG-2)

> Covers Khalti wallet **and** IME Pay (merged into Khalti by IME). One merchant account, one integration.

**Credentials:** `KHALTI_LIVE_SECRET_KEY` / `KHALTI_PUBLIC_KEY` from `admin.khalti.com` (sandbox: `test-admin.khalti.com`, test OTP `987654`).

**Environments:**
- Sandbox: `https://dev.khalti.com/api/v2/`
- Production: `https://khalti.com/api/v2/`

**Initiate** — `POST /epayment/initiate/`, header `Authorization: Key <secret_key>`:
```json
{
  "return_url": "https://physiocore.com/api/webhooks/payments/khalti",
  "website_url": "https://physiocore.com",
  "amount": 130000,               // in PAISA (NPR * 100)
  "purchase_order_id": "sess_<id>",
  "purchase_order_name": "Home physio session",
  "customer_info": { "name": "...", "email": "...", "phone": "98..." }
}
```
→ `{ "pidx": "...", "payment_url": "https://pay.khalti.com/?pidx=...", "expires_in": 1800 }`
Redirect user to `payment_url`.

**Return callback** (short params on `return_url`): `pidx`, `status` (`Completed`/`Pending`/`User canceled`), `transaction_id`/`tidx`, `amount`, `purchase_order_id`, `total_amount`.

**Verify — MUST use lookup API (never trust the redirect):**
`POST /epayment/lookup/`, `{ "pidx": "..." }`, auth `Key <secret_key>`:
```json
{ "pidx": "...", "total_amount": 1000, "status": "Completed",
  "transaction_id": "...", "fee": 0, "refunded": false }
```
Only `status == "Completed"` = success. Treat `Canceled`, `Expired`, `Failed` as failure. `Pending` = hold.
Payment link expires in **60 minutes** in production.

**Refund (phase 2):** Khalti has a refund API (`/epayment/refund`).

**Sandbox:** test MPIN `1111`, test OTP `987654`, test IDs `9800000000..05`.

### 4.3 ConnectIPS (NCHL) — high value / B2B

> Highest setup friction: requires NCHL registration + **bank KYC**. Only start this after eSewa + Khalti ship.

**Credentials from NCHL (via your bank):**
- `CONNECTIPS_MERCHANT_ID` (integer)
- `CONNECTIPS_APP_ID`, `CONNECTIPS_APP_NAME`, `CONNECTIPS_APP_PASSWORD` (HTTP Basic Auth)
- `CONNECTIPS_PFX_PATH` + `CONNECTIPS_PFX_PASSWORD` — **`CREDITOR.pfx`** RSA private key (never commit; add `*.pfx` to `.gitignore`)
- `CONNECTIPS_ENV=uat|prod` (UAT: `uat.connectips.com`, prod: `connectips.com`)

**Flow:**
```
Backend builds form payload -> signs TOKEN (RSA-SHA256 over the field string with CREDITOR.pfx)
  -> returns form_action_url + UPPERCASE form fields -> frontend auto-submits
User completes bank transfer on ConnectIPS gateway
  -> redirect to callback?txnId=..&referenceId=..&txnAmt=<paisa>
Backend NEVER trusts the redirect alone -> POST validate API (HTTP Basic Auth)
  -> { status: "SUCCESS", statusDesc: "TRANSACTION SUCCESSFUL" } -> mark paid
```

**Sign form fields:** `MERCHANTID`, `APPID`, `APPNAME`, `TXNID` (unique), `TXNDATE` (`DD-MM-YYYY`), `TXNCRNCY` (`NPR`), `TXNAMT` (paisa), `REFERENCEID`, `REMARKS`, `PARTICULARS`, `TOKEN` (SHA256 digest of the `||`-joined fields, RSA-SHA256-signed with the .pfx, base64).

**Validate:** POST to ConnectIPS validate endpoint with HTTP Basic Auth → confirm `status == "SUCCESS"` before fulfilling.

**Fees:** flat (not %) — good for large amounts. **Avoid for low-value** (< NPR 5,000) — banking-portal login friction kills conversion.

---

## 5. Security & integrity checklist

- [ ] **Server-side verification is the only path to COMPLETED** (never trust a client/callback success alone).
- [ ] **Webhook/return signature verification on all gateways** (eSewa HMAC, Khalti lookup API, ConnectIPS validate API).
- [ ] **Replay protection**: cross-check `transaction_uuid`/`purchase_order_id`/`txnId` against the stored payment; reject duplicates (409).
- [ ] **Amount tamper detection**: compare gateway-returned amount to stored `Payment.amount` (±0.01 NPR).
- [ ] **Secrets never in `"use client"`**: all keys live in backend/`.env` only; frontend only receives redirect URLs / pre-signed forms. No `NEXT_PUBLIC_` for payment secrets.
- [ ] **`.pfx` and secrets in `.gitignore`**; load via env, never inline in code.
- [ ] Transaction table / reconciliation job to catch payments the callback missed (cron polls status APIs for stale PENDING rows).
- [ ] Idempotency: webhook handler must be safe to call multiple times (Khalti retries, eSewa/ConnectIPS re-pings).

---

## 6. Frontend / backend mapping against existing code

| Concern | New file (backend) | New file (frontend) | Existing to modify |
|---|---|---|---|
| Gateway ABC + registry | `app/services/payments/gateway.py`, `registry.py` | — | — |
| eSewa | `app/services/payments/esewa.py` | — | — |
| Khalti/IME | `app/services/payments/khalti.py` | — | — |
| ConnectIPS | `app/services/payments/connectips.py` | — | — |
| Cash-on-visit (no-op) | `app/services/payments/manual.py` | — | `payments.py` (keep current path) |
| Initiate/status endpoints | `app/routers/payments.py` | `src/lib/actions/payments.ts` | `sessions.ts` (`processBooking`) |
| Webhook receiver | — | `src/app/api/webhooks/payments/[vendor]/route.ts` | — |
| UI payment step | — | `src/components/modals/BookingModal.tsx` (`StepPayment`) | render signed form / redirect |
| Method list | `seed-settings.py` | `src/components/booking/mockData.ts` | unify single source (settings API) |
| Shop checkout (mock today) | add `POST /orders` (future) | `CartDrawer.tsx` | wire to real backend order+payment |

---

## 7. Rollout plan (phased)

**Phase 0 — Foundation (no gateway yet)**
- Introduce `PENDING|COMPLETED|FAILED|CANCELLED|REFUNDED` status handling; stop hardcoding COMPLETED on `process`.
- Add `gatewayRef` column (additive). Unit test the status transitions (fully mocked, per repo test conventions).

**Phase 1 — eSewa + Khalti/IME** (parallel, both low-friction)
- Implement `gateway.py` + `esewa.py` + `khalti.py`.
- `process` returns initiation; add `initiate` peek + `status` refresh endpoints; frontend redirect + post-return refresh.
- Webhook routes + signature verification + replay/amount checks.
- Test in sandbox (eSewa UAT creds; Khalti test-admin), reconcile, then flip to live keys.

**Phase 2 — ConnectIPS** (segmented rollout)
- Register with NCHL via bank, obtain credentials + `.pfx`.
- Implement `connectips.py` (RSA sign + validate).
- Enable only for high-value sessions / B2B, or as an added method after thresholds.

**Phase 3 — Shop (CartDrawer) + Refunds**
- Introduce a real backend order + payment flow for product purchases (currently fully mock).
- Khalti refund API; eSewa/ConnectIPS refund via merchant portal sync.

---

## 8. Open questions / decisions needed

1. Where callbacks terminate — `pvc-web` Route Handler (preferred) vs direct-to-FastAPI. Pick canonical callback base URL.
2. Do we hold the session slot during `PENDING` (recommended, to avoid double-booking a slot that's mid-payment) and release it on failure/timeout? This interacts with the existing anti-double-booking unique index.
3. ConnectIPS rollout target — which product(s)? High-value sessions? Corporate/B2B only?
4. VAT/invoice line — needed for B2B receipts? eSewa/Khalti support `amount_breakdown`, eSewa has `tax_amount`.
5. Merchant accounts/legal entity — which entity registers with eSewa/Khalti/NCHL? Verify NRB requirements for the business.

---

*Companion doc: `international-payment-plan.md`. After reading both, the national rails (NPR) and
international rails (see sibling) compose behind the same `gateway.py` abstraction — a payment is
either an NPR national payment or a foreign-currency international payment.*
