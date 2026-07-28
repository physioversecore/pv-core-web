# Architecture

## System Overview

The frontend is a Next.js 15 App Router application that communicates with a separate FastAPI backend (`pvc-api`). All backend calls flow through a server-only API layer — the backend URL and JWT tokens never reach the browser.

```
Browser → Next.js Server (Server Components / Server Actions) → FastAPI Backend → PostgreSQL
```

## Auth & Redirect Flow

### Login
1. User submits email + password on `/login` page or via AuthModal
2. `login()` in `src/context/auth.tsx` calls `AuthService.login()` → FastAPI returns user + sets HTTP-only JWT cookie (`sahayatri.session`)
3. On success, `handleSubmit` sets `redirected.current = true` (useRef guard), then calls `router.replace("/patient|/therapist|/admin")`
4. The `useEffect` in the login page checks `!loading && user && !redirected.current` — if a logged-in user lands on `/login`, it redirects them. The ref prevents double-redirect after a submit.

### Signup
1. User navigates to `/signup` or clicks "Book Now"/"Apply to Join" (opens AuthModal with pre-selected role)
2. Role selection screen: "I am a Patient" or "I am a Therapist" cards
3. Fills form (name, email, phone, city/specialty, password with eye toggle, terms)
4. On submit → `sendOtp(email, name)` → backend sends branded HTML email with 6-digit OTP
5. OTP input screen → user enters 6-digit code → `verifyOtp(email, code)`
6. On verification → `signupPatient()` or `signupTherapist()` → backend creates account → JWT cookie set
7. Success screen → redirect to `/patient` or `/therapist`

**Shared component**: `SignupFlow` (`src/components/auth/SignupFlow.tsx`) is used by both `/signup` page and `AuthModal`. The page renders it inline; the modal wraps it with overlay/close button.

### AuthModal
- Global modal controlled by `AuthModalProvider` context (`openAuth(mode, signupRole?)`)
- Navbar "Log In" opens modal in login mode; "Book Now" opens signup with patient role; "Apply to Join" opens signup with therapist role
- Navbar "Sign Up" navigates to `/signup` page (not modal)
- Delegates signup logic to `SignupFlow` component
- Modal login still works for quick access from any page

### Role Guard (dashboard layout)
- `(dashboard)/layout.tsx` runs a `useEffect` that reads `user.role` from auth context
- If no user and not loading → redirect `/`
- If `pathname` doesn't match `ROLE_ROUTES[user.role]` → redirect to the correct base path
- For example, a patient visiting `/admin` gets redirected to `/patient`

### Logout
- `DashboardShell.handleLogout` is `async` — `await logout()` sets `user` to null
- The dashboard layout's `useEffect` detects `!user` and redirects to `/` — no explicit redirect needed in the shell itself
- The `await` ensures `setUser(null)` fires before the layout checks the user state, preventing stale user state on the landing page

### Why `router.replace()` and not `window.location.href`
- `router.replace()` performs client-side navigation — no full page reload, no white flash
- `window.location.href` was tried (avoids stale server component state) but caused a jarring full-page reload
- The root cause of stale state was the missing `await logout()` and the double-redirect race from the `useEffect` — both now fixed

## Error Handling

### ErrorBoundary (`src/components/ErrorBoundary.tsx`)
- Class-based React component (required by React for error boundaries)
- Three fallback modes: default (error icon + "Try again"), custom ReactNode, or render function `(error, reset) => ReactNode`
- Accepts `onError` callback for logging/reporting
- Applied at **two levels**:
  - **Layout level**: `(dashboard)/layout.tsx` wraps all dashboard content — catches any uncaught render error in any dashboard page
  - **Section level**: Each data-fetching section on dashboard pages has its own `ErrorBoundary` — one section failing doesn't take down the whole page

### Next.js `error.tsx` convention
- `src/app/error.tsx` — root-level error boundary (catches errors in public pages)
- `src/app/(dashboard)/error.tsx` — dashboard-scoped error boundary (catches errors before the layout-level ErrorBoundary)

## Data Loading

### Why not `useSuspenseQuery`
The API layer uses server actions (`"use server"` in `src/services/api/`) to make HTTP requests. Server actions trigger Next.js router state updates during invocation, which conflicts with React's render phase when used inside `useSuspenseQuery`. Components use `useQuery` with manual `isLoading` handling instead.

### Pattern
Skeleton components from `SuspenseFallback.tsx` are rendered inline when `isLoading` is true:

```tsx
export function Statistics() {
  const { dashboard, isLoading } = usePatientDashboard();
  if (isLoading) return <StatsSkeleton />;
  // ... render with data
}
```

### Error handling with ErrorBoundary
```
<ErrorBoundary>
  <DataComponent />
</ErrorBoundary>
```
Each data-fetching section has its own `ErrorBoundary` — one section failing doesn't take down the whole page.

### Page-level loading
- `(dashboard)/loading.tsx` renders `DashboardPageSkeleton` — shown automatically by Next.js during initial page navigation

## Dashboard Layout

### Structure
- `(dashboard)/layout.tsx` — role guard + nav derivation + ErrorBoundary + DashboardShell
- `DashboardShell` (`src/components/layout/DashboardShell.tsx`) — fixed sidebar + top header + scrollable main area
- Sidebar is `fixed` at all breakpoints; only `<main>` scrolls (overflow-y-auto)

### Nav items
- Defined in `src/constants/navigation.tsx` with role-based arrays (`patientNav`, `therapistNav`, `adminNav`)
- Admin nav items use `group` field for sidebar section grouping (Operations, Finance, Trust & Safety, Insights, System)
- Titles are derived from `usePathname()` and translated via `useLang()`

## Data Fetching Architecture

### API Service Layer (`src/services/api/`)
- `client.ts` — base HTTP client with `Authorization: Bearer <token>` header, imports `"server-only"`
- 15 domain service files: `auth.ts`, `admin.ts`, `sessions.ts`, `therapists.ts`, `patients.ts`, `products.ts`, `cart.ts`, `availability.ts`, `earnings.ts`, `reports.ts`, `reviews.ts`, `settings.ts`, `profile.ts`, `session.ts` (cookie management)
- `auth.ts` includes: `login`, `signup`, `logout`, `getSession`, `updateProfile`, `sendOtp`, `verifyOtp`

### Server Actions (`src/lib/actions/`)
- Thin `"use server"` re-exports of service functions
- 6 action files: `auth.ts`, `sessions.ts`, `cart.ts`, `products.ts`, `therapists.ts`, `profile.ts`
- Called from client components via TanStack Query mutations

### Query Layer (`src/hooks/`)
- 41 TanStack Query hook files with `queryKey` per domain
- `useQuery` for data fetching with manual `isLoading`/`error` handling
- `useMutation` for writes (session cancel, cart updates, etc.)

### Decision Tree
| Scenario | Approach |
|---|---|
| Page data (reads) | Server Components or Server Actions |
| User mutations | Server Actions |
| Webhooks/integrations | Route Handlers (`app/api/...`) |
| Real-time (future) | Client fetch → own Route Handler (never raw backend) |

## Provider Stack

Defined in `src/app/providers.tsx`:

```
QueryClientProvider
  └─ DesignTokensProvider     # Dynamic theme (localStorage + server sync)
      └─ LangProvider          # Nepali/English toggle (localStorage)
          └─ AuthProvider       # User state (server-driven via getSession)
              └─ CartProvider   # Shopping cart (API-driven, optimistic updates)
                  └─ BookingBadgeProvider  # Admin booking notification count
                      └─ AuthModalProvider  # Login/signup modal state
```

## Styling

- Tailwind CSS v4 with `@theme inline` for design tokens
- CSS custom properties for runtime theming (admin can customize colors/fonts/radii)
- `cn()` utility from `@/lib/utils` (re-exports `clsx` + `tailwind-merge`)
- Custom utility classes: `btn-primary`, `btn-secondary`, `card-soft`, `chip`, `stat-value`, `badge-*`, `tabs-filter`, `table-header`, `table-cell`
- Dark mode via `.dark` class on `<html>`

## i18n

- `LangProvider` context with `useLang()` hook
- Two languages: English and Nepali
- Translation files in `src/translations/` (~1300 lines each)
- Deep key resolution: `t("nav.overview")` resolves nested objects
- Preference stored in localStorage under `sahayatri.lang`

## Key Patterns

### Redirect safety
```typescript
const redirected = useRef(false);
useEffect(() => {
  if (redirected.current) return;
  if (!loading && user) {
    redirected.current = true;
    router.replace("/dashboard");
  }
}, [loading, user, router]);
```

### Logout safety
```typescript
const handleLogout = async () => {
  await logout();                // must await — sets user to null
  // Layout's useEffect detects !user and redirects to "/"
};
```

### Resilient data section
```typescript
<ErrorBoundary>
  <DataComponent />
</ErrorBoundary>
```

### Reusable table pattern
Use `DataTable` from `src/components/tables/` with `FilterBar`, `SortableHeader`, `StatusChip`, `ActionMenu`.
