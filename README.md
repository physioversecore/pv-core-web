# Sahayatri Physio

Nepal's home-visit physiotherapy platform connecting patients with verified physiotherapists.

## Roles

- **Patient** — Book home-visit sessions, buy/rent equipment & medicines, track recovery progress, view reports, submit complaints with evidence attachments.
- **Therapist** — Manage schedules & availability, upload session reports, track earnings, refer colleagues, request time off, file complaints against patients with evidence attachments.
- **Admin** — Approve therapists, manage patients/users, oversee bookings, payments, refunds, complaints, service areas, verification, performance reviews, safety incidents, analytics, and platform settings. Sidebar shows a live badge counting new complaints since the last visit.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, standalone output) |
| Language | TypeScript 5.8 (strict) |
| React | React 19 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI | shadcn/ui (new-york style, 47 components) + Radix UI |
| Icons | lucide-react |
| State | React Context (7 providers), TanStack Query v5 |
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

- **Login**: `/login` page — email + password, redirects by role. "Sign up" link navigates to `/signup`.
- **Signup**: `/signup` page — therapist-only signup: account form → OTP email verification → account creation → `refreshSession()` syncs auth context → redirect to `/onboarding/therapist`.
- **Therapist document upload**: Therapist signup requires uploading NMC license + certification (drag/drop or click, with live previews). Files upload via XHR to the public proxy `POST /api/uploads/therapist-application` before account creation; the returned URLs are stored as `Verification` records so admins can review them in `/admin/verification`. Admins view documents in-app (`DocumentViewer` dialog — image/iframe preview + open in new tab), and rejection requires a reason (`note`) that persists, is shown in the therapist detail sheet, and is included in the rejection email. Approval fires an account-verified email.
- **Logout**: via sidebar in dashboard — always `await logout()` before redirect
- **AuthModal**: Global modal (triggered by `openAuth()` from context) for login and signup from any page. Navbar "Log In" opens modal; "Sign Up" navigates to `/signup` page. "Book Now" opens modal with patient role pre-selected. "Apply to Join" opens modal with therapist role pre-selected.
- **OTP Verification**: Signup requires email verification via 6-digit OTP code. Backend sends branded HTML email, validates code before allowing account creation.

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
      page.tsx                  # Landing page (hero → services → partners → stats → how-it-works → featured → CTA)
      about/, app/, blog/, contact/, faq/, find-a-therapist/,
      how-it-works/, services/, testimonials/, therapist/
    book/                       # Booking route (standalone)
    (dashboard)/                # Route group — authenticated pages
      admin/                    # Admin dashboard (19 sections)
      patient/                  # Patient dashboard (9 sections)
      therapist/                # Therapist dashboard (9 sections)
    login/                      # Standalone login page
    signup/                     # Standalone signup page (role selection → OTP → account creation)
    api/                        # Route handlers (upload proxies)
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
    auth/                       # Shared auth components (SignupFlow, DocumentUploader)
    layout/                     # DashboardShell, PageShell, SiteHeader, SiteFooter
    ErrorBoundary.tsx           # Reusable error boundary
    SuspenseFallback.tsx        # Loading skeleton components
  context/                      # React contexts (7 providers)
    auth.tsx                    # Auth state + API calls
    auth-modal.tsx              # Login/signup modal state
    booking-badge.tsx           # Admin new-booking notification badge
    complaint-badge.tsx         # Admin new-complaint notification badge
    cart.tsx                    # Shopping cart (API-driven)
    design-tokens.tsx           # Dynamic theme customization
    i18n.tsx                    # Nepali/English toggle
  hooks/                        # TanStack Query hooks (41 files)
  services/api/                 # Server-only API layer (15 files)
    client.ts                   # Base HTTP client (server-only import)
    auth.ts, admin.ts, sessions.ts, therapists.ts,
    patients.ts, products.ts, cart.ts, availability.ts,
    earnings.ts, reports.ts, reviews.ts, settings.ts, profile.ts
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

Handshake-inspired design language — monochrome canvas + voltage-lime accent, pillow radii, hairline borders, no drop shadows.

**Brand tokens** (defined in `globals.css` `@theme`, used as Tailwind utilities like `bg-voltage-lime`):

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| Lime | `--color-voltage-lime` | `#d3fb52` | Brand accent, primary CTAs |
| Cyan | `--color-cyan-spark` | `#7af3ff` | Secondary accent, glows |
| Abyss | `--color-mid-abyss` | `#052326` | Deep green-black |
| Carbon | `--color-carbon-ink` | `#14151c` | Near-black ink |
| Ash | `--color-ash` | `#666666` | Muted text |

**Dark canvas** (hero + services atmosphere): `abyss-soft #1e3a2b`, `abyss-mid #112720`, `abyss-deep #0a1815` — the hero bleeds into the services section via a shared olive-charcoal gradient.

**Dark-section text hierarchy**: `ink-soft #e7e7ea`, `ink-muted #9a9aa3`, `ink-faint #85858d`, `ink-dim #b0b0b7`.

**Legacy admin tokens** (kept in `:root` for dashboard/forms): Primary `#E2962F` (amber), Secondary `#2F5D50` (forest green), Background `#FBFBF8` (cream), Foreground `#1E2A2E`, Surface `#EEF1ED` (sage).

**Fonts**: Fraunces (`font-display`, serif headings), Inter (`font-sans`, body), IBM Plex Mono (`font-mono`, mono labels/dates), Anybody (`font-anybody`, display weights).

**Dynamic theming**: Admin can customize all colors, fonts, and border radius via the Appearance section. Tokens are persisted via the API and applied in real-time.

---

## Backend

The frontend requires the `pvc-api` backend. See the `pvc-api/` repository for setup instructions.
