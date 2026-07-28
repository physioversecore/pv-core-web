# Sahayatri Physio — Architecture

> **⚠️ STALE** — This file describes an earlier localStorage/mock phase. The app now uses a real FastAPI backend via server-only API calls. Trust `ARCHITECTURE.md` instead.

## Overview
Sahayatri Physio is a multi-role physiotherapy platform serving three user types:

- **Patients** — Book home-visit physiotherapy sessions, buy/rent equipment and medicines, track recovery progress.
- **Therapists** — Manage schedules, upload session reports, track earnings, refer colleagues.
- **Admins** — Approve therapists, manage patients, oversee bookings and payments.

The app is a fully client-rendered SPA (all dashboard pages are `"use client"`) with localStorage-based auth and cart. There is no real backend — all data is mocked in `src/lib/mock.ts`.

---

## Routes (Next.js App Router)

### Public
| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page (hero, therapist discovery, features, services, CTA) |
| `/about` | `src/app/about/page.tsx` | About page — mission, values, stats |
| `/app` | `src/app/app/page.tsx` | App download page with phone mockup |
| `/blog` | `src/app/blog/page.tsx` | Blog — recovery guides, tips |
| `/contact` | `src/app/contact/page.tsx` | Contact form + info cards |
| `/faq` | `src/app/faq/page.tsx` | FAQ accordion groups |
| `/find` | `src/app/find/page.tsx` | Find a therapist with search/filter |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | How it works — steps, guarantees |
| `/services` | `src/app/services/page.tsx` | Services — clinical care, shop |
| `/testimonials` | `src/app/testimonials/page.tsx` | Patient testimonial cards |
| `/therapists` | `src/app/therapists/page.tsx` | Featured + full therapist roster |

### Admin Dashboard (`/admin/*`)
| Route | File |
|---|---|
| `/admin` | `app/(dashboard)/admin/page.tsx` |
| `/admin/bookings` | `app/(dashboard)/admin/bookings/page.tsx` |
| `/admin/patients` | `app/(dashboard)/admin/patients/page.tsx` |
| `/admin/payments` | `app/(dashboard)/admin/payments/page.tsx` |
| `/admin/settings` | `app/(dashboard)/admin/settings/page.tsx` |
| `/admin/therapists` | `app/(dashboard)/admin/therapists/page.tsx` |

### Patient Dashboard (`/patient/*`)
| Route | File |
|---|---|
| `/patient` | `app/(dashboard)/patient/page.tsx` |
| `/patient/sessions` | `app/(dashboard)/patient/sessions/page.tsx` |
| `/patient/shop` | `app/(dashboard)/patient/shop/page.tsx` |
| `/patient/progress` | `app/(dashboard)/patient/progress/page.tsx` |
| `/patient/reports` | `app/(dashboard)/patient/reports/page.tsx` |
| `/patient/profile` | `app/(dashboard)/patient/profile/page.tsx` |
| `/patient/help` | `app/(dashboard)/patient/help/page.tsx` |
| `/patient/settings` | `app/(dashboard)/patient/settings/page.tsx` |

### Therapist Dashboard (`/therapist/*`)
| Route | File |
|---|---|
| `/therapist` | `app/(dashboard)/therapist/page.tsx` |
| `/therapist/schedule` | `app/(dashboard)/therapist/schedule/page.tsx` |
| `/therapist/reports` | `app/(dashboard)/therapist/reports/page.tsx` |
| `/therapist/patients` | `app/(dashboard)/therapist/patients/page.tsx` |
| `/therapist/earnings` | `app/(dashboard)/therapist/earnings/page.tsx` |
| `/therapist/profile` | `app/(dashboard)/therapist/profile/page.tsx` |
| `/therapist/settings` | `app/(dashboard)/therapist/settings/page.tsx` |

---

## Layout Hierarchy

```
<html>                              # src/app/layout.tsx — fonts, <Providers>
  <body>
    <Providers>                     # src/app/providers.tsx
      <QueryClientProvider>
        <AuthProvider>
          <CartProvider>
            <LangProvider>
              <Toaster />
              {children}            # → landing page (/) or dashboard layout
            </LangProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Providers>
  </body>
</html>

When pathname starts with /admin, /patient, or /therapist:

  DashboardLayout (client)          # src/app/(dashboard)/layout.tsx
    ↓ derives nav, title, showCart from usePathname()
    <DashboardShell nav={nav} title={title} showCart={showCart}>
      <page.tsx children />         # The specific dashboard page
    </DashboardShell>
```

The `(dashboard)` route group wraps all authenticated pages. Its `layout.tsx` reads `usePathname()` to determine the role (`admin`/`patient`/`therapist`), looks up the matching `NavItem[]` from `src/lib/nav.tsx`, finds the current page label for the title, and passes everything to `DashboardShell`.

---

## State Management

### Auth (`src/lib/auth.tsx`)
- **Context**: `AuthProvider` → `useAuth()`
- **Storage**: `localStorage` under key `sahayatri.user`
- **User shape**: `{ id, name, email, role, city?, phone?, specialty?, status? }`
- **Roles**: `"patient" | "therapist" | "admin"`
- **Login**: Simulated — generates a `User` from email, stores to localStorage.
- **Signup**: Creates user with appropriate role; therapists start as `"pending"`.

### Cart (`src/lib/cart.tsx`)
- **Context**: `CartProvider` → `useCart()`
- **Storage**: `localStorage` under key `sahayatri.cart`
- **Items**: Can be `"buy"`, `"rent"`, `"medicine"`, or `"nutrition"` type.
- **Rental**: Rent items have `rentalDays` (default 7); line total = `price × qty × rentalDays`.
- **Delivery**: Free above Rs 2,000, otherwise Rs 150.
- **Persistence**: Cart auto-syncs to localStorage on every change via `useEffect`.

### Language (`src/lib/i18n.tsx`)
- Context-based Nepali/English toggle.

### Server State
- `@tanstack/react-query` (`QueryClientProvider`) is wired up but no real API calls exist yet — all data is from `mock.ts`.

---

## Data Layer

### Mock Data (`src/lib/mock.ts`)

| Data | Type | Fields |
|---|---|---|
| `THERAPISTS` | `Therapist[]` | id, name, specialty, city, gender, rating, reviews, price, experience, bio |
| `PRODUCTS` | `Product[]` | id, name, category (equipment/medicine/nutrition), price, rentPerDay, inStock, emoji |
| `MOCK_SESSIONS` | `Session[]` | id, therapist, date, time, type, status, patient, address, fee |

### Nav (`src/lib/nav.tsx`)
Defines three `NavItem[]` arrays — `patientNav`, `therapistNav`, `adminNav` — each with `to`, `label`, and `icon` (lucide-react element). Used by DashboardShell for the sidebar.

---

## UI Component Architecture

### Public Layout Components
| Component | Purpose |
|---|---|
| `SiteHeader.tsx` | Fixed public header with nav links, auth buttons, scroll-aware transparent/solid modes |
| `SiteFooter.tsx` | 4-column footer with explore links, resources, app store, contact info |
| `PageShell.tsx` | Public page wrapper — renders SiteHeader, decorative hero area (eyebrow, title, subtitle), content, SiteFooter |

### Dashboard Shell (`src/components/DashboardShell.tsx`)
The main layout wrapper for all dashboard pages. Renders:
- **Sidebar**: Navigation links from `nav` prop, user avatar/name at bottom, role badge.
- **Header**: Page title, notification bell, cart icon (patient only), auth modal trigger.
- **Content area**: `{children}` from the page.

### Custom Components
| Component | Purpose |
|---|---|
| `AuthModal.tsx` | Login/signup modal with role selection, form validation |
| `Avatar.tsx` | Circular avatar showing initials from name string |
| `BookingModal.tsx` | Modal for booking sessions with therapist selection, date/time, address |
| `CartDrawer.tsx` | Slide-over drawer showing cart items, quantities, rental days, totals |
| `TherapistCard.tsx` | Card for therapist listings (photo placeholder, specialty, rating, price) |
| `NotificationBell.tsx` | Bell icon with unread count badge |
| `Reveal.tsx` | Scroll-triggered reveal animation wrapper + CountUp number animator |

### Public Pages — Shared Pattern
All public pages follow this layout:
```
PageShell
  SiteHeader (solid variant — white header)
  Hero section (gradient background, eyebrow, title, subtitle)
  <main> — Page-specific content
  SiteFooter
```
Landing page uses `SiteHeader variant="hero"` (transparent until scroll) and `SiteFooter` directly.

### shadcn/ui Primitives (`src/components/ui/`)
51 components generated via shadcn CLI. Customized with the project's theme tokens. Used across pages for inputs, dialogs, selects, tables, etc.

---

## Styling System

### Theme (CSS Custom Properties)
Defined in `src/app/globals.css` using Tailwind v4's `@theme inline`:

```
--font-display: "Fraunces" (serif, headings)
--font-sans:    "Inter" (body)
--font-mono:    "IBM Plex Mono" (code/dates)

--pine:    #2F5D50  (primary green)
--sage:    #EEF1ED  (muted background)
--amber:   #E2962F  (accent)
--forest:  #1E2A2E  (foreground/dark)
--cream:   #FBFBF8  (background/light)
--slate:   #4A5854  (muted foreground)
```

### Custom Utility Classes (defined with `@utility`)
- `btn-primary` — Amber background, white text, rounded-full, hover lift + shadow
- `btn-pine` — Pine background, white text, rounded-full
- `btn-outline` — Ghost with pine border/color, fill on hover
- `card-soft` — White card with border, 18px radius, soft shadow
- `chip` — Small label/badge, mono font, uppercase, rounded-full
- `eyebrow` — Tiny uppercase label (`font-mono text-xs text-slate`)

### CSS Animations (defined in `globals.css`)
- `marquee` — Horizontal scrolling trust strip (32s linear, pauses on hover)
- `phone-float` — Gentle vertical float for mockup phone (6s)
- `chat-float` — Subtle vertical float for chat bubble (4.5s)
- `progress-fill` — Animated progress bar width oscillation (40%-78%)
- `blob-drift` — Slow organic movement for decorative blobs (14s)
- `blob-float-a/b/c` — Floating motion for hero blobs (9s/11s/13s)
- `dot-pulse` — Pulsing glow ring (1.6s)
- `scroll-cue` — Pulsing scroll indicator (2.2s)
- `hero-gradient-bg` — Slow drifting animated gradient background (22s)
- `grain-overlay` — Subtle noise texture overlay

### Dark Mode
Supported via `.dark` class on `<html>`. Flips `--background` to `--forest` and `--foreground` to `--cream`.

---

## Key Design Decisions

1. **Route group `(dashboard)`** — All authenticated pages share a single layout that derives nav from pathname, avoiding repetitive `DashboardShell` wrapping in each page.
3. **Public pages via PageShell** — All public pages use the `PageShell` wrapper which provides `SiteHeader`, a hero section, and `SiteFooter`. The landing page uses these components directly for full control over the hero experience.
4. **No real API** — The entire app runs on localStorage and mock data. `@tanstack/react-query` is configured for future backend integration.
5. **Flat route structure** — Each role's pages are flat under their prefix (e.g., `/patient/sessions`, not `/patient/sessions/list`).
6. **No data fetching library** for the mock phase — components access context and mock data directly.
7. **LocalStorage as database** — Auth and cart persist across sessions. Data is seeded on first login.
