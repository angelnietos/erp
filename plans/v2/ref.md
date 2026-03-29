# Architecture Roadmap: Contract-First for Josanz ERP

> Status: Draft v2 | Target: Modular Monolith with Shared DTOs

## 🎯 Objectives

- **Data Integrity**: Single DTO definition eliminates "missing field" errors between Back and Front.
- **Productivity**: Add a field in the DTO shared library → immediately available in Front with TS autocompletion.
- **Modularity**: Complete separation between backend implementation (NestJS/Prisma) and public contract (Interfaces/Types).

---

## 🏗️ Proposed Architecture: Domain-Shared-DTO Pattern

Each domain (Budget, Inventory, Fleet, Delivery, Identity) follows this structure:

```
libs/{domain}/
├── api/           # 📦 Shared Library ( Agnostic )
│   └── src/lib/   #   → Interfaces, Types, Enums, Validators
├── backend/       # 🛡 Backend Logic
│   └── src/lib/  #   → NestJS Services, Prisma Repositories
├── feature/       # 🎨 Frontend UI
│   └── src/lib/  #   → Angular Components
└── shell/         # 🐚 Route Shell
```

### Example: Budget Domain

| Library | Responsibility | Consumers |
|---------|---------------|------------|
| `libs/budget/api` | DTOs, Interfaces, Enums | Backend + Frontend |
| `libs/budget/backend` | Business Logic, NestJS Modules | NestJS App |
| `libs/budget/feature` | Angular Components | NX Shell |

---

## ✅ Benefits

1. **Zero Redundancy**: Change a field in the DTO → both Back validation and Front form update automatically.
2. **Agnosticism**: Front imports no NestJS/Prisma heavy code, only pure TS types.
3. **Scalability**: If tomorrow you extract backend to a microservice, Front doesn't notice—only consumes the shared contract.

---

## 📋 Migration Steps (Draft)

1. [ ] Audit existing DTOs currently trapped in backend private libraries.
2. [ ] Create `libs/{domain}/api` libraries for each domain.
3. [ ] Move Interfaces/Types/Enums to the new api libs.
4. [ ] Update backend imports to consume from api libs.
5. [ ] Update frontend imports to consume from api libs.
6. [ ] Verify compilation and runtime.
7. [ ] Remove duplicated types from backend libs.

---

## 🔄 Next Steps

- Apply critical fixes (BudgetCreateComponent inline mode)
- Verify the application compiles
- Execute the migration plan domain by domain

---

## 📝 Execution Log

### 2026-03-29 - All Domains Refactored ✅

**Domains Completed:**
1. ✅ **Budget**: Added `CreateBudgetDTO`, `AddBudgetItemDTO` to api; re-export in backend
2. ✅ **Identity**: Added `LoginCredentials` to api; re-export in backend
3. ✅ **Billing**: Added `SubmitInvoiceCommand` to api; re-export in backend
4. ✅ **Inventory**: Added `Product`, `InventoryStats` to api; ready for consumption
5. ✅ **Fleet**: Added `Vehicle`, `Driver` to api; ready for consumption
6. ✅ **Delivery**: Added `DeliveryNote`, `DeliveryItem` to api; ready for consumption

**Files Modified:**
- `libs/*/api/src/lib/*.ts` - Added shared interfaces
- `libs/*/backend/src/lib/application/dtos/*.ts` - Added re-exports from api

**Verification:**
- ✅ All api libs compile successfully

**Next Steps:** Update frontend data-access libs to consume from api libs

---

## 🔧 Additional Fixes Applied

### 2026-03-29 - Frontend Build Errors Fixed

**Fixed:**
1. [`libs/shared/ui-kit/src/lib/pipes/select-mapper.pipe.ts`](libs/shared/ui-kit/src/lib/pipes/select-mapper.pipe.ts)
   - Fixed generic type constraint for Client/Product arrays
   - Changed return type to `{ label: string; value: any }` for proper template binding

2. [`apps/frontend/src/app/app.ts`](apps/frontend/src/app/app.ts)
   - Removed import of missing `AppNavComponent` (file doesn't exist)

3. Added `build` target to `libs/shared/ui-shell/project.json`
   - Fixed JSON syntax
   - Missing `ng-packagr` dependency installed
   - Still has schema validation issue (pre-existing infrastructure problem)

**Note:** Frontend build has pre-existing infrastructure issues:
- `shared-ui-shell` and `ui-kit` missing proper build config
- These are separate issues from the contract-first refactor
