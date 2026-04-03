# Josanz ERP Libs Reorganization Plan

## Objective
Reorganize the `libs/` folder from a domain-oriented structure to an environment-oriented structure based on the Library Matrix in `josanz.md`. This will create new abstraction layers for isomorphic, node, and browser environments, allowing these top-level folders to be built as global bundles for plugins.

## Current Structure
- Domain-oriented: `libs/<domain>/<lib-type>/`
- Examples: `libs/delivery/api/`, `libs/identity/backend/`, `libs/shared/ui-kit/`

## New Structure
- Environment-oriented: `libs/<environment>/<lib-type>/<domain>/`
- Top-level environments: `isomorphic/`, `node/`, `browser/`
- These will become Nx libs for bundling global builds.

### Environment Mappings

#### Isomorphic (TS Pure, shared contracts and domain logic)
- api: Interfaces and DTOs for all domains
- core: Domain entities, services, ports for all domains
- shared/model: Domain models (entities, value objects, errors)
- shared/utils: Utility functions
- shared/config: Configuration interfaces

#### Node (NestJS backend implementations)
- backend: Controllers, adapters, repositories for all domains
- shared-infrastructure: Outbox, CQRS, events infrastructure
- shared/cqrs: CQRS patterns
- shared/events: Event handling
- shared/integrations: External service integrations

#### Browser (Angular frontend)
- data-access: Signals stores, HTTP clients for all domains
- feature: Smart components for all domains
- shell: Routing and lazy loading shells for all domains
- ui-kit: Dumb components (shared)
- ui-shell: Shared shell components
- shared/data-access: Shared data access utilities

### Special Cases
- verifactu/: Has its own structure; map api, core, backend, data-access, feature to appropriate environments
- auth/: Treat as a domain, map accordingly
- Legacy code in verifactu/legacy/: May need separate handling or migration

## Implementation Steps
1. **Analyze and Map**: Document exact mapping of each current lib to new location
2. **Create Folders**: Create `libs/isomorphic/`, `libs/node/`, `libs/browser/`
3. **Move Isomorphic Libs**: Move all api, core, shared/model, etc.
4. **Move Node Libs**: Move all backend, shared-infrastructure, etc.
5. **Move Browser Libs**: Move all data-access, feature, shell, ui-kit, etc.
6. **Handle Special Cases**: verifactu, auth, legacy
7. **Create Nx Configs**: Configure isomorphic, node, browser as bundle libs
8. **Update Imports**: Change all import paths across codebase
9. **Update Configs**: project.json, tsconfig for new structure
10. **Test Builds**: Ensure builds work after reorganization
11. **Update Docs**: Reflect changes in josanz.md and this plan

## Benefits
- Environment-specific bundling for plugins
- Cleaner separation of concerns
- Easier maintenance and scaling
- Alignment with hexagonal architecture principles

## Risks
- Import path changes may break builds initially
- Large refactoring effort
- Need to ensure all dependencies are correctly mapped

## New Structure After Implementation
- libs/isomorphic/
  - api/delivery/, api/identity/, api/billing/, api/verifactu/
  - core/delivery/, core/identity/, core/billing/, core/verifactu/
  - shared/model/, shared/utils/, shared/config/
  - auth/api-key/
- libs/node/
  - backend/billing/, backend/budget/, backend/clients/, backend/delivery/, backend/fleet/, backend/identity/, backend/rentals/
  - shared-infrastructure/
  - shared/cqrs/, shared/events/, shared/integrations/
  - auth/jwt/
  - adapters/verifactu/
  - legacy/verifactu/
- libs/browser/
  - data-access/delivery/, data-access/identity/, data-access/inventory/, data-access/verifactu/
  - feature/delivery/, feature/identity/, feature/fleet/, feature/inventory/, feature/verifactu/
  - shell/delivery/, shell/identity/, shell/fleet/, shell/inventory/
  - shared/ui-kit/, shared/ui-shell/, shared/data-access/

## Next Steps
- Update all project.json, tsconfig, and import paths to reflect new locations
- Configure top-level environments as bundle libs if needed
- Test builds and fix any issues
- Update documentation