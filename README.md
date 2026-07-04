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
| State | React Context (auth, cart), TanStack Query |
| Charts | recharts |
| Notifications | sonner |

## Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- npm (or bun)

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

## Docker

### Development (hot reload)

```bash
docker compose up
```

### Production

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Project Structure

```
src/
  app/                     # Next.js App Router
    (dashboard)/           # Route group — authenticated pages
      admin/               # Admin dashboard (6 pages)
      patient/             # Patient dashboard (8 pages)
      therapist/           # Therapist dashboard (7 pages)
    about/                 # About page
    app/                   # App download page
    blog/                  # Blog page
    contact/               # Contact page
    faq/                   # FAQ page
    find/                  # Find a therapist page
    how-it-works/          # How it works page
    services/              # Services page
    testimonials/          # Testimonials page
    therapists/            # Therapists page
    layout.tsx             # Root layout (fonts, providers)
    page.tsx               # Landing page (hero, features, CTA)
    globals.css            # Tailwind v4 + theme
  components/
    SiteHeader.tsx         # Public site header
    SiteFooter.tsx         # Public site footer
    PageShell.tsx          # Public page wrapper
    DashboardShell.tsx     # Sidebar + header layout
    AuthModal.tsx          # Login/signup
    CartDrawer.tsx         # Shopping cart
    BookingModal.tsx       # Session booking
    Avatar.tsx             # Initials avatar
    TherapistCard.tsx      # Therapist listing card
    NotificationBell.tsx   # Notification indicator
    Reveal.tsx             # Scroll animation + CountUp
    ui/                    # shadcn/ui primitives
  lib/
    auth.tsx               # Auth (localStorage)
    cart.tsx               # Cart (localStorage)
    mock.ts                # Mock data
    nav.tsx                # Sidebar nav definitions
    i18n.tsx               # Nepali/English toggle
  hooks/
    use-mobile.tsx         # Mobile detection
```

## Auth & Data

Auth and cart are localStorage-based — no real backend. All data is mocked in `src/lib/mock.ts`:

- `THERAPISTS` — 8 physiotherapists with specialties, cities, ratings
- `PRODUCTS` — Equipment (buy/rent), medicines, nutrition
- `MOCK_SESSIONS` — Booked/completed/cancelled sessions

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
