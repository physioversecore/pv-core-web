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
3. Patient fills form (name, email, phone, city, password with eye toggle, terms). Therapist additionally fills gender, NMC license #, experience, fee and uploads **NMC license + certification documents** via `DocumentUploader`
4. Therapist documents upload immediately via XHR to the public proxy `POST /api/uploads/therapist-application` (session=`therapist-signup`) — WhatsApp-style previews, progress bars, retry. The returned relative URLs are held in `SignupFlow` state until the final submit
5. On submit → `sendOtp(email, name)` → backend sends branded HTML email with 6-digit OTP
6. OTP input screen → user enters 6-digit code → `verifyOtp(email, code)`
7. On verification → `signupPatient()` or `signupTherapist()` in AuthProvider calls server-side `AuthService.signup()` → `setToken()` sets the JWT cookie directly on the server. For therapists the payload includes `gender/license/experience/fee/documents`; the backend creates the `Therapist` profile + a `Verification` row per document (status `Pending review`)
8. Redirect to `/onboarding/therapist` (therapist) or `/onboarding/patient` (patient) to complete profile

**Shared component**: `SignupFlow` (`src/components/auth/SignupFlow.tsx`) is used by both `/signup` page and `AuthModal`. The page renders it inline; the modal wraps it with overlay/close button.

**Document uploader**: `DocumentUploader` (`src/components/auth/DocumentUploader.tsx`) is a controlled component — parent owns the `UploadedDoc[]` state and passes a `Dispatch<SetStateAction<...>>` as `onChange`. It uses `XMLHttpRequest` for real upload progress (not `fetch`), accepts `.pdf/.jpg/.jpeg/.png/.gif/.webp/.doc/.docx` up to 10 MB, renders image thumbnails via `URL.createObjectURL`, and supports retry/remove. Signup is blocked until both document groups reach status `done`.

**Admin verification**: uploaded documents are served to authenticated users via `GET /api/v1/uploads/applications/{session}/{filename}`, proxied by `src/app/api/v1/uploads/applications/[session]/[filename]/route.ts` (adds the bearer cookie). `/admin/verification` (`src/app/(dashboard)/admin/verification/page.tsx`) renders a preview/download link in the Document column, a real image/file preview in the details dialog, and the same preview inside the Review drawer (`documentUrl`/`fileName`/`fileSize` come from `AdminVerificationData`).

- **In-app document viewer**: The therapist detail sheet (`src/components/modals/TherapistDetailSheet.tsx`) renders a `DocumentViewer` Dialog that shows each document inline — `<img>` for image extensions, `<iframe>` otherwise (via `isImageUrl`) — with an "Open in new tab" link. Admins no longer need to leave the app to review files.
- **Rejection reasons**: `AdminVerificationData`/`AdminTherapistDocument` include an optional `note`. The Review drawer requires a rejection reason before rejecting, and rejected records display it (preview modal + red "Rejection reason" box in the therapist detail sheet). The reason is persisted server-side and echoed in the therapist's rejection email.
- **Immediate refresh**: `useAdminVerifications.ts` optimistically patches the list via `queryClient.setQueriesData` on approve/reject/edit (plus `localOverrides` in the page for verified/rejected status changes) and invalidates the query on success, so the verification table reflects actions without a manual reload.

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
- `admin.ts` includes: `getNewBookingCount(since)`, `getNewComplaintCount(since)` (badge polls), `submitTherapistComplaint`, `submitPatientComplaint`

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
| File upload/download | Route Handler proxy — public `POST /api/uploads/therapist-application` (XHR from `DocumentUploader`), `POST /api/reports`, `POST /api/uploads/complaint-evidence` (complaint evidence), `GET /api/v1/uploads/applications/[session]/[filename]` and `GET /api/v1/uploads/evidence/[session]/[filename]` (add bearer cookie) |
| Real-time (future) | Client fetch → own Route Handler (never raw backend) |

## Provider Stack

Defined in `src/app/providers.tsx`:

```
QueryClientProvider
  └─ DesignTokensProvider     # Dynamic theme (localStorage + server sync)
      └─ LangProvider          # Nepali/English toggle (localStorage)
          └─ AuthProvider       # User state (server-driven via getSession, server-side signup via AuthService)
              └─ CartProvider   # Shopping cart (API-driven, optimistic updates)
                  └─ BookingBadgeProvider   # Admin booking notification count
                      └─ ComplaintBadgeProvider  # Admin complaint notification count
                          └─ AuthModalProvider   # Login/signup modal state
```

## Complaint Badge & Evidence

### Admin new-complaint badge
- `ComplaintBadgeProvider` (`src/context/complaint-badge.tsx`) is mounted at the root, mirrors `BookingBadgeProvider`.
- For admins it polls `GET /admin/complaints/new-count?since=<ISO timestamp>` every 30s (TanStack Query `refetchInterval`).
- `since` starts from `localStorage["admin_last_complaint_visit"]` (or login time on first visit) and is reset when the admin opens `/admin/complaints` (`resetComplaintCount()` in `(dashboard)/layout.tsx`).
- The count is injected into the `/admin/complaints` nav item via `navWithBadges` in `(dashboard)/layout.tsx` and rendered by `DashboardShell` as an amber pill.

### Complaint evidence uploads
Patients and therapists attach up to 3 evidence files (photos/screenshots) when filing a complaint:
1. Files upload via XHR/fetch to the public proxy `POST /api/uploads/complaint-evidence` (client-generated `session` key, e.g. `complaint-<ts>-<rand>`).
2. The route handler proxies the FormData to the backend `POST /api/v1/uploads/complaint-evidence`, which stores files under `Upload/ComplaintEvidence/<session>/` and returns real URLs `/api/v1/uploads/evidence/<session>/<filename>`.
3. URLs (with the original filename appended via `?name=`) are embedded in the complaint payload as `evidenceUrls`.
4. Admins view evidence in-app — `GET /api/v1/uploads/evidence/[session]/[filename]` (frontend route handler) adds the bearer cookie, and `PreviewDialog` renders images/files.

### Report file serving
`GET /api/v1/uploads/[patientId]/[filename]` passes the JWT as a `token` query param (backend report serving is token-authenticated) instead of a bearer header.

## Styling

- Tailwind CSS v4 with `@theme inline` for design tokens
- CSS custom properties for runtime theming (admin can customize colors/fonts/radii)
- `cn()` utility from `@/lib/utils` (re-exports `clsx` + `tailwind-merge`)
- Custom utility classes: `btn-primary`, `btn-secondary`, `card-soft`, `chip`, `stat-value`, `badge-*`, `tabs-filter`, `table-header`, `table-cell`, `home-background` (shared Hero + Services canvas — one continuous olive-charcoal background with a lime/cyan radial glow)
- **Dark mode dropped** — no `.dark` variant. Dark sections use brand canvas tokens directly. The landing page wraps `HeroSection` + `ServicesSection` in `.home-background` (`globals.css`): both sections are transparent and the shared parent owns the entire atmosphere — an olive-charcoal vertical base (vh-anchored: `abyss-soft → abyss-mid → abyss-deep → mid-abyss`) plus a green radial glow centered on the hero content that fades out ~110-120vh so it extends past the hero boundary into the services section with no seam. Content layers sit above via `z-index: 1`
- Landing search: `HeroSection` pushes `router.push("/find-a-therapist?q=…")`; the find page seeds its `q`/`spec` state from `useSearchParams()` (wrapped in `<Suspense>`)

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
