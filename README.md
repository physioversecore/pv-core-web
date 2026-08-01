# Sahayatri Physio

Nepal's home-visit physiotherapy platform connecting patients with verified physiotherapists.

## Roles

- **Patient** — Book home-visit sessions, buy/rent equipment & medicines, track recovery progress, view reports, submit complaints.
- **Therapist** — Manage schedules & availability, upload session reports, track earnings, refer colleagues, request time off.
- **Admin** — Approve therapists, manage patients/users, oversee bookings, payments, refunds, complaints, service areas, verification, performance reviews, safety incidents, analytics, and platform settings.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, standalone output) |
| Language | TypeScript 5.8 (strict) |
| React | React 19 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI | shadcn/ui (new-york style, 47 components) + Radix UI |
| Icons | lucide-react |
| State | React Context (6 providers), TanStack Query v5 |
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
- **Signup**: `/signup` page — role selection (patient/therapist) → form → OTP email verification → account creation. Supports `?role=therapist` query param for pre-selecting therapist role.
- **Therapist document upload**: Therapist signup requires uploading NMC license + certification (drag/drop or click, with live previews). Files upload via XHR to the public proxy `POST /api/uploads/therapist-application` before account creation; the returned URLs are stored as `Verification` records so admins can preview/download them in `/admin/verification`.
- **Logout**: via sidebar in dashboard — always `await logout()` before redirect
- **AuthModal**: Global modal (triggered by `openAuth()` from context) for login and signup from any page. Navbar "Log In" opens modal; "Sign Up" navigates to `/signup` page. "Book Now" opens modal with patient role pre-selected. "Apply to Join" opens modal with therapist role pre-selected.
- **OTP Verification**: Signup requires email verification via 6-digit OTP code. Backend sends branded HTML email, validates code before allowing account creation.

## Dashboard Sections

| Role | Sections |
|---|---|
| **Admin** (20) | Overview, Therapists, Patients, Bookings, Schedules, Leave, Payments, Refunds, Complaints, Verification, Performance, Safety Incidents, Notifications, Analytics, Admin Team, Activity Log, Service Areas, Appearance, Settings |
| **Patient** (10) | Overview, Sessions, Shop, Progress, Reports, Complaints, Profile, Help, Settings |
| **Therapist** (10) | Overview, Schedule, Availability, Reports, Patients, Earnings, Complaints, Profile, Settings |

## Project Structure

```
src/
  app/                          # Next.js App Router
    (dashboard)/                # Route group — authenticated pages
      admin/                    # Admin dashboard (20 sections)
      patient/                  # Patient dashboard (10 sections)
      therapist/                # Therapist dashboard (10 sections)
    login/                      # Standalone login page
    signup/                     # Standalone signup page (role selection → OTP → account creation)
    about/, app/, blog/, book/, contact/, faq/,
    find/, how-it-works/, services/, testimonials/, therapists/
    api/                        # Route handlers (webhooks only)
    layout.tsx                  # Root layout (fonts, providers)
    providers.tsx               # Client providers wrapper
    page.tsx                    # Landing page
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
  context/                      # React contexts (6 providers)
    auth.tsx                    # Auth state + API calls
    auth-modal.tsx              # Login/signup modal state
    booking-badge.tsx           # Admin new-booking notification badge
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

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| Primary | `--color-primary` | `#E2962F` (amber) | Buttons, links, accents, CTAs |
| Secondary | `--color-secondary` | `#2F5D50` (forest green) | Secondary actions, badges |
| Background | `--color-background` | `#FBFBF8` (cream) | Page background |
| Foreground | `--color-foreground` | `#1E2A2E` (dark) | Text |
| Surface | `--color-surface` | `#EEF1ED` (sage) | Muted backgrounds |

**Fonts**: Fraunces (serif, headings), Inter (body), IBM Plex Mono (mono, labels/dates).

**Dynamic theming**: Admin can customize all colors, fonts, and border radius via the Appearance section. Tokens are persisted via the API and applied in real-time.

---

## Backend

The frontend requires the `pvc-api` backend. See the `pvc-api/` repository for setup instructions.
