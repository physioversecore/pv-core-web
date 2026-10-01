# International (Cross-Border) Payment Integration Plan — Sahayatri Physio

> **Status**: Draft / planning — no gateway code in the app yet.
> **Scope**: Accept payments from **foreign customers** (tourists, NRIs, diaspora, expats booking physio
> in Nepal) in USD/EUR/etc., and get the money into the business in Nepal.
>
> This plan compares the realistic options for a Nepal-based business in 2026, recommends one path,
> and maps it onto the same `gateway.py` abstraction used by the national plan
> (`national-payment-plan.md`). Read that first for the shared architecture, security invariants,
> and `PENDING → COMPLETED` lifecycle.

---

## 1. The core problem: NRB rules & where money can settle

Domestic Nepali gateways (eSewa, Khalti, ConnectIPS, Fonepay) **cannot process payments from
foreign-issued cards** for delivery to a Nepal-based business without specific NRB authorization.
Stripe / PayPal are not legally available to **Nepal-domiciled** legal entities, and cannot settle
into NPR for an NRB-regulated local merchant. So international acceptance for "the money lands in
Nepal" needs **one of**:

1. A foreign entity that owns the Stripe/PayPal account, with funds cross-border repatriated to the
   Nepal business later — the classic "**Stripe Atlas / foreign-incorporation**" route.
2. A **local PSP that already bridges to Stripe** — Khalti's new Stripe-powered cross-border
   collection settles to the merchant in NPR. (Rolling out, Khalti by IME.)
3. A payment provider that **supports Nepal as a merchant country** and pays out to Nepal (Rapyd, Dodo).
4. **eSewa's own cross-border acceptance product** (announced; verify current availability/fees).

---

## 2. Options compared

| Option | Merchant domicile | Settlement to Nepal | Setup friction | FX / currency | Best fits |
|---|---|---|---|---|---|
| **A. Khalti/IME Stripe partnership** | Nepal | Yes — NPR in Nepal | Low (existing Khalti merchant account) | Auto-NPR at competitive rates | Fastest legal path from Nepal; reuses national plan's Khalti module |
| **B. Stripe via foreign entity (Stripe Atlas / UK/US Inc)** | Foreign entity | Via inter-company transfer / repatriation (daily/monthly) | High (incorporation, bank, compliance) | Multi-currency, native Stripe | Scale, recurring subscriptions, payouts anywhere |
| **C. Rapyd / Dodo (PSP that supports Nepal)** | Nepal (some providers) | Yes — local payout | Medium | Multi-currency | Global cards + local payout without foreign entity |
| **D. PayPal** | Foreign entity required for Nepal business | Repatriation, PayPal-Nepal constraints | Medium | USD/EUR | Freelancers/one-off; weak for Nepal-merchant payout |
| **E. eSewa cross-border acceptance** | Nepal | Yes — NPR/eSewa | Medium (verify availability + docs) | NPR | eSewa-first brands; pending product maturity |

---

### Why this ordering

- **Option A is the pragmatic recommendation**: you keep one merchant relationship (Khalti), the
  payer gets a **Stripe-hosted payment page** (Cards/Debit, Apple Pay, Google Pay, bank transfer),
  Khalti converts to NPR and settles into your Khalti wallet/account in Nepal. No foreign entity,
  no winding path back into the country. This is the lowest-friction first-cut international rail.
- **Option B is the endpoint for scale**: when international revenue is material, subscriptions or
  B2B contracts appear, or you want full multi-currency + hosted-invoice control, incorporate a
  foreign entity (Stripe Atlas — UK is the common route used by Nepal founders) and run Stripe there,
  then repatriate via **Airwallex/Wise** to your NPR account. This is legally clean but operationally
  heavier and incurs FX + transfer costs.
- **Options C/D/E are alternatives if partnership features or limits don't fit** — evaluate when
  Option A's cap/fees are known.

---

## 3. Recommended path (Option A — Khalti/Stripe cross-border) — detail

> Keep this in the **same Khalti module** as the national plan (`app/services/payments/khalti.py`),
> reusing the authorization (secret key) and the `PaymentGateway` interface.

### 3.1 Conceptual flow

```
1. Patient selects "International payment / Pay in USD/EUR" at checkout
2. Backend: initiate() -> Khalti cross-border API -> returns a Stripe-hosted checkout
3. Redirect user to the Stripe-powered payment page (Visa/MC/Amex, Apple Pay, Google Pay, bank)
4. Khalti webhook / lookup confirms completion; Khalti converts to NPR and settles to your account
5. Backend verify() (Khalti lookup) -> mark payment COMPLETED (NPR amount recorded)
```

### 3.2 What to confirm with Khalti (before coding)

- Merchant eligibility (available to Khalti business merchants; may need KYC/agreement).
- **Settlement currency & receipt**: you receive NPR (converted) — confirm the receivable shows USD/EUR origin for accounting.
- **Payer Sender Limits**: Khalti's current cross-border feature has per-request amount/identity gates (liveness + document check on first payment to an email). Ensure our physio-session amounts fit; note repeat payers skip re-verification.
- **Fee / FX margin**: Khalti/Stripe margin + FX spread vs Stripe's 2.9% + $0.30; compute what you pass on to the customer in `platformFee`.
- **Refunds**: supported? via Khalti's refund API or manual.
- **Sandbox**: does Khalti expose a test environment for cross-border, or live-only?

### 3.3 Data model touchpoints

- `Payment` already stores `currency`, `billingCountry`, `transactionRef`, `platformFee` — enough for the first cut.
- Record the **original foreign amount/currency** on the payment row (add `foreignAmount`, `foreignCurrency`, or reuse `PaymentCreate`'s `billingCountry` + a `gatewayRef`) so the therapist/admin earnings view shows local NPR while the reconciliation shows the FX origin.
- Multi-currency presentation on the frontend: extend `BookingModal` currency dropdown from `getCurrencies` to also show a **converted estimate** (e.g. "≈ US$18") using backend-served rates; never hardcode an FX rate client-side.

---

## 4. Scale path (Option B — Stripe via foreign entity) — detail

> Only start this when Option A's limits/fees are confirmed and international revenue justifies the
> overhead. Typically: (1) incorporate UK Ltd (Stripe Atlas or local formation), (2) UK bank account,
> (3) Stripe UK account, (4) repatriate via Airwallex/Wise to NPR.

### 4.1 Architecture (same as national plan, new provider module)

```
app/services/payments/
  stripe.py     # Stripe Checkout (Payment Link / Checkout Session) + webhook verify
```
- **Initiate**: `Checkout Session` with `mode=payment`, `line_items`, `success_url`/`cancel_url`, `metadata` carrying `payment_id`/`session_id`.
- **Webhook** (`pvc-web/api/webhooks/payments/stripe/route.ts`): verify `Stripe-Signature` header (HMAC) with `stripe.webhooks.constructEvent(...)`, handle `checkout.session.completed` + `payment_intent.succeeded`, call the backend verify.
- **Verify**: server-side `paymentIntents.retrieve()` / rely on verified webhook as authoritative.
- **Idempotency + replay**: webhook events carry unique `id`; store processed event IDs.
- **Refunds**: `refunds.create()` via backend only (admin action).

### 4.2 Conventions for the pvc-web repo
- `src/lib/stripe.ts` — **server-only**; never import in `"use client"`.
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` in `.env` (backend `.env` for FastAPI parity).
- Checkout hosted by Stripe → redirect via `router` to the external `url` is fine (full navigation).

### 4.3 Repatriation & FX
- Periodic transfer (monthly/weekly) from the foreign Stripe payout bank → **Airwallex/Wise** → NPR. Budget FX + wire fees into unit economics; note Nepal FX window for mandatory repatriation windows (NRB).

---

## 5. What to build now vs later

| | Now (Phase 1) | Later (Phase 2) | Milestone-gated |
|---|---|---|---|
| Khalti/Stripe cross-border (Option A) | Module in `khalti.py`; checkout redirect; lookup verify; NPR settlement row | Refunds, amount caps handling | Only if international volume > 0 |
| Stripe via foreign entity (Option B) | — | Full Stripe module + webhook + repatriation | Requires incorporation + bank; decide only after Phase 1 data |
| Rapyd/Dodo / eSewa cross-border | Compare as contingency | Implement if A is blocked | Vendor confirmation |

---

## 6. Security & integrity checklist (shared with national plan)

- [ ] Server-side gateway verification is the **only** way to `COMPLETED`.
- [ ] Webhook signatures verified on every callback (Stripe `Stripe-Signature`, Khalti lookup).
- [ ] Replay protection: unique event/`txn` IDs tracked and rejected on duplicate.
- [ ] Amount + currency tamper detection against stored payment.
- [ ] No secrets in `"use client"` (only redirect URLs / checkout references).
- [ ] Reconciliation job for stale PENDING rows (poll lookup/status APIs).
- [ ] Record original foreign amount/currency for FX reconciliation.

---

## 7. Open questions / decisions needed

1. **What actually needs international payments?** Tourists / NRIs booking local home-visit physio,
   or a separate "pay in your currency" for expats? This decides whether Option A's consumer
   cross-border flow matches, vs corporate/invoiced cross-border (Option B).
2. **Do we need to collect in USD/EUR, or can we quote in NPR and let Khalti convert?** If the latter,
   Option A is nearly free — payer sees foreign currency on Stripe, you book NPR.
3. Legal entity on the Khalti merchant account — same as national plan entity, for cross-border terms.
4. Confirm Khalti's cross-border **availability, caps, fees, and sandbox** with the Khalti team before
   scheduling this work.
5. Refund policy for cross-border (chargeback risk, Khalti refund API).
6. Whether to build a currency-rate display (backend endpoint) or keep NPR-only quoting.

---

*Companion doc: `national-payment-plan.md`. Both plans converge on the same `PaymentGateway`
abstraction and `PENDING → COMPLETED` lifecycle; the international rail is simply another provider
module plus a foreign-currency/NPR-settlement nuance.*