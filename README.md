# Sahayatri Physio

Nepal's home-visit physiotherapy platform connecting patients with verified physiotherapists.

## Roles

- **Patient** — Book home-visit sessions, buy/rent equipment & medicines, track recovery progress, view reports, submit complaints with evidence attachments.
- **Therapist** — Manage schedules & availability, upload session reports, track earnings, refer colleagues, request time off, file complaints against patients with evidence attachments.
- **Admin** — Approve therapists, manage patients/users, oversee bookings, payments, refunds, complaints, service areas, verification, performance reviews, safety incidents, analytics, and platform settings. Sidebar shows a live badge counting new complaints since the last visit.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5.8 (strict) |
| React | React 19 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI | shadcn/ui (new-york style, 49 components) + Radix UI |
| Icons | lucide-react |
| State | React Context (9 providers), TanStack Query v5 |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Notifications | sonner |
| Dates | date-fns |
| Backend | FastAPI (separate), PostgreSQL, JWT cookie auth |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Backend API running at `BACKEND_URL` (default `http://localhost:8000`, see `pvc-api/`)

### Install & Run

```bash
npm install
npm run dev
```

The dev server binds to `physiocore.com` with experimental HTTPS. Add `127.0.0.1 physiocore.com` to `/etc/hosts` if DNS doesn't resolve locally.

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Development server (hot reload, HTTPS) |
| `npm run build` | Production build (type-check + compile) |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier auto-format |

## Auth

Auth is **API-driven** — JWT tokens stored in HTTP-only cookies (`sahayatri.session`).

- **Login**: `/access` page — unified login (email + password, OTP, or Google), redirects by role. No separate role selector.
- **Signup**: `/signup` page — therapist-only signup: account form → OTP email verification → account creation (server-side) → redirect to `/onboarding/therapist`.
- **Therapist document upload**: Therapist signup requires uploading NMC license + certification (drag/drop or click, with live previews). Files upload via XHR to the public proxy `POST /api/uploads/therapist-application` before account creation; the returned URLs are stored as `Verification` records so admins can review them in `/admin/verification`. Admins view documents in-app (`DocumentViewer` dialog — image/iframe preview + open in new tab), and rejection requires a reason (`note`) that persists, is shown in the therapist detail sheet, and is included in the rejection email. Approval fires an account-verified email.
- **Logout**: via sidebar in dashboard — always `await logout()` before redirect
- **AuthModal**: Global modal (triggered by `openAuth()` from context) for login and signup from any page. Navbar "Log In" opens modal; "Sign Up" navigates to `/signup` page. "Book Now" opens modal with patient role pre-selected. "Apply to Join" opens modal with therapist role pre-selected.
- **OTP Verification**: Signup requires email verification via 6-digit OTP code. Backend sends branded HTML email, validates code before allowing account creation.

## Payments

Booking runs a **booking + payment combo** (`POST /api/v1/payments/process`). Cash and other non-gateway methods mark the payment `COMPLETED` immediately. **eSewa** and **Khalti** (Khalti by IME — IME Pay was removed as a separate method) go through an async gateway flow:

1. `BookingModal` calls `processBooking()` (server action → `/payments/process`). For a gateway method the response includes `initiation`:
   - **eSewa** → `type: "form"` + `formFields` — the modal auto-submits a hidden form to eSewa's hosted page (`rc-epay.esewa.com.np` in UAT).
   - **Khalti** → `type: "redirect"` + `url` — the modal navigates (`window.location.assign`) to Khalti Web Checkout.
2. The user logs in and pays on the provider's page; the provider returns to our webhook route `src/app/api/webhooks/payments/[vendor]/route.ts` (eSewa POST form, Khalti GET+POST).
3. The route confirms server-side via `POST /api/v1/payments/{id}/confirm` — the only source of truth for `COMPLETED`, never the browser — then `302`s to `/book/confirmation?status=…&sessionId=…`.
4. `/book/confirmation` shows the result. Admin notifications fire on the first transition to `COMPLETED`.

- Payment methods render their **original brand marks** via `src/components/PaymentMethodIcon.tsx` (inline SVGs, no external assets). The `payment-methods` setting no longer lists `imepay` (merged into `khalti`; the backend still maps legacy `imepay` values to the Khalti rail via an alias).
- **Booking gated by login — identical everywhere**: the "Book" action behaves the same on the home "Available today" strip, the featured-therapist carousel, and `/find-a-therapist` (all via `useBooking`). Logged-out users are redirected to `/access?callbackUrl=/patient/sessions?book=<therapistId>`, and `/patient/sessions` auto-opens that specific therapist's booking modal after login.

## Dashboard Sections

| Role | Sections |
|---|---|
| **Admin** (19) | Overview, Therapists, Patients, Bookings, Schedules, Leave, Payments, Refunds, Complaints, Verification, Performance, Safety Incidents, Notifications, Analytics, Admin Team, Activity Log, Service Areas, Appearance, Settings |
| **Patient** (9) | Overview, Sessions, Shop, Progress, Reports, Complaints, Profile, Help, Settings |
| **Therapist** (9) | Overview, Schedule, Availability, Reports, Patients, Earnings, Complaints, Profile, Settings |

## Project Structure

```
src/
  app/                          # Next.js App Router
    (public)/                   # Route group — public pages (SiteHeader + SiteFooter persist)
      layout.tsx                # Header/footer wrapper, hero/solid variant by path
      page.tsx                  # Landing page (hero → featured-therapist carousel → services → partners → how-it-works → CTA)
      about/, app/, blog/, contact/, faq/, find-a-therapist/,
      how-it-works/, services/, testimonials/, therapist/
    book/                       # Booking route (standalone)
    book/confirmation/          # Post-payment result page (webhook → /book/confirmation)
    (dashboard)/                # Route group — authenticated pages
      admin/                    # Admin dashboard (19 sections)
      patient/                  # Patient dashboard (9 sections)
      therapist/                # Therapist dashboard (9 sections)
    access/                     # Unified login page (email+password, OTP, Google)
    signup/                     # Therapist signup page (account form → OTP → account creation)
    api/                        # Route handlers (upload proxies + gateway webhooks)
    api/webhooks/payments/[vendor]/route.ts  # POST/GET — eSewa/Khalti callbacks → backend confirm → 302 /book/confirmation
    api/reports/route.ts        # POST — proxies FormData to backend /api/v1/reports
    api/uploads/complaint-evidence/route.ts  # POST — public XHR proxy for complaint evidence (session keyed)
    api/v1/uploads/evidence/[session]/[filename]/route.ts  # GET — serves complaint evidence, adds bearer cookie
    api/v1/uploads/[patientId]/[filename]/route.ts         # GET — serves patient report files (token query param)
    layout.tsx                  # Root layout (fonts, providers)
    providers.tsx               # Client providers wrapper
    globals.css                 # Tailwind v4 theme + custom utilities
  components/
    ui/                         # shadcn/ui primitives (47 components)
    availability/               # Therapist availability management
    booking/                    # Multi-step booking flow
    schedule/                   # Schedule calendar views
    sessions/                   # Session display components
    tables/                     # Reusable data table (DataTable, FilterBar, etc.)
    dashboard/                  # Dashboard widgets
    common/                     # Landing page shared components
    sections/                   # Landing page sections
    modals/                     # Global modals (Auth, Booking, Cart, etc.)
    PaymentMethodIcon.tsx       # Inline-SVG brand marks for payment methods (eSewa/Khalti/PayPal/…) + neutral fallback
    auth/                       # Shared auth components (SignupFlow, DocumentUploader)
    layout/                     # DashboardShell, PageShell, SiteHeader, SiteFooter
    ErrorBoundary.tsx           # Reusable error boundary
    SuspenseFallback.tsx        # Loading skeleton components
  context/                      # React contexts (9 providers)
    auth.tsx                    # Auth state + API calls
    auth-modal.tsx              # Login/signup modal state
    booking-badge.tsx           # Admin new-booking notification badge
    complaint-badge.tsx         # Admin new-complaint notification badge
    admin-nav-badge.tsx         # Admin nav badge counts (leaves, refunds, verifications)
    cart.tsx                    # Shopping cart (API-driven)
    design-tokens.tsx           # Dynamic theme customization
    i18n.tsx                    # Nepali/English toggle
  hooks/                        # TanStack Query hooks (45 files)
  services/api/                 # Server-only API layer (21 files)
    client.ts                   # Base HTTP client (server-only import)
    auth.ts, admin.ts, sessions.ts, therapists.ts,
    patients.ts, products.ts, cart.ts, availability.ts,
    earnings.ts, reports.ts, reviews.ts, settings.ts, profile.ts,
    clinics.ts, packages.ts, services.ts, auth-session.ts,
    auth-constants.ts, session-client.ts
    # auth.ts includes: login, signup, logout, getSession, updateProfile, sendOtp, verifyOtp
  lib/
    actions/                    # Server Actions (auth, cart, products, profile, sessions, therapists)
    utils.ts                    # cn() helper (clsx + tailwind-merge)
    format.ts                   # Date/time/currency formatting
    session.ts                  # Server-side cookie management
    availability-utils.ts       # Availability helpers
  constants/                    # Navigation, cities, specialties
  translations/                 # en/ne translation files (~1300 lines each)
  types/                        # Shared TypeScript types + design tokens
```

## Theme

Warm editorial design language — Deep Forest + Warm Ivory canvas with a Muted Terracotta accent, pillow radii, hairline borders, no drop shadows.

**Brand tokens** (defined in `globals.css` `@theme`, used as Tailwind utilities like `bg-voltage-lime`):

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| Terracotta | `--color-voltage-lime` | `#d77c5f` | Warm accent / primary CTAs |
| Mineral Sage | `--color-cyan-spark` | `#c4d3c2` | Secondary accent, gentle supporting tint |
| Deep Forest | `--color-mid-abyss` | `#16443b` | Brand foreground / nav |
| Evergreen Ink | `--color-carbon-ink` | `#0d2925` | Deepest dark |
| Stone | `--color-ash` | `#68736f` | Muted text |

**Dark canvas** (hero + services atmosphere): `abyss-soft #2a5047`, `abyss-mid #123b34`, `abyss-deep #081411` — the hero bleeds into the services section via a shared forest-charcoal gradient.

**Dark-section text hierarchy**: `ink-soft #edede9`, `ink-muted #a8aaa4`, `ink-faint #858587`, `ink-dim #bcbdb7`.

**Neutral/functional tokens** (in `@theme inline`): `text #1B2523`, `text-light #4c5a55`, `text-muted #68736f`, `surface #ECEFE9`, `background #F7F5EF` (Warm Ivory), `border #e5e2da`, `input #d5d0c5`, `primary #D77C5F`, `secondary #16443B`, plus session-status tokens (`session-reschedule/decline/completed/confirmed/open/past`), warn tokens (`warn-bg`/`warn-ink`/`warn-border`/`danger`/`success`/`warning`), slot tokens, and feature gradient tints (`feature-forest`/`feature-amber`/`feature-rose`/`feature-rose-deep`). All component colors reference these variables — no hardcoded hexes in code.

**Legacy admin tokens** (kept in `:root` for dashboard/forms): Primary `#D77C5F` (terracotta), Secondary `#16443B` (deep forest), Background `#F7F5EF` (warm ivory), Foreground `#1B2523`, Surface `#ECEFE9` (soft mineral).

**Fonts**: Manrope (`font-sans`/`font-display`, single primary typeface). Weights: 400 body, 500 supporting UI, 600 nav/labels/buttons/therapist names, 700 prices/emphasis, 800 hero + major headings. `font-mono` and `font-anybody` utilities resolve to Manrope for legacy compat.

**Dynamic theming**: Admin can customize all colors, fonts, and border radius via the Appearance section. Tokens are persisted via the API and applied in real-time.

---

## Backend

The frontend requires the `pvc-api` backend. See the `pvc-api/` repository for setup instructions.
