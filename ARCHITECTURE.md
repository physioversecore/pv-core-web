# Architecture

## Auth & Redirect Flow

### Login
1. User submits email + password on `/login` page or via AuthModal
2. `login()` in `src/context/auth.tsx` calls `AuthService.login()` → FastAPI returns user + sets HTTP-only JWT cookie
3. On success, `handleSubmit` sets `redirected.current = true` (useRef guard), then calls `router.replace("/patient|/therapist|/admin")`
4. The `useEffect` in the login page checks `!loading && user && !redirected.current` — if a logged-in user lands on `/login`, it redirects them. The ref prevents double-redirect after a submit.

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
  - **Section level**: Each data-fetching section on `patient/page.tsx` (Statistics, ReferFriend, UpcomingAppointments) has its own `ErrorBoundary` — one section failing doesn't take down the whole page

### Next.js `error.tsx` convention
- `src/app/error.tsx` — root-level error boundary (catches errors in public pages)
- `src/app/(dashboard)/error.tsx` — dashboard-scoped error boundary (catches errors before the layout-level ErrorBoundary)

## Data Loading with Suspense

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

The `<Suspense>` wrappers at the section level are inert (children don't suspend) but kept for documentation and future compatibility — they'd activate if a child ever throws a promise.

### Error handling with ErrorBoundary
```
<ErrorBoundary>
  <DataComponent />
</ErrorBoundary>
```
Each data-fetching section has its own `ErrorBoundary` — one section failing doesn't take down the whole page.

### Hooks
- `usePatientDashboard()` — returns `{ dashboard, isLoading, error }`
- `usePatientReferral()` — returns `{ referral, isLoading }`
- Regular `useQuery` with manual `isLoading` handling in components

### Skeleton Components (`src/components/SuspenseFallback.tsx`)
- `StatsSkeleton` — 3-column grid of pulsing cards
- `CardSkeleton` — single card with title/desc/button layout
- `WelcomeSkeleton` — greeting line skeleton
- `AppointmentsSkeleton` — list of appointment card skeletons
- `DashboardPageSkeleton` — composed full-page skeleton (used in `loading.tsx`)

### Page-level loading
- `(dashboard)/loading.tsx` renders `DashboardPageSkeleton` — shown automatically by Next.js during initial page navigation (before any data fetching begins)

## Dashboard Layout

### Structure
- `(dashboard)/layout.tsx` — role guard + nav derivation + ErrorBoundary + DashboardShell
- `DashboardShell` (`src/components/layout/DashboardShell.tsx`) — fixed sidebar + top header + scrollable main area
- Sidebar is `fixed` at all breakpoints; only `<main>` scrolls (overflow-y-auto)

### Title derivation
- Nav items are matched against `pathname` to determine the current page title
- Titles are translated via `useLang()` using a label→key mapping

## Data Fetching Architecture

### API Service Layer (`src/services/api/`)
- `client.ts` — base HTTP client with `Authorization: Bearer <token>` header
- One file per domain: `auth.ts`, `patients.ts`, `sessions.ts`, `products.ts`, `therapists.ts`, `profile.ts`, `cart.ts`

### Query Layer (`src/services/hooks/`)
- TanStack Query v5 with `queryKey` per domain
- `useQuery` for data fetching with manual `isLoading`/`error` handling
- `useMutation` for writes (session cancel, cart updates)

## Key Patterns

### Redirect safety
```typescript
// Always guard useEffect redirects with a ref
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
