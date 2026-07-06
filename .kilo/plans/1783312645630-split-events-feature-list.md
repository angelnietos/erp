# Refactor: split josanz-events-feature-list into 6 independent feature libraries

## Problem
`libs/browser/feature/events/josanz/feature-list` is a monolith Nx library (`josanz-events-feature-list`) bundling 6 independent domains: **events, equipment, vehicles, staff, billing, catalog**. They share a single barrel export and a single shell.

## Goal
Each domain becomes its own feature-list library, mirroring how `stock`, `budget`, `clients`, `delivery` are structured under `libs/browser/feature/{domain}/josanz/feature-list`. Shared services/types move to a new `josanz-events-data-access` lib. The `josanz-events-shell` stays as the single shell composing routes from the new libs.

## Affected boundaries

| Currently | After |
|---|---|
| 1 monolith `josanz-events-feature-list` lib | 6 feature-list libs + 1 data-access lib |
| 1 barrel export in `src/index.ts` | Each lib has its own barrel |
| Shell lazy-loads from one package | Shell lazy-loads from 6 packages |
| 2 apps import `@josanz-erp/josanz-events-shell` | **No app changes needed** (shell route exports keep same names) |

## New library structure

```
libs/browser/feature/events/josanz/
  data-access/
  figma-create-page/
  feature-list/                         # existing monolith repo, will be evacuated
  shell/
libs/browser/feature/equipment/josanz/
  feature-list/
libs/browser/feature/vehicles/josanz/
  feature-list/
libs/browser/feature/staff/josanz/
  feature-list/
libs/browser/feature/billing/josanz/
  feature-list/
libs/browser/feature/catalog/josanz/
  feature-list/
```

Where each `feature-list/` contains:

```
  project.json
  tsconfig.json / tsconfig.lib.json / tsconfig.spec.json
  jest.config.cts
  eslint.config.mjs
  src/
    index.ts
    test-setup.ts
    lib/
      <domain>-list/           # e.g. josanz-equipment-list/
      <domain>-detail/         # e.g. josanz-equipment-detail/
      lib.routes.ts            # internal relative lazy routes for tests/demos
```

## data-access lib contents (from current services/)

- `josanz-event-api.service.ts` — `JosanzEventApiService`, `JosanzEventRecord`, `CreateJosanzEventPayload`, `UpdateJosanzEventPayload`, `JosanzTechnicianListItem`, `UpdateJosanzTechnicianPayload`, `EventVenueBlock`, `EventDateBlock`, etc. All types currently in the file stay.
- `josanz-events.facade.ts` — `JosanzEventsFacade` (event list/detail cache logic).
- `josanz-figma-create-configs.ts` — `JosanzFigmaCreateConfig` interface + all 4 `FIGMA_CREATE_*` objects moved from `lib/josanz-figma-create-page/create-configs.ts`.

## Shared component: josanz-figma-create-page

Currently `JosanzFigmaCreatePageComponent` is reused by equipment, vehicles, staff, and billing. After the split it becomes a component inside the `figma-create-page` lib. Each feature-list barrel re-exports it so the shell can lazy-load from a single place, OR the shell lazy-loads from `figma-create-page` directly. Simplest: move component to `figma-create-page` lib and shell lazy-loads from there.

## Shell changes

`libs/browser/feature/events/josanz/shell/src/lib/lib.routes.ts` currently imports every component from `@josanz-erp/josanz-events-feature-list`. After the split, it imports from:
- `@josanz-erp/josanz-events-feature-list` for event list/detail/create
- `@josanz-erp/josanz-equipment-feature-list` for equipment list/detail
- `@josanz-erp/josanz-vehicles-feature-list` for vehicles list/detail
- `@josanz-erp/josanz-staff-feature-list` for staff list/detail
- `@josanz-erp/josanz-billing-feature-list` for billing list/detail
- `@josanz-erp/josanz-events-figma-create-page` for the shared create page
- `@josanz-erp/josanz-events-data-access` for cross-domain data access (if shell needs it)

**Shell public API (export names) stays identical** so `apps/josanz-web-app` and `apps/frontend` don't change:
- `josanzEventsRoutes`
- `josanzEquipmentRoutes`
- `josanzVehiclesRoutes`
- `josanzStaffRoutes`
- `josanzBillingRoutes`

## App impact

Zero changes needed in consuming apps:
- `apps/josanz-web-app/src/app/app.routes.ts`
- `apps/frontend/src/app/josanz-figma.routes.ts`

Both import route arrays from `@josanz-erp/josanz-events-shell`. As long as shell exports keep the same names, the apps work unchanged.

## tsconfig.base.json changes

Replace the single alias:

```json
"@josanz-erp/josanz-events-feature-list": ["libs/browser/feature/events/josanz/feature-list/src/index.ts"]
```

with:

```json
"@josanz-erp/josanz-events-data-access": ["libs/browser/feature/events/josanz/data-access/src/index.ts"],
"@josanz-erp/josanz-events-feature-list": ["libs/browser/feature/events/josanz/feature-list/src/index.ts"],
"@josanz-erp/josanz-equipment-feature-list": ["libs/browser/feature/equipment/josanz/feature-list/src/index.ts"],
"@josanz-erp/josanz-vehicles-feature-list": ["libs/browser/feature/vehicles/josanz/feature-list/src/index.ts"],
"@josanz-erp/josanz-staff-feature-list": ["libs/browser/feature/staff/josanz/feature-list/src/index.ts"],
"@josanz-erp/josanz-billing-feature-list": ["libs/browser/feature/billing/josanz/feature-list/src/index.ts"],
"@josanz-erp/josanz-catalog-feature-list": ["libs/browser/feature/catalog/josanz/feature-list/src/index.ts"],
"@josanz-erp/josanz-events-figma-create-page": ["libs/browser/feature/events/josanz/figma-create-page/src/index.ts"]
```

## Migration order (implementation notes)

1. Create `data-access` lib, move `services/` files there, update barrel.
2. Create `figma-create-page` lib, move component + `create-configs.ts` there, update barrel.
3. Create 6 `feature-lists/{domain}` directories and `project.json` files.
4. Copy files from the monolith into each new feature-list, update internal relative imports.
5. Update `data-access` barrel and each feature-list barrel.
6. Update shell `lib.routes.ts` to point to new package names.
7. Update `tsconfig.base.json` aliases.
8. Delete the original `feature-list/` monolith directory and its `src/lib/` subdirectories.
9. Run `nx affected --target=build,test` (or `nx run-many --all --target=build`) to verify.
10. Lint + test on `josanz-web-app` and `frontend` apps.

## Cross-cutting concern to resolve during implementation

`josanz-staff-list.ts`, `josanz-staff-detail.ts`, `josanz-staff-summary-tab.ts`, and `josanz-staff.mapper.ts` currently import `JosanzTechnicianListItem` from `../services/josanz-event-api.service`. After the split this path becomes `../../data-access/lib/josanz-event-api.service`. The implementer must confirm whether staff should use the shared event API for technician data (via `josanz-events-data-access`) or get its own `josanz-staff-api.service` calling `/api/technicians`. **Recommendation: keep the current imports rooted in `josanz-events-data-access`** — `/api/technicians` is scoped to events (assignable/catalog), and staff feature is displaying event personnel. This keeps the data-access intent clear.

## Validation

- `nx build josanz-events-shell` passes
- `nx build apps/josanz-web-app` passes
- `nx build apps/frontend` passes
- `nx test --run` for the 6 new feature-lists + `josanz-events-shell`
- Navigate to Events, Equipment, Vehicles, Staff, Billing routes in both apps; confirm all lazy-loaded chunks resolve.
