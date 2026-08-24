# Sahayatri Physio — Agent Instructions

## Overview

Nepal's home-visit physiotherapy platform connecting patients with verified physiotherapists. Patients book sessions, buy/rent equipment, track recovery; therapists manage schedules, upload reports, track earnings; admin manages users, bookings, payments.

**Repos**:
- `pvc-web/` — Next.js 16 frontend (this repo)
- `pvc-api/` — Python 3.13 FastAPI backend, Prisma ORM, PostgreSQL 16, Redis 7

---

## Frontend — pvc-web

**Framework**: Next.js 16.3.1 (App Router, React 19.2), `output: "standalone"`  
**Language**: TypeScript 5.8.3 (strict)  
**Styling**: Tailwind CSS v4.2.1 (`@tailwindcss/postcss`), CSS custom properties  
**State**: React Context (7 providers) + `@tanstack/react-query` v5.101.1  
**UI**: shadcn/ui 49 primitives (`src/components/ui/`, new-york style) + Radix UI  
**JWT**: jose v6 (edge/node JWT verification in `proxy.ts`)  
**Icons**: lucide-react v0.575.0  
**Notifications**: sonner v2.0.7  
**Charts**: recharts v2.15.4  
**Animation**: motion v13 (`motion/react`)  
**Forms**: react-hook-form v7.71.2 + @hookform/resolvers + zod v3.24.2  
**CSS Utilities**: class-variance-authority v0.7.1, clsx v2.1.1, tailwind-merge v3.5.0  
**Other**: date-fns, cmdk, embla-carousel-react, input-otp, react-day-picker, react-resizable-panels, vaul (drawer)

### Docs Map (this repo)

| File | Status | Contents |
|---|---|---|
| `README.md` | Current | Getting started, commands, roles, theme tokens |
| `ARCHITECTURE.md` | **Current — trust this** | Auth flows, data fetching, provider stack, error handling, badges/evidence uploads |
| `APIGUIDELINE.md` | Current | Decision tree for how the frontend talks to the backend (Server Component vs Server Action vs Route Handler) + non-negotiables |
| `PROXY-CONVENTION.md` | Applied | Next.js 16 `middleware.ts` → `proxy.ts` migration reference. The migration is DONE (`src/proxy.ts` — must sit inside `src/` next to `app/`, a root-level file is silently ignored) |
| `SEEDDATA.md` | Current | Seed users/products/sessions for the backend + API quick reference |
| `ARCHITECT.md` | ⚠️ STALE | Describes the old localStorage/mock era. Do not follow; kept for history only |

### Project Structure

```
src/
  proxy.ts                          # Route protection (Next.js 16 proxy convention — MUST be inside src/)
  app/                              # Next.js App Router
    layout.tsx                      # Root layout (fonts via <link>, <Providers>)
    providers.tsx                   # "use client" — QueryClient, DesignTokens, Lang, Auth, Cart, BookingBadge, ComplaintBadge, AuthModal, Toaster
    globals.css                     # Tailwind v4 + theme tokens + utilities
    error.tsx                       # Root error boundary
    not-found.tsx
    signup/page.tsx                 # Signup page (/signup) — therapist-only signup: account form → OTP → account creation (server-side) → loading spinner → redirect to /onboarding/therapist
    access/page.tsx                 # Unified login page (/access) — email+password, OTP, or Google; role-aware redirect
    forgot-password/page.tsx        # Forgot password flow (/forgot-password)
    onboarding/                     # Post-signup profile wizards
      therapist/page.tsx            # Therapist 4-step application wizard
      patient/page.tsx              # Patient profile completion
    book/                           # Booking route
    (public)/                       # Route group — all public pages (header/footer persist across nav)
      layout.tsx                    # Wraps with SiteHeader + SiteFooter, hero/solid variant by path
      page.tsx                      # Landing page
      about/, app/, blog/, contact/, clinics/, faq/, find-a-therapist/,
      how-it-works/, packages/, services/, testimonials/
    (dashboard)/                    # Route group — all authenticated pages
      layout.tsx                    # "use client" — role guard + ErrorBoundary + DashboardShell
      error.tsx                     # Dashboard-scoped error boundary
      loading.tsx                   # Dashboard skeleton loading fallback
      not-found.tsx
      patient/                      # 9 routes
        page.tsx, sessions/page.tsx, shop/page.tsx, progress/page.tsx,
        reports/page.tsx, complaints/page.tsx, profile/page.tsx,
        help/page.tsx, settings/page.tsx
      therapist/                    # 9 routes
        page.tsx, schedule/page.tsx, availability/page.tsx,
        reports/page.tsx, patients/page.tsx, earnings/page.tsx,
        complaints/page.tsx, profile/page.tsx, settings/page.tsx
      admin/                        # 19+ routes
        page.tsx, activity-log/page.tsx, admin-team/page.tsx,
        analytics/page.tsx, appearance/page.tsx, bookings/page.tsx,
        complaints/page.tsx, leave/page.tsx, notifications/page.tsx,
        patients/page.tsx, payments/page.tsx, performance/page.tsx,
        refunds/page.tsx, safety-incidents/page.tsx, schedules/page.tsx,
        service-areas/page.tsx, settings/page.tsx, therapists/page.tsx,
        verification/page.tsx
    api/                            # Next.js API routes (proxy layer for auth + uploads + admin settings)
      reports/route.ts              # POST — proxies FormData to backend /api/v1/reports
      uploads/therapist-application/route.ts  # POST — public XHR upload for signup documents (session=therapist-signup)
      uploads/complaint-evidence/route.ts     # POST — public XHR proxy for complaint evidence (session keyed)
      uploads/[patientId]/route.ts
      v1/auth/                      # send-otp, verify-otp, signup, send-login-otp,
                                    #   login-otp, check-email — set the JWT cookie via Set-Cookie
      v1/admin/settings/            # Design tokens GET/PUT
      v1/uploads/applications/[session]/[filename]/route.ts  # GET — serves signup docs, adds bearer from cookie
      v1/uploads/evidence/[session]/[filename]/route.ts      # GET — serves complaint evidence, adds bearer from cookie
      v1/uploads/therapists/[therapistId]/…                  # GET/POST therapist photo + documents

  components/
    layout/                         # Layout shells
      DashboardShell.tsx            # Sidebar + header layout shell (fixed sidebar, h-16 header)
      PageShell.tsx                 # Public page wrapper (header + hero + footer)
      SiteHeader.tsx                # Public site header
      SiteFooter.tsx                # Public site footer
    modals/                         # Modal/drawer components
      AuthModal.tsx                 # Login/signup modal (can be triggered from any page)
      BookingModal.tsx              # Session booking
      CancelConfirmModal.tsx, CartDrawer.tsx, RescheduleModal.tsx, SessionDrawer.tsx,
      TherapistDetailSheet.tsx, PatientDetailSheet.tsx
    auth/                           # Shared auth components
      SignupFlow.tsx                # Multi-step signup (role → form → OTP → account)
      DocumentUploader.tsx          # WhatsApp-style drag/drop document uploader (XHR w/ progress, previews, retry)
      AuthShell.tsx, GoogleIcon.tsx, OtpInput.tsx, PasswordRules.tsx, StepProgress.tsx
    common/                         # Shared components
      Avatar.tsx, LangSwitcher.tsx, NotificationBell.tsx, Reveal.tsx,
      TherapistCard.tsx, TherapistFilters.tsx, BookButton.tsx, HeroStat.tsx,
      HowItWorksSteps.tsx, PlusField.tsx, ServiceCard.tsx, AppStoreBadge.tsx
    dashboard/                      # Dashboard-specific components
      DashboardStat.tsx, EmptyTableRow.tsx, ReferralCard.tsx,
      SectionHeader.tsx, StatusBadge.tsx
    sections/                       # Landing page sections
      HeroSection.tsx, PartnersMarquee.tsx,
      HowItWorksStep.tsx, ServicesSection.tsx,
      FindTherapistSection.tsx, AppDownloadSection.tsx, TherapistCTA.tsx
    schedule/, sessions/, availability/, booking/, tables/
    ErrorBoundary.tsx               # Reusable class-based error boundary
    SuspenseFallback.tsx            # Skeleton components (StatsSkeleton, CardSkeleton, etc.)
    ui/                             # 49 shadcn/ui primitives (new-york style)
      accordion, alert-dialog, alert, aspect-ratio, avatar, badge,
      breadcrumb, button, calendar, card, carousel, chart, checkbox,
      collapsible, command, context-menu, date-picker, dialog, drawer,
      dropdown-menu, form, hover-card, input-otp, input, label,
      menubar, navigation-menu, pagination, popover, progress,
      radio-group, resizable, scroll-area, select, separator, sheet,
      sidebar, skeleton, slider, sonner, switch, table, tabs, textarea,
      toggle-group, toggle, tooltip

  context/                          # 7 React context providers
    auth.tsx                        # Auth state + API calls (JWT, API-driven)
    auth-modal.tsx                  # Auth modal open/close state + onLoginSuccess callback
    booking-badge.tsx               # Admin new-booking notification badge count
    complaint-badge.tsx             # Admin new-complaint notification badge count
    cart.tsx                        # Cart context (API-driven, optimistic updates)
    i18n.tsx                        # Internationalization (Nepali/English)
    design-tokens.tsx               # Runtime theme customization (colors, fonts, radii)

  hooks/                            # 45 custom hooks
    useAuth.ts, useCart.ts, useAuthModal.ts  # Re-exports from context
    usePatientDashboard.ts, usePatientReferral.ts, usePatientComplaints.ts,
    usePatientReports.ts
    useTherapistDashboard.ts, useTherapistEarnings.ts, useTherapistSchedule.ts,
    useTherapistProfile.ts
    useTherapistPatients.ts, useTherapistComplaints.ts, useTherapists.ts
    useTherapistsToRate.ts, useSessions.ts, useBooking.ts, useProducts.ts
    useClinics.ts                   # React Query hook for clinic data
    usePackages.ts, useServices.ts  # Packages + service catalog hooks
    useManageAvailability.ts        # Availability management (578 lines, largest hook)
    useAdmin*.ts                    # 18 admin hooks (activity-log, analytics, bookings,
                                    #   complaints, dashboard, incidents, leaves,
                                    #   notifications, patients, payments, payment-stats,
                                    #   payouts, performance, refunds, service-areas,
                                    #   team, therapists, verifications)
    usePagination.ts, useTableSort.ts, useDebounce.ts, use-mobile.ts / use-mobile.tsx

  lib/
    actions/                        # Server actions ("use server") — thin re-exports
      auth.ts, cart.ts, products.ts, profile.ts, sessions.ts, therapists.ts
    api.ts                          # Legacy API client (duplicate of services/api/client.ts)
    session.ts                      # Cookie token helpers (duplicate of services/api/session.ts)
    format.ts                       # Date/time/NPR formatters
    utils.ts                        # cn() helper
    constants.ts, types.ts, nav.tsx # Re-exports
    landing-data.ts                 # Landing page static data
    error-capture.ts, error-page.ts, lovable-error-reporting.ts

  services/api/                     # API service layer (21 files, all "use server")
    client.ts                       # Fetch client with Bearer token → backend /api/v1
    session.ts                      # Cookie get/set/remove (sahayatri.session)
    auth-constants.ts               # UserRole type, ROLE_ROUTE map, public prefixes, path helpers
    auth-session.ts                 # verifySession() — jose jwtVerify used by proxy.ts
    session-client.ts               # Client-side cookie removal (logout from browser)
    auth.ts, patients.ts, sessions.ts, therapists.ts, products.ts,
    cart.ts, admin.ts, availability.ts, earnings.ts, profile.ts,
    reports.ts, reviews.ts, settings.ts, clinics.ts, packages.ts, services.ts

  services/
    auth-flow.ts                    # Client-side auth calls → Next.js route handlers
                                    #   (sendOtp, verifyOtp, sendLoginOtp, loginWithOtp, googleAuth)

  constants/                        # CITIES, SPECIALTIES, navigation (patientNav 9, therapistNav 9, adminNav 17 grouped)
  types/                            # TypeScript types (Therapist, Product, Session, Role, User, NavItem, Complaint, etc.)
  utils/                            # cn(), format(), error helpers
  translations/                     # en.ts + ne.ts (~1300 lines each)
```

### Auth & Signup Flow

- **Auth is API-driven** — JWT tokens stored in HTTP-only cookie `sahayatri.session`.
- **Login**: `/access` page — unified login (email + password, email OTP, or Google). No role selector. On success, `router.replace()` navigates to `/${user.role}` or `callbackUrl`. Logged-in users hitting `/access` are redirected to their role home by `proxy.ts`.
- **Signup**: `/signup` page — therapist-only signup: account form (first name, last name, email, password) → OTP email verification → account creation (server-side `AuthService.signup()` → `setToken()` sets cookie directly) → loading spinner → `router.push("/onboarding/therapist")`. Uses `redirected.current = true` guard before `signupTherapist()` to prevent the redirect `useEffect` from firing a competing `router.replace`.
- **Therapist approval gate**: Therapist signup issues a JWT token. Account is created with `status = PENDING` ("under review") and a branded "application received" email is sent to their email (templates/`application_received.html`) stating it will be verified within 24 hours. The therapist is redirected to `/onboarding/therapist` to complete their profile. Admin verifies their documents in `/admin/verification` (Approve → verification `Verified` → user `status = APPROVED`). Approving also fires an account-verified email; rejecting fires a rejection email that includes the admin's `note` reason. Non-approved therapist login → 403 (toast shows `auth.loginUnderReview`/`auth.loginRejected`). Backend `get_current_user` also rejects non-`APPROVED` therapists (401).
- **Public therapist listings are verified-only** (server-side filter, no frontend flag): `GET /therapists` returns only therapists whose linked user is `APPROVED`, so the FeatureCarousel, hero "Available today" strip, `/find-a-therapist`, and patient booking selects never show under-review/suspended therapists. `GET /therapists/{id}` returns 404 for unverified profiles unless the caller is the owner or an Admin (anonymous browsing still works for approved ones).
- **Therapist success screen**: after signup, therapist is issued a token, auth context is synced via `signupTherapist()` (which calls `setToken()` server-side), and navigated to `/onboarding/therapist` to complete their professional profile (4-step wizard: Personal → Professional → Documents → Review → Submit application). Patients still get a token and auto-login.
- **Therapist documents**: Before submitting the therapist application, `SignupFlow` renders two `DocumentUploader` instances (NMC license + certification). Files upload via XHR to the public proxy `POST /api/uploads/therapist-application` (session=`therapist-signup`); returned relative URLs are embedded in the signup payload as `documents: [{documentType, url, fileName, fileSize}]`. Backend creates a `Verification` row per document (status `Pending review`) → shown in admin `/admin/verification` with preview/download (served via `GET /api/v1/uploads/applications/{session}/{filename}`, proxied by the frontend route handler which adds the bearer cookie).
- **Admin document review**: `/admin/verification` and the therapist detail sheet (`TherapistDetailSheet.tsx`) let the admin view documents in-app via a `DocumentViewer` Dialog (`<img>` for image extensions, `<iframe>` otherwise, "Open in new tab" link). `AdminVerificationData`/`AdminTherapistDocument` carry an optional `note` (rejection reason); the Review drawer requires a reason before rejecting, and it's shown in a red "Rejection reason" box in the detail sheet + preview modal. `useAdminVerifications.ts` optimistically patches the list with `queryClient.setQueriesData` on approve/reject/edit and invalidates the query on success, so the table refreshes immediately after an action.
- **AuthModal**: Global modal (triggered by `openAuth()`) for login/signup from any page. "Book Now" opens modal with patient role pre-selected. "Apply to Join" opens modal with therapist role pre-selected.
- **OTP Verification**: Signup requires email verification via 6-digit OTP code. Backend sends branded HTML email, validates code before allowing account creation.
- **Logout**: `DashboardShell`'s `handleLogout` is `async` — always `await logout()` before redirect.
- **Redirect strategy**: Always `router.replace()` or `router.push()` — never `window.location.href`.
- **Role guard**: `(dashboard)/layout.tsx` checks `user.role` against path prefix. If no user, redirects to `/access?callbackUrl=...`.
- **Proxy** (`src/proxy.ts` — Next.js 16 convention replacing `middleware.ts`; must sit inside `src/` next to `app/`, a root-level file is silently ignored): Verifies the JWT **signature** (not just expiry) via `verifySession()` (`src/services/api/auth-session.ts`, jose `jwtVerify` with `SECRET_KEY`/`JWT_SECRET` env — must match the backend's `SECRET_KEY`). Behavior:
  - Protected prefixes `/patient`, `/therapist`, `/admin` — no token or invalid → redirect `/access?callbackUrl=...`; role mismatch → redirect to the user's own role home.
  - `/onboarding/*` is gated by role (`ONBOARDING_ROLE_MAP`) — a therapist token can't open `/onboarding/patient` and vice versa.
  - `/access`, `/signup`, `/forgot-password`, `/reset-password` are public; logged-in users on `/access` are redirected to their role home (invalid cookie is cleared).
  - Callback paths must start with a single `/` (`isSafeCallbackPath` blocks protocol-relative `//`).

### Complaints (Patient / Therapist / Admin)

- **Filing**: Patients and therapists file complaints from their dashboard pages (`/patient/complaints`, `/therapist/complaints`) with category, priority (auto-derived from category), description (min 20 chars), preferred outcome, and up to **3 evidence files**.
- **Evidence upload**: Attached files upload via fetch to the public proxy `POST /api/uploads/complaint-evidence` with a client-generated `session` key (`complaint-<ts>-<rand>`). The proxy forwards FormData to backend `POST /api/v1/uploads/complaint-evidence`; returned relative URLs `/api/v1/uploads/evidence/{session}/{filename}` (with original name via `?name=`) are embedded in the payload as `evidenceUrls`. Evidence is served to admins via the `GET /api/v1/uploads/evidence/[session]/[filename]` route handler (adds bearer cookie) and previewed in-app with `PreviewDialog` (`src/components/PreviewDialog.tsx`).
- **Therapist form UX**: Patient select cascades into a patient-filtered booking select; a `submittingRef` guard prevents double submits; the form no longer unmounts to a confirmation screen (uses toasts instead). `useTherapistComplaints` is now `enabled` by default and `invalidateQueries` on success (the hardcoded `enabled: false` + `refetchQueries` + page-level toast were removed).
- **Admin side**: `/admin/complaints` lists complaints in tabs (Patient/Therapist), with export CSV (no leading ID column). The sidebar `/admin/complaints` link shows a live badge (see `complaint-badge.tsx` below).
- **Admin new-complaint badge**: `ComplaintBadgeProvider` (root provider) polls `getNewComplaintCount(since)` → `GET /admin/complaints/new-count?since=` every 30s for admins; `since` is `localStorage["admin_last_complaint_visit"]` (set on first admin login) and is reset via `resetComplaintCount()` when the admin opens `/admin/complaints` (`(dashboard)/layout.tsx`). The count is injected into the admin nav item via `navWithBadges` and rendered by `DashboardShell` as an amber pill. Mirrors `BookingBadgeProvider` exactly.

### Auth Context (`src/context/auth.tsx`)

```typescript
interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<User>;
  signupPatient: (data) => Promise<User>;
  signupTherapist: (data) => Promise<User>;
  loginWithGoogle: (credential: string, role?: string) => Promise<User>;
  loginWithOtp: (email: string, code: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

- `User`: `{ id, name, email, role: Role, city?, phone?, specialty?, status? }`
- On mount, calls `AuthService.getSession()` to restore session from cookie
- `login()` and `signup*()` return `Promise<User>` — caller uses returned user for redirect
- `signupPatient()` and `signupTherapist()` call server-side `AuthService.signup()` → `setToken()` sets the JWT cookie directly on the server, guaranteeing the cookie is available to subsequent server actions (e.g. onboarding page API calls like `getApplicationStatus`)
- `refreshSession()` re-fetches `GET /auth/me` and updates the user state **only if the response is non-null** (prevents clobbering user with null on transient failures or blocked therapists)
- `loginWithGoogle()` and `loginWithOtp()` use client-side `auth-flow.ts` functions that go through Next.js route handlers (which set the cookie via `Set-Cookie` header)
- Context variable named `Ctx`, provider `AuthProvider`, hook `useAuth()`

### Provider Tree Order

```
QueryClientProvider > DesignTokensProvider > LangProvider > AuthProvider > CartProvider > BookingBadgeProvider > ComplaintBadgeProvider > AuthModalProvider > {children} + Toaster
```

### Data Fetching Pattern

All API calls through `src/services/api/` (server-only functions). Hooks use `@tanstack/react-query` v5:

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
export function usePatientDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: () => getPatientDashboard(),
  });
  return { dashboard: data ?? null, isLoading, error };
}
```

Mutations invalidate related queries on success. `AuthError` caught in service layer → graceful fallbacks.

### Error Handling

- `ErrorBoundary` (class-based, `src/components/ErrorBoundary.tsx`) wraps dashboard layout and individual sections
- `useSuspenseQuery` NOT used — server actions trigger router state updates incompatible with Suspense
- `<Suspense>` boundaries exist at section level as inert wrappers
- `loading.tsx` uses `DashboardPageSkeleton` for initial page navigation

### Styling

- **Editorial design system** (monochrome canvas + voltage lime accent, pillow radii, no drop shadows — hairline `#e5e5e5` borders only, `#14151c` carbon ink text on white `#ffffff`)
- Brand tokens (`globals.css` `@theme` → Tailwind utilities): `voltage-lime` (#d3fb52), `cyan-spark` (#7af3ff), `mid-abyss` (#052326), `carbon-ink` (#14151c), `pure-white` (#ffffff), `true-black` (#000000), `ash` (#666666), `hairline` (#e5e5e5)
- Dark-canvas tokens: `abyss-soft` (#1e3a2b), `abyss-mid` (#112720), `abyss-deep` (#0a1815) — the landing page wraps `HeroSection` + `ServicesSection` in `.home-background`: one shared continuous atmosphere (vh-anchored olive-charcoal vertical base `abyss-soft → abyss-mid → abyss-deep → mid-abyss` + a green radial glow centered on hero content fading out ~110–120vh past the hero boundary). Both sections are transparent; no seam, no clipped glow
- Dark-section text hierarchy: `ink-soft` (#e7e7ea), `ink-muted` (#9a9aa3), `ink-faint` (#85858d), `ink-dim` (#b0b0b7)
- Legacy admin tokens (kept in `:root` for dashboard/forms): `--color-primary` (#E2962F amber), `--color-secondary` (#2F5D50 forest), `--color-background` (#FBFBF8 cream), `--color-surface` (#EEF1ED sage), `--color-text` (#1E2A2E)
- Fonts (loaded via Google Fonts `<link>` in `layout.tsx`): Fraunces (`font-display`), Inter (`font-sans`), IBM Plex Mono (`font-mono`), Anybody (`font-anybody`); `--font-noigrotesk`/`--font-sansplomb`/`--font-arial` are declared in `@theme` but NOT loaded; `body` uses `font-feature-settings: "ss03" 1, "ss06" 1, "ss12" 1` (NoiGrotesk-style)
- **Dark mode dropped** — no `.dark` variant; use `--color-mid-abyss`/`bg-carbon`/`.home-background` blocks for dark sections
- Radii chain derives from `var(--radius)` (admin slider, default 0.5rem): buttons 8px, cards 24px (`rounded-2xl`), inputs 24px (`rounded-2xl`), tags 9999px
- Legacy brutalist class names kept but re-skinned: `btn-volt` (lime solid), `btn-carbon` (carbon-ink solid), `btn-outline-ink` (ghost 1px ink border), `card-neo` (white + hairline + 24px), `chip-volt/mint/sand` (pills), `input-neo` (24px radius), `label-ink` (sans medium), `grid-bg` (subtle 32px grid)
- Utility classes in `globals.css`: `btn-primary`, `btn-secondary`, `btn-outline`, `card-soft`, `chip`, `eyebrow`, `badge-*`, `tabs-filter`, `stats-grid`, `table-header`, `hatch-past`, `hatch-blocked`, `home-background` (shared hero+services dark canvas w/ lime glow, content z-index 1)
- **Feature visual system**: `.feature-visual` containers (`.feature-visual-a`, `-b`, `-c`) with `overflow: hidden`, `width: 100%; max-width: 100%`, rounded corners, layered radial gradient `::before` backgrounds, subtle grid overlay (`.feature-visual-grid`). Used by `ServiceStackVisual`, `SearchVisual`, `BookingVisual`, `RecoveryVisual`
- Landing order: `HeroSection` → i18n heading (`landing.featuredTherapistsEyebrow`/`Title`) + `FeatureCarousel` → `ServicesSection` (all inside `.home-background`; services = premium dark "opportunity grid", 4-col, lime CTA → `/services`) → `PartnersMarquee` → `HowItWorksSection` → `TherapistCTA`
- **FeatureCarousel** (`src/components/ui/feature-carousel.tsx`, uses `motion/react`): therapist showcase carousel fed by the landing page query — server-side paginated (`getTherapists({ skip: 0, limit: 10 })`, scoped cache key `["therapists", "featured-carousel", 10]` so the shared full-list key stays untouched). Desktop (lg+): left `mid-abyss` wheel panel with name chips (click to jump); below lg the panel is hidden (`hidden lg:flex`). Cards show therapist photo (Unsplash fallback), specialty badge (top-left), price-per-session + rating pill, and name + Book button wired to `useBooking` → `BookingModal`. Autoplay (3s) pauses on hover over chips or cards
- Hero search: `HeroSection` `router.push()`es to `/find-a-therapist?q=<query>` on submit; specialty pills push `?q=<value>&specialty=<value>`. The find page reads `useSearchParams()` (wrapped in `<Suspense>`) to seed `q`/`spec`

### Hero Section (Restructured)

- Side-by-side layout on desktop: `lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]`
- Right visual panel: image card (`hero-care.jpg`), floating NMC verified card, floating 4.8 rating card, decorative concentric rings
- "Available today" strip: 4 shuffled therapist mini-cards from API (`queryKey: "hero-featured-therapists"`), Fisher-Yates shuffle on top 10, picks 4 (different per page load)
- Mini-cards use `TherapistJobCard`-style dark theme (`bg-white/[0.04]`, `border-white/10`), `Avatar` at `size={56}`
- Hero heading: `clamp(32px, 5.5vw, 80px)`, `lineHeight: 1`. Section: `pt-36 lg:pt-48 pb-16`
- `hero-care.jpg` in `public/` (112KB, physiotherapist guiding elderly Nepali woman)

### Clinics Page (`/clinics`)

- `PageShell` + grid of clinic cards (`Building2` icon, name, address with `MapPin`, service pills, `Clock` hours, `Phone` number)
- Data: `src/constants/landing.ts` — 5 mock clinics (`ClinicData` type + `clinics` array)
- API: `src/services/api/clinics.ts` — mock `"use server"` returning static data
- Hook: `src/hooks/useClinics.ts` — React Query hook
- Type: `src/types/index.ts` — `Clinic` interface
- Nav link: `src/constants/navigation.tsx` — `NAV_LINKS` includes `{ to: "/clinics", label: "Clinics" }`
- Grid uses `[grid-auto-rows:1fr]` for equal-height cards; `Reveal` + inner card both `h-full`
- Cards: `border border-border bg-white p-6 hover:shadow-md hover:border-voltage-lime/30`
- i18n: `clinics.eyebrow`, `clinics.title`, `clinics.subtitle`, `clinics.noResults` (en + ne)
- `nav.clinics` key in both `en.ts` and `ne.ts`; mapped in both `SiteHeader` and `SiteFooter` `navLabel()` functions

### SiteHeader — Mobile Menu Behavior

- Mobile drawer: `bg-mid-abyss/92` with `max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain`
- **Scroll lock**: `useEffect` sets `overflow: hidden` on `<html>` + `<body>`, `touch-action: none` on `<body>` when open; restores on cleanup with `window.scrollTo(0, scrollY)`
- **Backdrop**: `fixed inset-0 z-30 bg-black/40` behind the drawer (`z-40`), captures clicks and closes menu
- **Header bar**: `relative z-30` — sits above the backdrop (`z-20`) but below the drawer (`z-40`)
- **Click-to-close**: `onClick={() => setMobileOpen(false)}` on the drawer container — works even for same-page links (the `pathname` effect doesn't fire when path doesn't change)
- No `position: fixed` on body — that breaks pointer events on fixed-position children like the header
- All colors use CSS vars (`voltage-lime`, `mid-abyss`, `carbon-ink`) — no hardcoded hex/rgba values

### Important Rules (Frontend)

- No `window.location.href` — use `router.replace()` or `router.push()`
- Always `await logout()` before redirect
- Guard `useEffect` redirects with `useRef` to prevent double-redirect races. When explicitly navigating from a handler (e.g. after signup), set `redirected.current = true` before the async call so the `useEffect` guard does not fire a competing `router.replace`.
- Wrap data-fetching sections in `<ErrorBoundary><Suspense fallback={...}>`
- Session status mapping: backend returns `SCHEDULED`/`COMPLETED`/`CANCELLED`; use `mapSessionStatus()` from `src/lib/format.ts`
- Currency: `npr()` from `src/lib/format.ts` for NPR formatting (`Rs X,XXX`)
- i18n: all user-facing strings through `useLang()` → `t("key")`. Keys in `src/translations/en.ts` and `ne.ts`
- Duplicate files: `src/lib/api.ts` ≈ `src/services/api/client.ts`, `src/lib/session.ts` ≈ `src/services/api/session.ts`. Prefer `src/services/api/`
- Admin hooks provide hardcoded fallback data when API calls fail — intentional for resilience

### API Calling Guidelines (from `APIGUIDELINE.md`)

Core principle: **never call the backend directly from client-side JavaScript**. All backend calls go through the Next.js server layer.

Decision order for every new feature:

1. **Data needed to render the page on initial load?** → Server Component with direct `fetch()` (`cache: "no-store"` for time-sensitive data like slots/availability).
2. **User action that mutates data** (book, cancel, reschedule, submit form)? → Server Action. Re-check auth inside the action; let the backend do the final availability/lock check (double-booking safety); `revalidatePath`/`revalidateTag` after success; return structured `{ success, error }`.
3. **External caller** (payment webhook, mobile app, partner)? → Route Handler (`app/api/...`). Verify webhook signatures.
4. **Genuinely live/real-time** (map tracking, chat)? → Client fetch allowed but **only against our own Route Handler**, never the raw backend URL.

Non-negotiables:
- No non-`NEXT_PUBLIC_` env vars or secrets in `"use client"` files
- Auth/session validated server-side on every render/action — never trust the UI
- PHI/health-intake data only flows through Server Components/Actions
- Booking/scheduling mutations via Server Actions (slot-locking server-side)
- Revalidate after every mutation

### Seed Data & Dev Credentials (from `SEEDDATA.md`)

Backend seeds 14 users + 8 therapist profiles (`pvc-api/scripts/seed-users.py`; `seed-all.py` covers products/sessions/reports/etc.). All passwords: `password123`.

| Account | Email | Role |
|---|---|---|
| John Doe | `patient@test.com` | PATIENT |
| Dr. Jane Smith | `therapist@test.com` | THERAPIST |
| Admin User | `admin@test.com` | ADMIN |

Other patients: `ramesh@`, `sita@`, `hari@test.com`. Other therapists: `aarati@`, `bibek@`, `sushmita@`, `nirajan@`, `sabina@`, `rajan@`, `priya@`, `anil@test.com`.

Seed run: `cd pvc-api && uv sync && docker compose up -d db && uv run python scripts/seed-users.py`

Static UI constants: cities = Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, Biratnagar; specialties are free-text strings (not DB enums).

---

## Backend — pvc-api

### Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Python 3.13 |
| Framework | FastAPI (async) |
| ORM | Prisma (Python client) |
| Database | PostgreSQL 16 |
| Cache/Rate Limiting | Redis 7 |
| Auth | JWT (python-jose) + bcrypt |
| Package mgr | uv (Astral) |
| Validation | Pydantic v2 |
| Testing | pytest + pytest-asyncio (fully mocked, no DB needed) |

### Architecture (3-layer)

```
routers/ → services/ → Prisma ORM
```

- **Routers** (19 files) — Handle HTTP concerns (parsing, validation, status codes, response shapes). Delegate all logic to services.
- **Services** (26 files) — Business logic and Prisma queries. No HTTP awareness.
- **Models** (23 files) — Pure Pydantic request/response schemas. No DB or HTTP logic.
- **Re-exports**: `app/__init__.py` re-exports all public symbols. Consumers always `from app import X`.

### Project Structure

```
main.py                     # CLI entrypoint (uvicorn with hot reload)
app/
  main.py                   # FastAPI app, CORS, lifespan, router includes, rate limit middleware
  config.py                 # pydantic-settings (reads .env) — Redis & rate limit config
  database.py               # Prisma client singleton
  deps.py                   # JWT auth deps, pagination, get_or_404
  exceptions.py             # Global exception handlers
  logging_config.py         # Structured (JSON) + Dev (colored) formatters
  middleware.py             # RequestIDMiddleware (X-Request-ID, X-Response-Time)
  models/                   # Pydantic request/response schemas (23 files)
  routers/                  # API route handlers (19 files: auth, patients,
                            #   therapist_application, therapists, earnings, sessions,
                            #   products, cart, payments, admin, admin_extras, reports,
                            #   uploads, reviews, settings, availability, service,
                            #   clinics, packages)
  services/                 # Business logic layer (26 files, incl. google_auth,
                            #   onboarding, complaint, refund, service_area,
                            #   verification, activity_log, clinic, package)
  services/email/           # Email provider system (abstract base + SMTP + log fallback
                            #   + fire-and-forget dispatch + notifications)
    base.py                 # Abstract EmailProvider + get_email_provider() factory
    smtp.py                 # SMTPEmailProvider (production)
    log.py                  # LogEmailProvider (dev — logs OTP to console)
    dispatch.py             # dispatch_email() — background send, never raises
    notifications.py        # application received / verified / rejected emails
  templates/                # Jinja2 email templates (otp_email, application_received,
                            #   account_verified, application_rejected)
  rate_limit/               # Distributed rate limiting system (12 files)
    config.py               # Rate limit rules & configuration
    storage.py              # RedisStorage + MemoryStorage
    algorithms.py           # SlidingWindowCounter + TokenBucket
    lua_scripts.py          # Atomic Redis Lua scripts
    middleware.py           # Global ASGI middleware
    dependencies.py         # Route-level FastAPI dependency
    access_list.py          # Whitelist/blacklist with TTL
    metrics.py              # Prometheus-compatible metrics
prisma/
  schema.prisma             # ORM schema (27 models, 22 migrations)
scripts/                    # Seed scripts (17 total, incl. seed-all.py)
test/                       # Test suite (16 files, fully mocked)
Dockerfile, Dockerfile.dev, docker-compose.yml, docker-compose.prod.yml
```

### Key Reusable Dependencies (`app/deps.py`)

| Dependency | Purpose |
|---|---|
| `get_current_user` | Decode JWT, return `User` or 401 |
| `get_admin_user` | Checks `role == ADMIN` |
| `pagination_params` | `{"skip": int, "limit": int}` (defaults 0, 100; max 200) |
| `get_or_404(db, model, id)` | Generic find-or-404 for any Prisma model |

### API Endpoints (all under `/api/v1/`)

**Auth**: send-otp, verify-otp, signup, login, me (GET/PUT), change-password, logout  
**Therapists**: CRUD, me/dashboard, me/profile, {id}/slots  
**Therapist application**: me/application-status, me/application-sections, PUT me/application (onboarding wizard)  
**Sessions**: CRUD, {id}/reschedule  
**Products**: CRUD (Admin for mutations)  
**Cart**: CRUD (Patient only)  
**Payments**: process (booking+payment combo), CRUD, {id}/status (Admin)  
**Reports**: CRUD with multipart uploads  
**Reviews**: therapists-to-rate, submit, list  
**Patients**: me/profile, me/dashboard, me/referral, my-patients (Therapist)  
**Earnings**: transactions, payouts  
**Availability** (24+ endpoints): working-hours, slots, recurring, block, unblock, audit-log, block-requests (approve/reject)  
**Admin** (60+ endpoints): users, therapists, patients, bookings, complaints, service-areas, performance, verifications, refunds, activity-log, payments, payouts, notifications, team, leaves, incidents, analytics  
**Settings**: design-tokens (GET/PUT), currencies, payment-methods  
**Catalog**: services CRUD (`/services`), packages CRUD (`/packages`), clinics CRUD (`/clinics`) — public reads, admin writes  
**Uploads**: patient reports, therapist media, therapist-application (public pre-signup docs) + applications/{session}/{filename} (authenticated serving), complaint-evidence + evidence/{session}/{filename}  
**Health**: `/health` (DB + Redis), `/live`, `/ready`

### Database Schema (27 models)

Key models: `User` (role enum), `PatientProfile`, `FamilyMember`, `Therapist` (1:1 with User), `Verification`, `Product`, `Session`, `Review`, `Report`, `Payment`, `CartItem`, `Setting` (key-value store), `AvailabilitySlot`, `RecurringPattern`, `AvailabilityBlock`, `AuditLogEntry`, `ScheduleBlockRequest`, `Complaint`, `Refund`, `ServiceArea`, `TherapistServiceArea` (M2M), `ActivityLog`, `EmailVerification`, `Service`, `Clinic`, `Package`, `TherapistApplicationFeedback`.

Enums: `Role` (PATIENT/THERAPIST/ADMIN), `UserStatus` (PENDING/APPROVED/REJECTED), `ApplicationStatus`, `SessionStatus` (SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED/RESCHEDULE_REQUESTED/DECLINE_REQUESTED), `SessionType` (HOME_VISIT/CLINIC), `ProductCategory` (EQUIPMENT/MEDICINE/NUTRITION), `CartItemType` (BUY/RENT/MEDICINE/NUTRITION), `CaseSource` (PATIENT_SUBMITTED/THERAPIST_SUBMITTED/ADMIN_MANUAL), `RefundReason`, `RefundStatus` (PENDING/APPROVED/DENIED), `ServiceCategory`.

### Email Provider System

Pluggable: abstract `EmailProvider` base → `SMTPEmailProvider` (production) or `LogEmailProvider` (dev — logs OTP to console). Auto-selected based on whether `SMTP_USER` and `SMTP_PASSWORD` are set. Supports branded HTML email via Jinja2 templates. All sends are **fire-and-forget** via `dispatch_email()` on FastAPI `BackgroundTasks` — a slow/failing SMTP server never blocks signup, OTP verification, or admin approval.

**OTP Flow**: send-otp → verify-otp → signup. OTP stored in `EmailVerification` with TTL (5 min), max attempts (5), and `used` flag. Signup requires prior verified OTP record.

**Transactional emails**: OTP code (`send-otp`), "application received" (therapist signup), account verified + rejection-with-reason (admin verification actions).

**Google auth**: `app/services/google_auth.py` verifies the Google ID token credential and find-or-creates the user; frontend calls it via the Next.js route handler in `src/services/auth-flow.ts` (`googleAuth(credential, role)`).

### Rate Limiting

Distributed **Sliding Window Counter** algorithm backed by Redis. Atomic Lua scripts prevent race conditions. Fail-open on Redis failure. Global middleware + optional route-level `Depends(rate_limit(...))`. Role-based limits (ADMIN 1000/min, THERAPIST 200/min, PATIENT 100/min) and endpoint-specific limits (login 20/min, signup 10/min, payments 30/min, etc.). Returns standard `RateLimit-*` headers + `Retry-After` on 429.

### Commands

```sh
uv run python main.py                        # Start server (hot reload at :8000)
uv run pytest                                # Run all tests (fully mocked)
uv run prisma generate                       # Regenerate Prisma client after schema changes
uv run prisma db push                        # Sync schema to dev DB
uv run prisma migrate dev                    # Create migration files
docker compose up --build                    # Dev (API + PostgreSQL)
docker compose -f docker-compose.prod.yml up --build -d  # Production (+ Redis)
```

### Environment Notes

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/physioversecore` | PostgreSQL connection |
| `SECRET_KEY` | `super-secret-key-change-in-production` | JWT signing key — **must match frontend** (`SECRET_KEY`/`JWT_SECRET` in pvc-web `.env`) |
| `ALGORITHM` / `ACCESS_TOKEN_EXPIRE_MINUTES` | HS256 / 1440 | JWT algorithm + 24h expiry |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis (rate limiting) |
| `RATE_LIMIT_*` | enabled, 100 req/60s | Rate limit config; storage backend `redis` or `memory` |
| `SMTP_HOST/PORT/USER/PASSWORD/FROM_NAME/FROM_EMAIL/USE_TLS` | gmail defaults, user/pass empty | Email config — empty user/password = OTP logged to console |
| `OTP_EXPIRE_MINUTES` / `OTP_LENGTH` / `OTP_MAX_ATTEMPTS` | 5 / 6 / 5 | OTP policy |
| `CORS_ORIGINS` | `["*"]` | Allowed origins (JSON array) |

Frontend `.env`: `BACKEND_URL` (default `http://localhost:8000`) + `SECRET_KEY` (must match backend for proxy JWT verification).

Swagger at `:8000/docs`, ReDoc at `:8000/redoc`. Health check at `/health` (DB + Redis).
