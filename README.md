# Sahayatri Physio

Nepal's home-visit physiotherapy platform connecting patients with verified physiotherapists.

## Roles

- **Patient** — Book home-visit sessions, buy/rent equipment & medicines, track recovery progress, view reports.
- **Therapist** — Manage schedules, upload session reports, track earnings, refer colleagues.
- **Admin** — Approve therapists, manage patients/users, oversee bookings and payments.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI | shadcn/ui + lucide-react icons |
| State | React Context (auth, cart), TanStack Query v5 |
| Charts | recharts |
| Notifications | sonner |
| Backend | FastAPI (separate), PostgreSQL, JWT cookie auth |

## Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- npm (or bun)
- Backend API running at `localhost:8000` (see `pvc-api/` repo)

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Production build (type-check + compile) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Auth

Auth is **API-driven** — JWT tokens stored in HTTP-only cookies (not localStorage).

- **Login**: `/login` page — email + password, redirects by role
- **Signup**: AuthModal (modal on public pages) — patient or therapist registration
- **Logout**: via sidebar in dashboard — always awaits the API call before redirect

## Architecture Highlights

### Error Handling
- `ErrorBoundary` component wraps dashboard content at layout level and individual sections
- Next.js convention `error.tsx` at root and dashboard route group
- Each data section fails independently

### Loading States
- `loading.tsx` shows page skeleton during navigation
- Data-fetching sections use `useSuspenseQuery` with `<Suspense fallback={<Skeleton />}>`
- Skeleton components match real component layout for smooth transitions

### Dashboard Layout
- Role guard redirects wrong-role users to correct dashboard
- Fixed sidebar; only main content scrolls
- Sidebar nav derived from `usePathname()`

## Project Structure

```
src/
  app/                     # Next.js App Router
    (dashboard)/           # Route group — authenticated pages
      admin/               # Admin dashboard (6 pages)
      patient/             # Patient dashboard (8 pages)
      therapist/           # Therapist dashboard (7 pages)
    login/                 # Standalone login page
    about/, app/, blog/, contact/, faq/, find/,
    how-it-works/, services/, testimonials/, therapists/
    layout.tsx             # Root layout (fonts, providers)
    providers.tsx          # Client providers (QueryClient, Auth, Cart, Lang, Toaster)
    page.tsx               # Landing page
    globals.css            # Tailwind v4 + theme
  components/
    ErrorBoundary.tsx      # Reusable error boundary
    SuspenseFallback.tsx   # Loading skeleton components
    SiteHeader.tsx         # Public header
    SiteFooter.tsx         # Public footer
    PageShell.tsx          # Public page wrapper
    DashboardShell.tsx     # Sidebar + header layout
    AuthModal.tsx          # Signup modal (login uses /login page)
    CartDrawer.tsx         # Shopping cart slide-over
    BookingModal.tsx       # Session booking
    Avatar.tsx             # Initials avatar
    TherapistCard.tsx      # Therapist listing card
    Reveal.tsx             # Scroll animation + CountUp
    ui/                    # shadcn/ui primitives
    dashboard/             # Dashboard-specific components
    common/                # Shared components
    modals/                # Modal components
    layout/                # Layout helpers
    sections/              # Page sections
  context/
    auth.tsx               # Auth context (API-driven)
    cart.tsx               # Cart context (API-driven)
    i18n.tsx               # Nepali/English toggle
  hooks/
    usePatientDashboard.ts # + useSuspensePatientDashboard
    usePatientReferral.ts  # + useSuspensePatientReferral
    useSessions.ts         # Patient sessions
    useProducts.ts         # Shop products
    useTherapists.ts       # Therapist listing
    useAuth.ts, useCart.ts, useAuthModal.ts, useBooking.ts
    use-mobile.tsx         # Mobile detection
  lib/
    auth.tsx, cart.tsx, i18n.tsx  # Re-exported contexts
    nav.tsx                # Sidebar nav definitions
    utils.ts               # cn() helper
    types.ts               # Shared types
    constants.ts           # Cities, specialties
    error-capture.ts       # Error capture
    error-page.ts          # Error page renderer
  services/api/            # API service layer
    client.ts, auth.ts, patients.ts, sessions.ts,
    products.ts, therapists.ts, profile.ts, cart.ts
  translations/            # en/ne translation files
```

## Theme

| Token | Value | Usage |
|---|---|---|
| `pine` | `#2F5D50` | Primary (buttons, links) |
| `sage` | `#EEF1ED` | Muted backgrounds |
| `amber` | `#E2962F` | Accent (ratings) |
| `cream` | `#FBFBF8` | Page background |
| `forest` | `#1E2A2E` | Text/foreground |

Fonts: Fraunces (headings), Inter (body), IBM Plex Mono (monospace).

---

## Backend

The frontend requires the `pvc-api` backend at `http://localhost:8000`. See the `pvc-api/` repository for setup instructions.
