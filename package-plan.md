# Packages — Full Implementation Plan

## 1. Vision & Scope

Packages are **prepaid session bundles** that patients purchase upfront at a discounted rate. A package grants a fixed number of sessions within a time window. When a patient books a session, they can choose to use a package session (deducting from their balance) or pay per-session as usual.

**Three user perspectives:**
- **Patient** — Browse packages, purchase, view remaining sessions, book sessions against their package
- **Therapist** — See which sessions are package-booked vs. paid, session revenue visibility
- **Admin** — CRUD packages, view package sales/usage analytics, manage patient enrollments

---

## 2. Current State (What Exists vs What's Missing)

### Exists
| Layer | Status |
|---|---|
| DB `Package` model | Standalone, no relations to User/Session/Payment |
| Backend CRUD API | `/api/v1/packages` — public read, admin write |
| Seed data | 3 packages via `seed-packages.py` |
| Frontend `/packages` page | Display-only PricingCards component |
| Navigation | Public header/footer link |
| i18n keys | `packages.*` block (partially unused) |

### Missing (What We're Building)
| Gap | Impact |
|---|---|
| `PackagePurchase` DB model | No way to record that a patient bought a package |
| `Session.packageId` field | No way to attribute a session to a package |
| Patient purchase flow | "Choose package" buttons are inert |
| Package balance tracking | `remainingPackage` translation exists but is dead code |
| Booking with package deduction | Sessions always charge per-session fee |
| Patient "My Packages" dashboard | No route, no page |
| Admin package management page | Backend CRUD exists but no admin UI |
| Therapist package visibility | No indication of package-booked sessions |
| Package analytics | No admin reporting on sales/usage |

---

## 3. Database Schema Changes

### 3.1 New Model: `PackagePurchase`

```prisma
model PackagePurchase {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  packageId      String
  package        Package  @relation(fields: [packageId], references: [id], onDelete: Restrict)
  paymentId      String?  @unique
  payment        Payment? @relation(fields: [paymentId], references: [id], onDelete: SetNull)
  sessionsTotal  Int
  sessionsUsed   Int      @default(0)
  sessionsRemaining Int  @computed  // virtual, not stored — derived from total - used
  status         String   @default("ACTIVE")  // ACTIVE, EXPIRED, DEPLETED, CANCELLED
  purchasedAt    DateTime @default(now())
  expiresAt      DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  sessions       Session[]

  @@index([userId])
  @@index([packageId])
  @@index([userId, status])
}
```

### 3.2 Modify Existing: `Session`

```prisma
model Session {
  // ... existing fields ...
  packagePurchaseId String?
  packagePurchase   PackagePurchase? @relation(fields: [packagePurchaseId], references: [id], onDelete: SetNull)

  @@index([packagePurchaseId])
}
```

### 3.3 Modify Existing: `Package`

```prisma
model Package {
  // ... existing fields ...
  sessionCount  Int      @default(10)   // how many sessions in this package
  validityDays  Int      @default(30)   // how many days to use all sessions
  purchases     PackagePurchase[]
}
```

### 3.4 Migration Plan

1. Add `sessionCount` and `validityDays` columns to `Package` (with defaults so existing rows don't break)
2. Create `PackagePurchase` table
3. Add `packagePurchaseId` nullable column to `Session`
4. Update Prisma client: `uv run prisma generate && uv run prisma db push`

---

## 4. Backend Changes

### 4.1 New Service: `app/services/package_purchase.py`

```
Functions:
├── purchase_package(db, user_id, package_id, payment_data) → PackagePurchase
│   ├── Validates package exists and is active
│   ├── Creates Payment record (status COMPLETED)
│   ├── Creates PackagePurchase (sessionsTotal = package.sessionCount, expiresAt = now + validityDays)
│   └── Returns the purchase record
│
├── get_user_purchases(db, user_id, status?) → list[PackagePurchase]
│   ├── Filters by user, optionally by status (ACTIVE, etc.)
│   └── Includes package name/price for display
│
├── get_active_purchase(db, user_id) → PackagePurchase | None
│   ├── Finds the first ACTIVE purchase with sessionsRemaining > 0 and expiresAt > now
│   └── Returns null if none
│
├── deduct_session(db, package_purchase_id) → PackagePurchase
│   ├── Increments sessionsUsed by 1
│   ├── If sessionsUsed >= sessionsTotal → status = "DEPLETED"
│   └── Returns updated purchase
│
├── check_and_expire_purchases(db) → int
│   ├── Batch job: marks purchases past expiresAt as EXPIRED
│   └── Returns count of expired
│
└── get_package_analytics(db) → dict
    ├── Total purchases, active purchases, total revenue
    ├── Sessions consumed via packages vs. paid sessions
    └── Most popular packages
```

### 4.2 New Router: `app/routers/package_purchases.py`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/packages/{package_id}/purchase` | Patient | Buy a package → creates purchase + payment |
| GET | `/packages/my-purchases` | Patient | List patient's own purchases |
| GET | `/packages/my-purchases/active` | Patient | Get current active purchase with remaining sessions |
| GET | `/admin/packages/purchases` | Admin | List all purchases (analytics) |
| GET | `/admin/packages/stats` | Admin | Package sales/usage stats |

### 4.3 Modify Existing: `app/services/session.py`

```
create_session() changes:
├── Accept optional package_purchase_id
├── If package_purchase_id provided:
│   ├── Validate purchase belongs to patient, is ACTIVE, has remaining sessions, not expired
│   ├── Set session.fee = 0 (covered by package)
│   ├── Link session → packagePurchase
│   └── Call deduct_session()
└── If no package_purchase_id:
    └── Behavior unchanged (per-session payment)
```

### 4.4 Modify Existing: `app/routers/sessions.py`

```
POST /sessions changes:
├── SessionCreate model gains optional packagePurchaseId field
├── Passes packagePurchaseId through to create_session()
└── Returns 409 if package has no remaining sessions

GET /sessions changes:
├── SessionResponse gains optional packagePurchase info
└── Enrichment adds "packageName" and "bookedViaPackage" boolean
```

### 4.5 Modify Existing: `app/models/session.py`

```python
class SessionCreate:
    # existing fields...
    packagePurchaseId: str | None = None  # NEW

class SessionResponse:
    # existing fields...
    bookedViaPackage: bool = False         # NEW
    packageName: str | None = None         # NEW
    packagePurchaseId: str | None = None   # NEW
```

### 4.6 Modify Existing: `app/routers/payments.py`

```
POST /payments/process changes:
├── If packagePurchaseId is provided in payload:
│   ├── Skip per-session payment creation
│   ├── Create session with packagePurchaseId (fee = 0)
│   └── Return session only (no payment record needed)
└── If no packagePurchaseId:
    └── Existing behavior (session + payment combo)
```

### 4.7 New Email: Package Purchase Confirmation

```
app/templates/package_purchased.html:
├── Package name, session count, validity
├── Remaining sessions count
├── Expiry date
└── "Book your first session" CTA → link to /patient/sessions
```

### 4.8 Modify Existing: `app/services/admin.py`

```
New functions:
├── get_admin_package_stats(db) → dict
│   ├── Total revenue from packages
│   ├── Active vs depleted vs expired purchases
│   ├── Sessions delivered via packages
│   └── Conversion rate (packages purchased / total patients)
│
└── get_admin_package_purchases(db, skip, limit, filters) → list
    ├── All purchases with patient name, package name, status
    └── Paginated, filterable by status/package
```

### 4.9 Register New Router

```python
# app/routers/__init__.py
from app.routers.package_purchases import router as package_purchases_router

# app/main.py
app.include_router(package_purchases_router, prefix="/api/v1")

# app/__init__.py — re-export new symbols
```

---

## 5. Frontend Changes — Patient Perspective

### 5.1 Purchase Flow (Public `/packages` page)

**Current:** PricingCards are display-only with inert buttons.
**New:**

```
PricingCards component:
├── "Choose Package" button onClick:
│   ├── If not logged in → open AuthModal (patient role)
│   ├── If logged in → open PurchaseConfirmDialog
│   └── If logged in and has active package → show "You have an active package" toast
│
├── PurchaseConfirmDialog (new component):
│   ├── Shows: package name, price, session count, validity, what's included
│   ├── Payment method selector (existing: eSewa/Khalti/Cash/Bank)
│   ├── "Confirm Purchase" button → calls POST /packages/{id}/purchase
│   ├── Loading state → success toast → redirect to /patient/packages
│   └── Error state (already has package, payment failed, etc.)
│
└── If patient already has an active package:
    ├── Button text changes to "View Your Package"
    └── Links to /patient/packages
```

### 5.2 Patient Dashboard: "My Packages" Page

**New route:** `(dashboard)/patient/packages/page.tsx`

```
Page layout:
├── PageShell with eyebrow "Packages" / title "Your Packages"
│
├── Active Package Card (if any):
│   ├── Package name + tag
│   ├── Progress bar: sessionsUsed / sessionsTotal
│   ├── "X of Y sessions remaining" display
│   ├── Expiry countdown ("Expires in X days")
│   ├── "Book Session" CTA → opens BookingModal with package mode
│   └── Sessions list for this package (linked sessions)
│
├── Past Packages section:
│   ├── Table/cards of expired/depleted purchases
│   ├── Shows: package name, purchased date, sessions used, final status
│   └── "Re-purchase" button → opens PurchaseConfirmDialog
│
└── No packages state:
    ├── Illustration + "You haven't purchased any packages yet"
    ├── "Browse Packages" CTA → /packages
    └── "Or book a single session" CTA → /find-a-therapist
```

### 5.3 Modify Existing: `BookingModal`

```
BookingModal changes:
├── New prop/option: packagePurchaseId (optional)
│
├── If patient has an active package:
│   ├── Toggle at top of modal: "Use Package Session" / "Pay Per Session"
│   ├── Default: "Use Package Session" (if available)
│   ├── "Use Package Session" mode:
│   │   ├── Shows remaining sessions count
│   │   ├── Fee display: "Free (Package)" instead of "Rs X,XXX"
│   │   ├── Payment method selector is HIDDEN
│   │   └── Submit calls processBooking with packagePurchaseId
│   └── "Pay Per Session" mode:
│       └── Existing behavior (payment method, full fee)
│
├── If no active package:
│   ├── Subtle upsell: "Save with a package → View packages" link
│   └── Existing per-session payment behavior
│
└── post-booking:
    ├── If booked via package → toast: "Session booked! X sessions remaining"
    └── If paid → existing behavior
```

### 5.4 Modify Existing: `useBooking` Hook

```typescript
// src/hooks/useBooking.ts additions
interface BookingContext {
  // existing...
  activePackage: PackagePurchase | null;  // NEW: from useActivePackage hook
  usePackage: boolean;                     // NEW: toggle state
  setUsePackage: (v: boolean) => void;    // NEW: toggle setter
}
```

### 5.5 New Hook: `useActivePackage.ts`

```typescript
// src/hooks/useActivePackage.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { getActivePackage } from "@/services/api/packages";

export function useActivePackage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["active-package", user?.id],
    queryFn: () => getActivePackage(),
    enabled: !!user && user.role === "patient",
  });
  return { activePackage: data ?? null, isLoading };
}
```

### 5.6 New Hook: `useMyPackages.ts`

```typescript
// src/hooks/useMyPackages.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { getMyPackages } from "@/services/api/packages";

export function useMyPackages() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-packages", user?.id],
    queryFn: () => getMyPackages(),
    enabled: !!user && user.role === "patient",
  });
  return { purchases: data?.purchases ?? [], isLoading, error };
}
```

### 5.7 Modify Existing: `src/services/api/packages.ts`

```typescript
// Add these server functions:

export async function purchasePackage(packageId: string, paymentMethod: string) {
  return api.post<PurchaseResponse>(`/packages/${packageId}/purchase`, { paymentMethod });
}

export async function getMyPackages() {
  return api.get<{ purchases: PurchaseData[] }>("/packages/my-purchases");
}

export async function getActivePackage(): Promise<PurchaseData | null> {
  try {
    return await api.get<PurchaseData>("/packages/my-purchases/active");
  } catch {
    return null;
  }
}
```

### 5.8 Modify Existing: `src/types/index.ts`

```typescript
export interface PackagePurchase {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  status: "ACTIVE" | "EXPIRED" | "DEPLETED" | "CANCELLED";
  purchasedAt: string;
  expiresAt: string;
}

export interface Package {
  // existing fields...
  sessionCount: number;  // NEW
  validityDays: number;  // NEW
}
```

### 5.9 Patient Navigation Update

```typescript
// src/constants/navigation.tsx — patientNav addition
{
  to: "/patient/packages",
  label: "My Packages",
  icon: "Package",
}
```

---

## 6. Frontend Changes — Therapist Perspective

### 6.1 Session List Enhancement

```
Therapist session cards/list:
├── New badge on package-booked sessions: "Package" pill (different color from "Paid")
├── Shows patient's remaining package sessions (if visible)
└── Revenue column: shows "Package" instead of fee amount for package sessions
```

### 6.2 Modify Existing: `useTherapistDashboard.ts`

```
Dashboard stats:
├── Add: "Package sessions this month" count
└── Add: "Paid sessions this month" count (separate from package)
```

### 6.3 No New Routes Needed

Therapists don't purchase or manage packages. They only see package attribution on their existing schedule/sessions views.

---

## 7. Frontend Changes — Admin Perspective

### 7.1 New Admin Route: `(dashboard)/admin/packages/page.tsx`

```
Page layout:
├── PageShell with eyebrow "Packages" / title "Package Management"
│
├── Stats Row (top):
│   ├── Total Revenue (packages)
│   ├── Active Purchases
│   ├── Sessions Delivered (package)
│   └── Most Popular Package
│
├── Tabs:
│   ├── Tab 1: "Packages" (catalog management)
│   │   ├── Data table: name, tag, price, sessionCount, validityDays, purchases, status
│   │   ├── Actions: Edit, Toggle active/inactive, Delete
│   │   └── "Add Package" button → CreatePackageDialog
│   │
│   ├── Tab 2: "Purchases" (enrollment tracking)
│   │   ├── Data table: patient, package, purchased, sessions used/remaining, status, expires
│   │   ├── Filters: status, package, date range
│   │   └── Click row → PurchaseDetailSheet
│   │
│   └── Tab 3: "Analytics" (usage reporting)
│       ├── Revenue by package (bar chart)
│       ├── Sessions: package vs paid (pie chart)
│       ├── Purchase trend over time (line chart)
│       └── Expiry distribution
│
└── No separate admin nav entry needed — could be under existing admin dashboard or a new "Packages" link
```

### 7.2 New Admin Components

```
Components to create:
├── CreatePackageDialog.tsx
│   ├── Form: name, tag, icon, price, sessionCount, validityDays, blurb, points[], featured
│   ├── Validation via zod
│   └── POST /packages → invalidate query
│
├── EditPackageDialog.tsx
│   ├── Same form, pre-filled
│   └── PUT /packages/{id} → invalidate query
│
├── PurchaseDetailSheet.tsx
│   ├── Patient info, package info, payment info
│   ├── Session list (sessions booked under this purchase)
│   └── Status badge + expiry
│
└── PackageAnalytics.tsx
    └── Recharts visualizations for usage data
```

### 7.3 New Hook: `useAdminPackages.ts`

```typescript
// src/hooks/useAdminPackages.ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getAdminPackagePurchases,
  getAdminPackageStats,
} from "@/services/api/admin";

export function useAdminPackages() {
  const queryClient = useQueryClient();

  const packagesQuery = useQuery({
    queryKey: ["admin-packages"],
    queryFn: () => getAdminPackages(),
  });

  const purchasesQuery = useQuery({
    queryKey: ["admin-package-purchases"],
    queryFn: () => getAdminPackagePurchases(),
  });

  const statsQuery = useQuery({
    queryKey: ["admin-package-stats"],
    queryFn: () => getAdminPackageStats(),
  });

  const createMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-packages"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePackage(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-packages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] }); // public list too
    },
  });

  return {
    packages: packagesQuery.data?.packages ?? [],
    purchases: purchasesQuery.data?.purchases ?? [],
    stats: statsQuery.data ?? null,
    isLoading: packagesQuery.isLoading || purchasesQuery.isLoading,
    createPackage: createMutation.mutateAsync,
    updatePackage: updateMutation.mutateAsync,
    deletePackage: deleteMutation.mutateAsync,
  };
}
```

### 7.4 Admin Navigation Update

```typescript
// src/constants/navigation.tsx — adminNav addition
{
  to: "/admin/packages",
  label: "Packages",
  icon: "Package",
}
```

### 7.5 Admin API Functions

```typescript
// src/services/api/admin.ts — additions

export async function getAdminPackages() {
  return api.get<{ packages: Package[]; total: number }>("/packages");
}

export async function createAdminPackage(data: CreatePackagePayload) {
  return api.post<Package>("/packages", data);
}

export async function updateAdminPackage(id: string, data: Partial<Package>) {
  return api.put<Package>(`/packages/${id}`, data);
}

export async function deleteAdminPackage(id: string) {
  return api.delete(`/packages/${id}`);
}

export async function getAdminPackagePurchases(params?: AdminListParams) {
  // builds query string from params
  return api.get<ListResponse<PackagePurchase>>("/admin/packages/purchases?" + sp.toString());
}

export async function getAdminPackageStats() {
  return api.get<PackageStats>("/admin/packages/stats");
}
```

---

## 8. i18n Updates

### 8.1 New Keys (en.ts + ne.ts)

```typescript
packages: {
  // existing...
  eyebrow: "Therapy Packages",
  title: "Invest in Your Recovery",
  subtitle: "Prepaid session bundles that save you time and money",
  perMonth: "per month",
  choosePackage: "Choose Package",
  contactUs: "Contact Us",
  phone: "+977-XXX-XXXXXX",

  // NEW keys
  sessionCount: "{count} sessions included",
  validity: "Valid for {days} days",
  expires: "Expires in {days} days",
  expired: "Expired",
  depleted: "All sessions used",
  active: "Active",
  remaining: "{count} sessions remaining",
  purchasedOn: "Purchased on {date}",
  bookSession: "Book Session",
  rePurchase: "Re-purchase",
  noPackages: "You haven't purchased any packages yet",
  browsePackages: "Browse Packages",
  bookSingleSession: "Or book a single session",
  usePackage: "Use Package Session",
  payPerSession: "Pay Per Session",
  freeWithPackage: "Free (Package)",
  packageBooked: "Package",
  sessionsUsed: "{used} of {total} sessions used",
  confirmPurchase: "Confirm Purchase",
  purchaseSuccess: "Package purchased successfully!",
  purchaseFailed: "Purchase failed. Please try again.",
  alreadyHasPackage: "You already have an active package",
  saveWithPackage: "Save with a package",
  viewPackage: "View Your Package",
  totalRevenue: "Total Revenue",
  activePurchases: "Active Purchases",
  sessionsDelivered: "Sessions via Packages",
  mostPopular: "Most Popular",
  packageManagement: "Package Management",
  addPackage: "Add Package",
  editPackage: "Edit Package",
  sessionCountLabel: "Number of Sessions",
  validityDaysLabel: "Validity (Days)",
  purchases: "Purchases",
  analytics: "Analytics",
},
```

---

## 9. API Response Shapes

### 9.1 `POST /packages/{id}/purchase` Response

```json
{
  "id": "cuid",
  "userId": "user_cuid",
  "packageId": "pkg_cuid",
  "packageName": "Stroke & Neuro Recovery",
  "sessionsTotal": 12,
  "sessionsUsed": 0,
  "sessionsRemaining": 12,
  "status": "ACTIVE",
  "purchasedAt": "2026-09-08T10:00:00Z",
  "expiresAt": "2026-10-08T10:00:00Z",
  "payment": {
    "id": "pay_cuid",
    "amount": 24000,
    "method": "eSewa",
    "status": "COMPLETED"
  }
}
```

### 9.2 `GET /packages/my-purchases/active` Response

```json
{
  "id": "cuid",
  "packageName": "Stroke & Neuro Recovery",
  "tag": "Neuro Recovery",
  "sessionCount": 12,
  "sessionsUsed": 4,
  "sessionsRemaining": 8,
  "status": "ACTIVE",
  "purchasedAt": "2026-09-01T10:00:00Z",
  "expiresAt": "2026-10-01T10:00:00Z",
  "sessions": [
    { "id": "s1", "date": "2026-09-02", "time": "10:00", "therapistName": "Dr. Jane" },
    { "id": "s2", "date": "2026-09-04", "time": "14:00", "therapistName": "Dr. Jane" }
  ]
}
```

### 9.3 Session Response Enhancement

```json
{
  "id": "session_cuid",
  "therapistId": "...",
  "therapistName": "Dr. Jane Smith",
  "patientId": "...",
  "patientName": "John Doe",
  "date": "2026-09-10",
  "time": "10:00",
  "type": "HOME_VISIT",
  "status": "SCHEDULED",
  "address": "Kathmandu, Nepal",
  "fee": 0,
  "bookedViaPackage": true,
  "packageName": "Stroke & Neuro Recovery",
  "packagePurchaseId": "purchase_cuid"
}
```

---

## 10. File Change Summary

### New Files

| File | Purpose |
|---|---|
| `pvc-api/app/services/package_purchase.py` | Purchase business logic (create, list, deduct, expire, analytics) |
| `pvc-api/app/routers/package_purchases.py` | Purchase API endpoints |
| `pvc-api/app/models/package_purchase.py` | Pydantic schemas for purchase request/response |
| `pvc-api/scripts/seed-package-purchases.py` | Seed sample purchases for dev |
| `pvc-web/src/app/(dashboard)/patient/packages/page.tsx` | Patient "My Packages" page |
| `pvc-web/src/app/(dashboard)/admin/packages/page.tsx` | Admin package management page |
| `pvc-web/src/hooks/useActivePackage.ts` | React Query hook for active package |
| `pvc-web/src/hooks/useMyPackages.ts` | React Query hook for patient's purchases |
| `pvc-web/src/hooks/useAdminPackages.ts` | React Query hook for admin package management |
| `pvc-web/src/components/modals/PurchaseConfirmDialog.tsx` | Purchase confirmation modal |
| `pvc-web/src/components/dashboard/PackageCard.tsx` | Active package display card |
| `pvc-web/src/components/dashboard/PurchaseHistoryTable.tsx` | Past purchases table |
| `pvc-web/src/components/admin/CreatePackageDialog.tsx` | Admin create package form |
| `pvc-web/src/components/admin/EditPackageDialog.tsx` | Admin edit package form |
| `pvc-web/src/components/admin/PurchaseDetailSheet.tsx` | Admin purchase detail view |
| `pvc-web/src/components/admin/PackageAnalytics.tsx` | Admin analytics charts |
| `pvc-api/app/templates/package_purchased.html` | Purchase confirmation email |

### Modified Files

| File | Change |
|---|---|
| `pvc-api/prisma/schema.prisma` | Add `sessionCount`/`validityDays` to Package, add PackagePurchase model, add `packagePurchaseId` to Session |
| `pvc-api/app/__init__.py` | Re-export new symbols |
| `pvc-api/app/routers/__init__.py` | Register package_purchases_router |
| `pvc-api/app/main.py` | Include new router |
| `pvc-api/app/services/__init__.py` | Re-export new service functions |
| `pvc-api/app/models/__init__.py` | Re-export new models |
| `pvc-api/app/services/session.py` | Add package deduction logic to create_session |
| `pvc-api/app/routers/sessions.py` | Accept packagePurchaseId, enrich response |
| `pvc-api/app/models/session.py` | Add packagePurchaseId, bookedViaPackage, packageName |
| `pvc-api/app/routers/payments.py` | Handle package-based booking (skip payment) |
| `pvc-api/app/models/payment.py` | Add packagePurchaseId to BookingPaymentRequest |
| `pvc-api/app/services/admin.py` | Add package stats/purchases functions |
| `pvc-api/app/routers/admin.py` | Add package stats/purchases endpoints |
| `pvc-api/scripts/seed-packages.py` | Add sessionCount/validityDays to seed data |
| `pvc-web/src/types/index.ts` | Add PackagePurchase type, extend Package type |
| `pvc-web/src/services/api/packages.ts` | Add purchasePackage, getMyPackages, getActivePackage |
| `pvc-web/src/services/api/admin.ts` | Add admin package CRUD + stats + purchases |
| `pvc-web/src/hooks/usePackages.ts` | No change (still public list) |
| `pvc-web/src/hooks/useBooking.ts` | Integrate active package toggle |
| `pvc-web/src/components/ui/pricing-cards.tsx` | Wire up purchase flow, show active package state |
| `pvc-web/src/app/(public)/packages/page.tsx` | Minor: pass active package state to PricingCards |
| `pvc-web/src/constants/navigation.tsx` | Add patient "My Packages" + admin "Packages" nav items |
| `pvc-web/src/translations/en.ts` | Add ~30 new package keys |
| `pvc-web/src/translations/ne.ts` | Add ~30 new package keys (Nepali) |

---

## 11. Implementation Order

### Phase 1: Database + Backend Core (Do First)
1. Update Prisma schema (Package model changes + PackagePurchase + Session modification)
2. Run migration
3. Create `app/models/package_purchase.py` (Pydantic schemas)
4. Create `app/services/package_purchase.py` (business logic)
5. Create `app/routers/package_purchases.py` (API endpoints)
6. Modify `app/services/session.py` (package deduction in create_session)
7. Modify `app/routers/sessions.py` (accept packagePurchaseId)
8. Modify `app/routers/payments.py` (handle package booking)
9. Register new router, re-export symbols
10. Update seed script with sessionCount/validityDays
11. Test all endpoints manually

### Phase 2: Patient Frontend
1. Update `src/types/index.ts` (PackagePurchase + Package extension)
2. Update `src/services/api/packages.ts` (new API functions)
3. Create `src/hooks/useActivePackage.ts`
4. Create `src/hooks/useMyPackages.ts`
5. Create `src/components/modals/PurchaseConfirmDialog.tsx`
6. Create `src/components/dashboard/PackageCard.tsx`
7. Create `src/components/dashboard/PurchaseHistoryTable.tsx`
8. Create `src/app/(dashboard)/patient/packages/page.tsx`
9. Modify `src/components/ui/pricing-cards.tsx` (wire purchase buttons)
10. Modify `src/hooks/useBooking.ts` (package toggle)
11. Modify BookingModal (package mode)
12. Update `src/constants/navigation.tsx` (patient nav)
13. Update translations (en + ne)

### Phase 3: Admin Frontend
1. Update `src/services/api/admin.ts` (admin package functions)
2. Create `src/hooks/useAdminPackages.ts`
3. Create `src/components/admin/CreatePackageDialog.tsx`
4. Create `src/components/admin/EditPackageDialog.tsx`
5. Create `src/components/admin/PurchaseDetailSheet.tsx`
6. Create `src/components/admin/PackageAnalytics.tsx`
7. Create `src/app/(dashboard)/admin/packages/page.tsx`
8. Update `src/constants/navigation.tsx` (admin nav)
9. Update admin seed script

### Phase 4: Therapist + Polish
1. Add "Package" badge to therapist session cards
2. Add package session count to therapist dashboard stats
3. Create package purchase confirmation email template
4. Add admin notification for package purchase
5. Backend tests for package purchase flow
6. Final QA: end-to-end flow test

---

## 12. Edge Cases & Validation

| Case | Handling |
|---|---|
| Patient tries to purchase while already having an active package | Block: "You already have an active package. Use your remaining sessions first." |
| Package expires with remaining sessions | Background job marks as EXPIRED. Sessions become per-session paid. |
| Patient books session, package expires before session date | If session is SCHEDULED and package expires → session remains (fee retroactively charged? or grandfathered?) → **Decision: session is grandfathered, no retroactive charge** |
| Therapist cancels a package session | Session status → CANCELLED, sessionsUsed decrements by 1 (session "returned" to package) |
| Admin refunds a package purchase | Refund → package status CANCELLED, all remaining sessions voided, sessionsUsed stays |
| Double-booking with package | Same 409 conflict behavior — package doesn't bypass slot uniqueness |
| Package has 0 remaining, patient tries to book | BookingModal shows "Package depleted" → forces per-session payment |
| Admin deactivates a package | Existing purchases remain valid. New purchases of that package are blocked. |
| Package price changes | Only affects new purchases. Existing purchases are locked to purchase-time price. |
| Patient has multiple packages | System picks the one expiring soonest (FIFO) as default. Patient can override. |

---

## 13. Key Design Decisions

1. **Packages are per-patient, not per-therapist** — A package lets a patient book with any therapist. The package is about session count, not therapist assignment.

2. **Packages override session fee to 0** — The fee is pre-paid. Session.fee is set to 0 for package-booked sessions (or stored as original fee for analytics).

3. **One active package at a time** — Simplifies UX. Patient must deplete/expiry current package before buying another. Admin can override.

4. **Sesions are grandfathered** — If a session is booked under a package and the package later expires or is cancelled, the session stands. This prevents penalizing patients.

5. **Cancellation returns the session** — When a patient cancels a package-booked session, the session count is restored to the package. This is fair.

6. **Admin CRUD is separate from purchase management** — Admins manage the catalog (create/edit/delete packages) AND view purchase analytics. Two tabs, one page.

7. **Therapist visibility is minimal** — Therapists see "Package" badge but don't manage packages. Package management is patient + admin domain.

8. **Payment is still required** — Package purchase goes through the existing payment system. No free packages (admin sets the price).

9. **Package analytics are admin-only** — Revenue, usage, conversion metrics are for business intelligence, not exposed to patients/therapists.

10. **Email on purchase** — Confirmation email sent on purchase (fire-and-forget, same as OTP emails).
