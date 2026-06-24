# Verifactu Platform Polish Plan - Normativa Verifactu Compliance

## Context and Current State

### Three Apps Analysis:
| App | Purpose | Current State |
|-----|---------|---------------|
| `verifactu-crm-api` | CRM-integrado API con Prisma propio | Schema con tenants, invoices, chain_blocks, credentials |
| `verifactu-platform` | UI standalone para gestión Verifactu | Angular + Keycloak + dashboard funcional |
| `verifactu-worker` | Worker de cola con cron cada 10s | Procesa queue items, exponencial backoff |

### Architecture Layers (actual):
- `verifactu-core` (isomorphic): domain services (hash, xml, qr)
- `verifactu-adapters` (node): AEAT clients (mock/real), Prisma, webhooks, HTTP
- `verifactu-crm-api` (app): NestJS con modules de dominio (identity, clients, invoicing, verifactu)
- `verifactu-api` (app): API standalone con más endpoints
- `verifactu-platform` (browser): Angular UI

### Gaps Identified:
1. Duplicación: `verifactu-api` y `verifactu-crm-api` tienen schemas y lógica parcialmente solapada
2. Worker polling: No usa sistema de colas robusto (BullMQ/Redis)
3. Idempotencia: Endpoints sin Idempotency-Key
4. Rectificativas: Implementadas en schema pero no en runtime
5. Webhook delivery: Sin firma HMAC ni retry policy formal
6. Chain verification: No integrado en flujo de envío
7. No hay tabla `idempotency_keys` real ni `outbox_events` con procesamiento

---

## Phase 1: Unify Data Layer (Week 1)

### Task 1.1: Consolidar esquemas Prisma
- [x] Merge `verifactu-crm-api/prisma/schema.prisma` y schema de `verifactu-api`
- [x] Añadir tablas faltantes: `idempotency_keys`, `outbox_events`, `webhook_endpoints`, `webhook_deliveries`, `tenant_api_keys`
- [x] Añadir campo `verifactu_status` a invoices (DRAFT, PENDING, SENT, ERROR, REJECTED)
- [x] Crear migration para nuevas tablas

### Task 1.2: Repository Port Implementation
- [x] Implementar `VerifactuInvoiceRepositoryPort` completamente en adapters
- [x] Añadir métodos: `createRectificativaInvoice`, `createChainBlock`, `markInvoiceAsCancelled`
- [x] Añadir repository para `idempotency_keys` con búsqueda por key + tenant

### Task 1.3: Outbox Pattern Setup
- [x] Schema `OutboxEvent` ya existe
- [ ] Crear `OutboxProcessorService` que procese eventos pendientes cada X segundos
- [ ] Lia outbox con `verifactu_queue_items` para sincronizar ERP

---

## Phase 2: Core Submission Refinement (Week 2)

### Task 2.1: Implementar Caso de Uso Rectificativa
- [x] `CreateRectificativaUseCase` en `verifactu-core/application`
- [x] Validar: invoice original debe existir y estar SENT
- [x] Generar nueva factura con `invoice_kind: RECTIFICATIVE`
- [x] Calcular hash encadenando al bloque anterior del original

### Task 2.2: Implementar Caso de Uso Anulación
- [x] `CancelInvoiceUseCase` que marque invoice como CANCELLED
- [x] Generar registro de anulación en chain_blocks con `record_kind: CANCELLATION`
- [x] Calcular huella según especificación AEAT

### Task 2.3: Integrar Chain Verification
- [ ] Antes de enviar a AEAT, verificar hash chain del tenant
- [ ] Si chain rota, abortar con error y crear alerta
- [ ] Añadir endpoint `/v1/chain/verify` con reporte detallado

---

## Phase 3: Resiliencia y Colas (Week 3)

### Task 3.1: Migrar a BullMQ/Redis
- [x] Instalar dependencias: `bullmq`, `ioredis`, `uuid`
- [x] Crear `VerifactuBullmqQueueService` en adapters
- [x] Reemplazar cron polling con worker BullMQ
- [x] Configuración: concurrency=5, backoff exponencial

### Task 3.2: Retry y DLQ
- [x] BullMQ tiene DLQ automática (removeOnFail)
- [x] Exponencial backoff integrado: 1m, 2m, 4m, 8m, 16m
- [ ] Métricas: contador de DLQ, tasa de éxito por hora

### Task 3.3: Idempotencia en API
- [x] Middleware `IdempotencyGuard` que verifique header `Idempotency-Key`
- [x] Tabla `idempotency_keys` con unique(tenant_id, idempotency_key)
- [x] Retornar respuesta cached si key ya procesada

---

## Phase 4: Seguridad Multi-Tenant (Week 4)

### Task 4.1: API Keys con scopes
- [ ] Tabla `tenant_api_keys` con `key_hash`, `scopes` (submit, query, manage_webhooks)
- [x] Guard actualizado: `VerifactuApiKeyGuard` verifica scopes y tenant
- [ ] Rotación de keys: endpoint `/v1/api-keys/rotate`

### Task 4.2: Firma de Webhooks
- [x] HMAC SHA256 con secret hash por webhook endpoint
- [x] Header `X-Verifactu-Signature` + `X-Verifactu-Timestamp` para prevenir replay
- [ ] Retry policy: 5 intentos con backoff en webhook deliveries

### Task 4.3: mTLS para Enterprise
- [ ] Endpoint `/v1/tenant/:id/certificate` para subir cert chain PEM
- [ ] Cifrado AES-256-GCM con key maestra del servidor
- [ ] Validar certificado contra FNMT/AEAT en endpoint

---

## Phase 5: UI Enhancement (Week 5)

### Task 5.1: Dashboard Chain Status
- [x] `chain/verify` endpoint implementado
- [x] `verifactu-chain-page.component` existe con verificación

### Task 5.2: Rectificativa Wizard
- [x] `createRectificativa` endpoint existente en controller
- [x] Controller POST `/invoices/:id/rectify` implementado

### Task 5.3: Certificate Management UI
- [x] Endpoints de credentials existentes: status, upsert, delete
- [ ] UI drag & drop para upload PEM
- [ ] Mostrar subject, valid-to, estado conexión

---

## Phase 6: Compliance & Testing (Week 6)

### Task 6.1: Tests de Hash Chain
- [ ] Unit tests: generación de huella, verificación encadenamiento
- [ ] Test caso: cadena con registro anterior roto
- [ ] Test caso: primer registro vs posteriores

### Task 6.2: Tests de Idempotencia
- [ ] Mismo Idempotency-Key devuelve misma respuesta
- [ ] Key usada en request fallido permite reintento
- [ ] Test paralelo: 2 requests simultáneos mismo key

### Task 6.3: Tests AEAT Integration
- [ ] Mock AEAT que simule errores 1001, 1002, 1003
- [ ] Test retry en errores recuperables
- [ ] Test fallo permanente -> DLQ

---

## Progreso Ejecución

| Archivo modificado | Descripción |
|------------------|-----------|
| `apps/verifactu-crm-api/prisma/schema.prisma` | Añadidas tablas `IdempotencyKey`, `TenantApiKey`, `OutboxEvent.tenantId`, `verifactu_status` |
| `libs/node/adapters/verifactu/adapters/package.json` | Dependencias `bullmq`, `ioredis`, `uuid` |
| `libs/node/adapters/verifactu/adapters/src/lib/queue/verifactu-bullmq-queue.service.ts` | Worker BullMQ con backoff exponencial |
| `libs/node/adapters/verifactu/adapters/src/lib/queue/outbox-processor.service.ts` | Procesador de eventos outbox |
| `libs/node/adapters/verifactu/adapters/src/lib/security/idempotency.guard.ts` | Guard de idempotencia |
| `libs/node/adapters/verifactu/adapters/src/lib/webhooks/prisma-webhook-notifier.service.ts` | HMAC + timestamp en webhooks |
| `libs/node/adapters/verifactu/adapters/src/lib/persistence/prisma-verifactu.repository.ts` | Métodos `createRectificativaInvoice`, `createChainBlock`, `markInvoiceAsCancelled` |
| `libs/crm/node/backend/verifactu/backend/src/lib/application/create-rectificativa.use-case.ts` | Caso de uso rectificativa |
| `libs/crm/node/backend/verifactu/backend/src/lib/application/cancel-invoice.use-case.ts` | Caso de uso anulación |
| `apps/verifactu-crm-api/.env.example` | Variables Redis e idempotencia |

---

---

## Decisions Taken

1. **BullMQ (Redis-backed)** - Colas robustas con DLQ automática
2. **Unificar APIs** - `verifactu-crm-api` y `verifactu-api` en único servicio
3. **Rectificación manual con wizard** - Requiere verificación explícita
4. **Webhooks HMAC + timestamp** - 5 minutos ventana para prevenir replay

---

## Definition of Done (DoD)

- [x] Schema actualizado con tablas `idempotency_keys`, `webhook_endpoints`, `webhook_deliveries`, `tenant_api_keys`
- [x] `verifactu_status` añadido a invoices
- [x] `HashChainService` soporta OperationType (INVOICE/RECTIFICATIVE/CANCELLATION)
- [x] `VerifactuInvoiceRepositoryPort` ampliado con métodos de rectificación/anulación
- [x] BullMQ dependencies instaladas (`bullmq`, `ioredis`, `uuid`)
- [x] `VerifactuBullmqQueueService` creado (worker BullMQ con backoff exponencial)
- [x] `IdempotencyGuard` creado (header Idempotency-Key)
- [x] `PrismaWebhookNotifierService` actualizado con timestamp HMAC
- [x] `OutboxProcessorService` creado
- [x] `CreateRectificativaUseCase` y `CancelInvoiceUseCase` creados
- [ ] Cobertura >80% en `verifactu-core` y `verifactu-adapters`
- [ ] Chain verification integrada en submit (stub pendiente)
- [ ] Worker BullMQ con DLQ y métricas (DLQ configurada)
- [ ] Tests contra mocks AEAT (errores 1001-1003)