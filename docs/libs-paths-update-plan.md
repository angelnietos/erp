# Josanz ERP Libs Paths Update Plan

## Objective
Update all paths in configuration files and import statements to reflect the new environment-based lib locations after reorganization.

## Current Issues
- TypeScript errors due to old paths in tsconfig.base.json
- Import statements in apps and libs still reference old paths
- Some project.json, jest.config.cts files may have outdated paths

## New Path Mappings

### Isomorphic (libs/isomorphic/)
- @josanz-erp/shared-model: libs/isomorphic/shared/model/src/index.ts
- @josanz-erp/shared-utils: libs/isomorphic/shared/utils/src/index.ts
- @josanz-erp/shared-config: libs/isomorphic/shared/config/src/index.ts
- @josanz-erp/identity-api: libs/isomorphic/api/identity/api/src/index.ts
- @josanz-erp/billing-api: libs/isomorphic/api/billing/api/src/index.ts
- @josanz-erp/clients-api: libs/isomorphic/api/clients/api/src/index.ts
- @josanz-erp/delivery-api: libs/isomorphic/api/delivery/api/src/index.ts
- @josanz-erp/fleet-api: libs/isomorphic/api/fleet/api/src/index.ts
- @josanz-erp/inventory-api: libs/isomorphic/api/inventory/api/src/index.ts
- @josanz-erp/rentals-api: libs/isomorphic/api/rentals/api/src/index.ts
- @josanz-erp/verifactu-api: libs/isomorphic/api/verifactu/api/src/index.ts
- @josanz-erp/budget-api: libs/isomorphic/api/budget/api/src/index.ts
- @josanz-erp/identity-core: libs/isomorphic/core/identity/core/src/index.ts
- @josanz-erp/billing-core: libs/isomorphic/core/billing/core/src/index.ts (assuming moved)
- @josanz-erp/clients-core: libs/isomorphic/core/clients/core/src/index.ts
- @josanz-erp/delivery-core: libs/isomorphic/core/delivery/core/src/index.ts
- @josanz-erp/fleet-core: libs/isomorphic/core/fleet/core/src/index.ts
- @josanz-erp/inventory-core: libs/isomorphic/core/inventory/core/src/index.ts
- @josanz-erp/rentals-core: libs/isomorphic/core/rentals/core/src/index.ts
- @josanz-erp/verifactu-core: libs/isomorphic/core/verifactu/core/src/index.ts
- @josanz-erp/budget-core: libs/isomorphic/core/budget/core/src/index.ts

### Node (libs/node/)
- @josanz-erp/shared-infrastructure: libs/node/shared-infrastructure/src/index.ts
- @josanz-erp/shared-cqrs: libs/node/shared/cqrs/src/index.ts
- @josanz-erp/shared-events: libs/node/shared/events/src/index.ts
- @josanz-erp/shared-integrations-email: libs/node/shared/integrations/email/src/index.ts
- @josanz-erp/shared-integrations-storage: libs/node/shared/integrations/storage/src/index.ts
- @josanz-erp/auth-jwt: libs/node/auth/jwt/src/index.ts
- @josanz-erp/verifactu-adapters: libs/node/adapters/verifactu/adapters/src/index.ts
- @josanz-erp/billing-backend: libs/node/backend/billing/backend/src/index.ts
- @josanz-erp/budget-backend: libs/node/backend/budget/backend/src/index.ts
- @josanz-erp/clients-backend: libs/node/backend/clients/backend/src/index.ts
- @josanz-erp/delivery-backend: libs/node/backend/delivery/backend/src/index.ts
- @josanz-erp/fleet-backend: libs/node/backend/fleet/backend/src/index.ts
- @josanz-erp/identity-backend: libs/node/backend/identity/backend/src/index.ts
- @josanz-erp/inventory-backend: libs/node/backend/inventory/backend/src/index.ts
- @josanz-erp/rentals-backend: libs/node/backend/rentals/backend/src/index.ts

### Browser (libs/browser/)
- @josanz-erp/shared-data-access: libs/browser/shared/data-access/src/index.ts
- @josanz-erp/shared-ui-kit: libs/browser/shared/ui-kit/src/index.ts
- @josanz-erp/shared-ui-shell: libs/browser/shared/ui-shell/src/index.ts
- @josanz-erp/identity-data-access: libs/browser/data-access/identity/data-access/src/index.ts
- @josanz-erp/identity-feature: libs/browser/feature/identity/feature/src/index.ts
- @josanz-erp/identity-shell: libs/browser/shell/identity/shell/src/index.ts
- @josanz-erp/billing-data-access: libs/browser/data-access/billing/data-access/src/index.ts
- @josanz-erp/billing-feature: libs/browser/feature/billing/feature/src/index.ts
- @josanz-erp/billing-shell: libs/browser/shell/billing/shell/src/index.ts
- @josanz-erp/clients-data-access: libs/browser/data-access/clients/data-access/src/index.ts
- @josanz-erp/clients-feature: libs/browser/feature/clients/feature/src/index.ts
- @josanz-erp/clients-shell: libs/browser/shell/clients/shell/src/index.ts
- @josanz-erp/delivery-data-access: libs/browser/data-access/delivery/data-access/src/index.ts
- @josanz-erp/delivery-feature: libs/browser/feature/delivery/feature/src/index.ts
- @josanz-erp/delivery-shell: libs/browser/shell/delivery/shell/src/index.ts
- @josanz-erp/fleet-data-access: libs/browser/data-access/fleet/data-access/src/index.ts
- @josanz-erp/fleet-feature: libs/browser/feature/fleet/feature/src/index.ts
- @josanz-erp/fleet-shell: libs/browser/shell/fleet/shell/src/index.ts
- @josanz-erp/inventory-data-access: libs/browser/data-access/inventory/data-access/src/index.ts
- @josanz-erp/inventory-feature: libs/browser/feature/inventory/feature/src/index.ts
- @josanz-erp/inventory-shell: libs/browser/shell/inventory/shell/src/index.ts
- @josanz-erp/rentals-data-access: libs/browser/data-access/rentals/data-access/src/index.ts
- @josanz-erp/rentals-feature: libs/browser/feature/rentals/feature/src/index.ts
- @josanz-erp/rentals-shell: libs/browser/shell/rentals/shell/src/index.ts
- @josanz-erp/verifactu-data-access: libs/browser/data-access/verifactu/data-access/src/index.ts
- @josanz-erp/verifactu-feature: libs/browser/feature/verifactu/feature/src/index.ts
- @josanz-erp/verifactu-shell: libs/browser/shell/verifactu/shell/src/index.ts
- @josanz-erp/budget-data-access: libs/browser/data-access/budget/data-access/src/index.ts
- @josanz-erp/budget-feature: libs/browser/feature/budget/feature/src/index.ts
- @josanz-erp/budget-shell: libs/browser/shell/budget/shell/src/index.ts
- @josanz-erp/settings-feature: libs/browser/feature/settings/feature/src/index.ts
- @josanz-erp/settings-shell: libs/browser/shell/settings/shell/src/index.ts

## Implementation Steps
1. Update tsconfig.base.json paths for all aliases to new locations
2. Update import statements in apps/backend/src/, apps/frontend/src/, and all lib src/ files
3. Update any remaining project.json, jest.config.cts paths for moved libs
4. Test TypeScript compilation and fix any remaining errors
5. Run builds to ensure everything works

## Tools
- Use search/replace in IDE or scripts to update imports
- Update tsconfig.base.json manually or with script

## Completion
After updates, the codebase should compile without path errors and builds should succeed.