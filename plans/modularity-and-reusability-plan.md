# Plan de Mejora de Modularidad y Reutilización

## Estado Actual

### Estructura de libs/ actual

```
libs/
├── billing/        # api, data-access, feature, shell (estructura Angular, NO dominio)
├── budget/        # api, core, data-access, feature, shell (completo)
├── clients/       # api, core, data-access, feature, shell (completo)
├── delivery/     # core, feature (parcial - falta api, data-access, shell)
├── fleet/         # core (parcial - falta api, feature, data-access, shell)
├── identity/     # api, core, data-access, feature, shell (completo)
├── inventory/    # api, core, data-access (falta feature, shell)
├── rentals/      # api (parcial)
├── verifactu/    # adapters, api, core, data-access, feature, shell, legacy (completo)
└── shared/
    ├── config/     # Environments y validación
    ├── data-access # Prisma y Outbox
    ├── events/     # Event Bus y Event Store
    ├── model/      # Entidades base, Value Objects
    ├── ui-kit/    # Componentes reutilizables
    └── utils/     # Utilidades varias
```

### Estructura de apps/ actual

```
apps/
├── backend/        # NestJS - contiene módulos DDD: billing, budget, clients, delivery, fleet, identity, inventory, rentals, verifactu
├── frontend/       # Angular - Cliente web
├── frontend-e2e/  # Tests E2E
└── verifactu-api/ # API facturación独立的 (usa libs/verifactu)
```

### Observaciones del Estado Actual

1. **Dominios en libs/** tienen estructura Angular (feature/shell) pero les falta la lógica de dominio DDD (core)
2. **Dominios en apps/backend/** tienen lógica DDD pero no están extraídos a libs
3. **verifactu** es el más completo: tiene estructura DDD en libs Y una API dedicada en apps/
4. **shared/infrastructure en backend** tiene código que podría moverse a libs/shared (email, outbox, prisma)

---

## Objetivos

1. **Maximizar la reutilización** entre proyectos/apps
2. **Centralizar lógica de dominio** en libs independientes
3. **Extraer integraciones API** a libs compartidas
4. **Mejorar la separación de responsabilidades**

---

## Mejoras Propuestas

### 1. Crear libs/shared/integrations/ para APIs externas

Las integraciones con servicios externos actualmente en apps/backend/src/shared/infrastructure/ deberían moverse a libs compartidas:

```
libs/
├── shared/
│   └── integrations/
│       ├── email/           # NUEVO - Port y adapters para email (SendGrid, SMTP)
│       │   ├── src/
│       │   │   └── lib/
│       │   │       ├── email.port.ts       (ya existe en backend)
│       │   │       ├── adapters/
│       │   │       │   ├── sendgrid.adapter.ts
│       │   │       │   └── smtp.adapter.ts
│       │   │       └── email.module.ts
│       └── storage/         # NUEVO - Port y adapters para storage (S3, local)
```

**Verifactu ya está bien estructurado** en libs/verifactu/ con adapters, api, core, etc. La verifactu-api en apps/ solo lo consume.

**Nota**: El código de email ya existe en backend y debería moverse a shared/integrations.

---

### 2. Mover autenticación y permisos a libs/shared

El código de autenticación está disperso entre apps/backend y libs/. Unificar:

```
libs/
├── auth/                   # NUEVO
│   ├── jwt/               # JWT strategy y guards
│   │   ├── src/lib/
│   │   │   ├── guards/jwt-auth.guard.ts
│   │   │   ├── strategies/jwt.strategy.ts
│   │   │   └── services/jwt.service.ts
│   ├── api-key/           # API Key para verifactu
│   │   ├── src/lib/
│   │   │   └── guards/api-key.guard.ts
│   └── permissions/        # Permisos y roles
│       ├── src/lib/
│       │   ├── guards/permissions.guard.ts
│       │   └── services/permissions.service.ts
```

**YA EXISTE PARCIALMENTE**:
- `libs/verifactu/adapters/src/lib/security/verifactu-api-key.guard.ts` - mover a auth/
- `apps/backend/src/shared/infrastructure/guards/jwt-auth.guard.ts` - mover a auth/

---

### 3. Normalizar estructura de libs de dominio

Varios dominios en libs/ tienen estructura Angular (feature, shell) pero les falta la lógica de dominio DDD. Mientras tanto, el código DDD está en apps/backend/src/modules/. La meta es:

1. **Mover la lógica DDD de apps/backend/src/modules/ a libs/[dominio]/core/**
2. **Completar las libs que faltan estructura**

```
libs/
├── [dominio]/
│   ├── api/              # DTOs, tipos, interfaces (ya existe)
│   ├── core/             # Entities, repositories ports, services (MOVER desde app/backend)
│   ├── data-access/      # Implementaciones de repositories (MOVER desde app/backend)
│   ├── feature/          # Componentes de UI (Angular) (ya existe)
│   └── shell/            # Routing y composición de features (ya existe)
```

#### Dominios a normalizar:

| Dominio | Estado en libs/ | Estado en apps/backend | Acción |
|---------|-----------------|------------------------|--------|
| billing | api, data-access, feature, shell (Angular) | Módulo DDD completo | Mover domain a core + data-access |
| budget | Completo ✅ | Solo uso | ✅ Listo |
| clients | Completo ✅ | Solo uso | ✅ Listo |
| delivery| core, feature | Módulo DDD | Completar + mover data-access |
| fleet | core | Módulo DDD | Completar + mover data-access |
| identity | Completo ✅ | Solo uso | ✅ Listo |
| inventory| api, core, data-access | Módulo DDD | Completar feature + shell |
| rentals | api | Módulo DDD | Completar libs + mover logic |
| verifactu | Completo ✅ | Solo uso | ✅ Listo |



```
libs/
├── config/
│   ├── environments/      # ✅ Ya existe
│   ├── validators/       # ✅ Ya existe
│   └── schema/           # NUEVO - Schemas de configuración
│       ├── src/lib/schemas/
│       │   ├── app.config.schema.ts
│       │   ├── database.config.schema.ts
│       │   └── api.config.schema.ts
```

---

### 6. Extraer lógica de domain events a libs

```
libs/
├── events/           # ✅ Ya existe
├──cqrs/              # NUEVO - Comando/Query Handler
│   ├── src/lib/commands/
│   ├── src/lib/queries/
│   └── src/lib/handlers/
└── saga/              # NUEVO - Orquestación de sagas
    └── src/lib/
```

---

### 7. Crear libs de testing compartidas

```
libs/
├── testing/
│   ├── jest/
│   │   ├── src/lib/global-setup.ts
│   │   ├── src/lib/global-teardown.ts
│   │   └── src/lib/matchers/
│   ├── mocks/
│   │   ├── src/lib/repositories/
│   │   └── src/lib/services/
│   └── assertions/
│       └── src/lib/
```

---

## Plan de Implementación (Fases)

### Fase 1: Refactorización de libs/shared (integrations)

- [ ] Crear `libs/shared/integrations/email/`
  - Mover desde `apps/backend/src/shared/infrastructure/email/`
  - Agregar adapters (SendGrid, SMTP)
- [ ] Crear `libs/shared/integrations/storage/` (si aplica)
- [ ] Verificar que las libs existentes de dominio (budget, clients, identity, verifactu) funcionan correctamente

### Fase 2: Normalización de dominios (mover código DDD de apps/backend a libs)

- [ ] **billing**: Mover lógica de `apps/backend/src/modules/billing/` a `libs/billing/core/` y `libs/billing/data-access/`
- [ ] **delivery**: Completar `libs/delivery/` con api, data-access, shell; mover repositories
- [ ] **fleet**: Completar `libs/fleet/` con api, feature, data-access, shell
- [ ] **inventory**: Completar `libs/inventory/` con feature, shell
- [ ] **rentals**: Completar `libs/rentals/` con core, data-access, feature, shell

### Fase 3: libs/auth para autenticación unificada

- [ ] Crear `libs/auth/jwt/`
  - Mover JWT strategy desde `apps/backend/src/modules/identity/`
  - Mover guard desde `apps/backend/src/shared/infrastructure/guards/`
- [ ] Crear `libs/auth/api-key/`
  - Mover `VerifactuApiKeyGuard` desde `libs/verifactu/adapters/`
- [ ] Crear `libs/auth/permissions/` para RBAC

### Fase 4: libs de infraestructura

- [ ] Crear `libs/cqrs/` para comando/query handling
- [ ] Crear `libs/testing/` utilities (mocks, fixtures, assertions)
- [ ] Mejorar `libs/shared/model/` con más base classes
- [ ] Agregar schemas de configuración en `libs/shared/config/schema/`

---

## Beneficios Esperados

| Área | Beneficio |
|------|-----------|
| **Reutilización** | Mismo código de integración usable en múltiples proyectos |
| **Mantenimiento** | Cambios en una lib se propagan a todas las apps |
| **Testing** | Tests unitarios de libs son más rápidos y aislados |
| **Onboarding** | Nuevos desarrolladores tienen estructura consistente |
| **Escalabilidad** | Agregar nuevas apps es einfach con libs existentes |

---

## Consideraciones

1. **Versionado**: Usar semantic versioning para libs compartidas
2. **Dependencias**: Evitar dependencias circulares entre libs
3. **Documentación**: Cada lib debe tener README con ejemplos de uso
4. **Testing**: Tests de integración deben ejecutarse en CI/CD
5. **Nx**: Usar buildable y publishable libraries para producción
