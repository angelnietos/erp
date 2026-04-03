# Remaining Tasks Plan for Libs Reorganization

## Overview
The libs reorganization is complete. The remaining tasks are to update all paths and imports to resolve TypeScript errors and ensure builds work.

## 1. Update Remaining Paths in tsconfig.base.json
Update all remaining aliases to reflect new locations. Pattern: `libs/domain/lib/src/index.ts` → `libs/environment/lib/domain/lib/src/index.ts`

### Remaining Isomorphic Paths to Update:
- @josanz-erp/clients-api: libs/isomorphic/api/clients/api/src/index.ts
- @josanz-erp/fleet-api: libs/isomorphic/api/fleet/api/src/index.ts
- @josanz-erp/inventory-api: libs/isomorphic/api/inventory/api/src/index.ts
- @josanz-erp/rentals-api: libs/isomorphic/api/rentals/api/src/index.ts
- @josanz-erp/budget-api: libs/isomorphic/api/budget/api/src/index.ts
- @josanz-erp/clients-core: libs/isomorphic/core/clients/core/src/index.ts
- @josanz-erp/delivery-core: libs/isomorphic/core/delivery/core/src/index.ts
- @josanz-erp/fleet-core: libs/isomorphic/core/fleet/core/src/index.ts
- @josanz-erp/inventory-core: libs/isomorphic/core/inventory/core/src/index.ts
- @josanz-erp/rentals-core: libs/isomorphic/core/rentals/core/src/index.ts
- @josanz-erp/budget-core: libs/isomorphic/core/budget/core/src/index.ts

### Remaining Node Paths to Update:
- @josanz-erp/billing-backend: libs/node/backend/billing/backend/src/index.ts
- @josanz-erp/budget-backend: libs/node/backend/budget/backend/src/index.ts
- @josanz-erp/clients-backend: libs/node/backend/clients/backend/src/index.ts
- @josanz-erp/delivery-backend: libs/node/backend/delivery/backend/src/index.ts
- @josanz-erp/fleet-backend: libs/node/backend/fleet/backend/src/index.ts
- @josanz-erp/identity-backend: libs/node/backend/identity/backend/src/index.ts
- @josanz-erp/inventory-backend: libs/node/backend/inventory/backend/src/index.ts
- @josanz-erp/rentals-backend: libs/node/backend/rentals/backend/src/index.ts

### Remaining Browser Paths to Update:
- @josanz-erp/billing-data-access: libs/browser/data-access/billing/data-access/src/index.ts
- @josanz-erp/billing-feature: libs/browser/feature/billing/feature/src/index.ts
- @josanz-erp/billing-shell: libs/browser/shell/billing/shell/src/index.ts
- @josanz-erp/budget-data-access: libs/browser/data-access/budget/data-access/src/index.ts
- @josanz-erp/budget-feature: libs/browser/feature/budget/feature/src/index.ts
- @josanz-erp/budget-shell: libs/browser/shell/budget/shell/src/index.ts
- @josanz-erp/clients-data-access: libs/browser/data-access/clients/data-access/src/index.ts
- @josanz-erp/clients-feature: libs/browser/feature/clients/feature/src/index.ts
- @josanz-erp/clients-shell: libs/browser/shell/clients/shell/src/index.ts
- @josanz-erp/delivery-data-access: libs/browser/data-access/delivery/data-access/src/index.ts
- @josanz-erp/delivery-feature: libs/browser/feature/delivery/feature/src/index.ts
- @josanz-erp/delivery-shell: libs/browser/shell/delivery/shell/src/index.ts
- @josanz-erp/fleet-data-access: libs/browser/data-access/fleet/data-access/src/index.ts
- @josanz-erp/fleet-feature: libs/browser/feature/fleet/feature/src/index.ts
- @josanz-erp/fleet-shell: libs/browser/shell/fleet/shell/src/index.ts
- @josanz-erp/identity-data-access: libs/browser/data-access/identity/data-access/src/index.ts
- @josanz-erp/identity-feature: libs/browser/feature/identity/feature/src/index.ts
- @josanz-erp/identity-shell: libs/browser/shell/identity/shell/src/index.ts
- @josanz-erp/inventory-data-access: libs/browser/data-access/inventory/data-access/src/index.ts
- @josanz-erp/inventory-feature: libs/browser/feature/inventory/feature/src/index.ts
- @josanz-erp/inventory-shell: libs/browser/shell/inventory/shell/src/index.ts
- @josanz-erp/rentals-data-access: libs/browser/data-access/rentals/data-access/src/index.ts
- @josanz-erp/rentals-feature: libs/browser/feature/rentals/feature/src/index.ts
- @josanz-erp/rentals-shell: libs/browser/shell/rentals/shell/src/index.ts
- @josanz-erp/settings-feature: libs/browser/feature/settings/feature/src/index.ts
- @josanz-erp/settings-shell: libs/browser/shell/settings/shell/src/index.ts

## 2. Update Import Statements in Codebase
Find and replace all import statements that reference old paths.

### Locations to Update:
- apps/backend/src/ - All imports from libs/
- apps/frontend/src/ - All imports from libs/
- All lib src/ files - Cross-lib imports

### Pattern:
Replace: `from 'libs/domain/lib'` → `from 'libs/environment/lib/domain/lib'`

Example:
- `from '@josanz-erp/shared-model'` → already updated
- `from 'libs/shared/model'` → `from 'libs/isomorphic/shared/model'`

Use global find/replace in IDE or scripts.

## 3. Update project.json and jest.config.cts for Remaining Libs
For each moved lib that hasn't been updated yet, update paths in:
- project.json: sourceRoot, outputPath, main, tsConfig, assets, jestConfig
- jest.config.cts: coverageDirectory

## 4. Test and Fix
- Run TypeScript check
- Run builds
- Fix any remaining issues

## Completion
Once all paths are updated, the codebase should compile and build successfully with the new environment-based lib structure.