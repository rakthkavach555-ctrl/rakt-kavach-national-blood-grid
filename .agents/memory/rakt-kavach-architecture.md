---
name: RAKT KAVACH Architecture
description: Key decisions, quirks, and setup for the National Digital Blood Grid project
---

## Stack
- Frontend: React + Vite + TailwindCSS v4 + Zustand + TanStack Query + Framer Motion + Recharts + Leaflet (artifact: `artifacts/rakt-kavach`)
- Backend: Express + Drizzle ORM + PostgreSQL (artifact: `artifacts/api-server`)
- API contract: OpenAPI spec at `lib/api-spec/openapi.yaml`, codegen at `lib/api-client-react`

## Pages (22 total — all implemented, no placeholders)
LandingPage, DashboardRouter, NationalCommandCenter, StateCommandCenter, DistrictCommandCenter,
DonorPortal, DonorRegister, DonorDonate, PatientPortal, HospitalDashboard, BloodBankDashboard,
LaboratoryDashboard, AmbulanceDashboard, VolunteerPortal, EmergencySOS, EmergencyDetail,
BloodUnitTracker, InventorySearch, WalletPage, NotificationsPage, AnalyticsPage,
AdminPanel, WhoReadiness, GlobalSearch

## Critical quirks

### Hook import path
ALL hooks must import from `@workspace/api-client-react` (NOT `@workspace/api-client-react/api`).
The `/api` subpath export exists but causes TS errors in some pages.
**Why:** `lib/api-client-react/package.json` exports `"."` and `"./api"` both pointing to `./src/index.ts`.
After migration all pages use the root export.

### useGetDonorDashboard requires userId
`useGetDonorDashboard(userId: number)` — always pass `user?.id ?? 0` from `useAuthStore()`.
**Why:** API route is `/dashboard/donor/:userId` — cannot infer from session on client.

### useGetNationalDashboard has no required args
Call as `useGetNationalDashboard()` — no options object needed.

### Cell from recharts must be capitalized
`<Cell>` not `<cell>` — lowercase JSX silently fails in recharts bar charts.

### EmergencySOS Activity icon
Import `Activity` from `lucide-react`, NOT destructured from React. React does not export it.

### api-client-react export
Package exports both `"."` and `"./api"` — both point to `./src/index.ts`.

### lib/db build requirement
Before `@workspace/api-server` can typecheck, run `pnpm --filter @workspace/db exec tsc -p tsconfig.json` to emit declarations into `lib/db/dist/`.

### req.params bracket notation
Always use `req.params["key"] as string` — TS with moduleResolution:bundler gives `string | string[]`.

### use-toast path
Pages import `useToast` from `@/components/ui/use-toast`. This re-exports from `@/hooks/use-toast`.
`toast.tsx` does NOT export `useToast`.

### zustand not in catalog
`zustand` must be installed directly in `artifacts/rakt-kavach` — not in pnpm workspace catalog.

### Seeding the database
Geography seed: `/home/runner/workspace/artifacts/rakt-kavach/node_modules/.bin/tsx --tsconfig artifacts/api-server/tsconfig.json artifacts/api-server/src/seed-geography.ts`
Main seed: same tsx binary, `artifacts/api-server/src/seed.ts`

## DB schema
All tables in `lib/db/src/schema/`:
- `users`, `donors`, `patients` (core entities)
- `hospitals`, `blood_banks`, `laboratories`, `ambulances`, `volunteers` (facilities)
- `blood_inventory`, `blood_units` (with qrCode, labVerificationStatus, dispatchedAt, transfusedAt), `blood_unit_timeline`, `blood_requests`, `lab_tests` (inventory)
- `emergency_sos` (emergency)
- `wallets`, `wallet_transactions` (wallet)
- `notifications`, `audit_logs` (notifications)
- `states`, `districts`, `blocks` (geography — India hierarchy)

Push: `pnpm --filter @workspace/db run push`

## India Hierarchy (seeded)
8 states, 30 districts, 90 blocks seeded via `seed-geography.ts`
Routes: GET /api/geography/states, /api/geography/states/:stateCode/districts, /api/geography/districts/:districtCode/blocks, /api/geography/hierarchy/:stateCode

## Global Search
GET /api/search?q=...&type=all|donors|hospitals|blood_banks|blood_units|emergencies|laboratories|ambulances
Frontend: GlobalSearch.tsx with client-side filter + keyboard "/" shortcut

## Seed credentials (dev only)
- admin@raktakavach.in / password123 → NATIONAL_ADMIN
- donor@raktakavach.in / password123 → DONOR (O+)
- patient@raktakavach.in / password123 → PATIENT (B+)
- hospital@raktakavach.in / password123 → HOSPITAL

## RBAC roles (12 total)
SUPER_ADMIN, NATIONAL_ADMIN, STATE_ADMIN, DISTRICT_ADMIN,
HOSPITAL, BLOOD_BANK, LABORATORY, AMBULANCE, VOLUNTEER,
DONOR, PATIENT, VERIFIER
