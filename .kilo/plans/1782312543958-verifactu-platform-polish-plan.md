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
- [ ] Merge `verifactu-crm-api/prisma/schema.prisma` y schema de `verifactu-api`
- [ ] Añadir tablas faltantes: `idempotency_keys`, `outbox_events`, `webhook_endpoints`, `webhook_deliveries`
- [ ] Añadir campo `verifactu_status` a invoices (DRAFT, PENDING, SENT, ERROR, REJECTED)
- [ ] Crear migration para `record_kind` ENUM con valores INVOICE, RECTIFICATIVE, CANCELLATION

### Task 1.2: Repository Port Implementation
- [ ] Implementar `VerifactuInvoiceRepositoryPort` completamente en `verifactu-adapters`
- [ ] Añadir métodos: `findInvoiceWithDetails`, `updateChainPointers`, `createChainBlock`, `getLastAcceptedHash`
- [ ] Añadir repository para `idempotency_keys` con búsqueda por key + tenant

### Task 1.3: Outbox Pattern Setup
- [ ] Implementar `OutboxEvent` model en Prisma (ya existe, falta procesamiento)
- [ ] Crear `OutboxProcessorService` que procese eventos pendientes cada X segundos
- [ ] Liga outbox con `verifactu_queue_items` para sincronizar ERP

---

## Phase 2: Core Submission Refinement (Week 2)

### Task 2.1: Implementar Caso de Uso Rectificativa
- [ ] `CreateRectificativaUseCase` en `verifactu-core/application`
- [ ] Validar: invoice original debe existir y estar SENT
- [ ] Generar nueva factura con `invoice_kind: RECTIFICATIVE`
- [ ] Calcular hash encadenando al bloque anterior del original

### Task 2.2: Implementar Caso de Uso Anulación
- [ ] `CancelInvoiceUseCase` que marque invoice como CANCELLED
- [ ] Generar registro de anulación en chain_blocks con `record_kind: CANCELLATION`
- [ ] Calcular huella según especificación AEAT (TipoOperación=2)

### Task 2.3: Integrar Chain Verification
- [ ] Antes de enviar a AEAT, verificar hash chain del tenant
- [ ] Si chain rota, abortar con error y crear alerta
- [ ] Añadir endpoint `/v1/chain/verify` con reporte detallado

---

## Phase 3: Resiliencia y Colas (Week 3)

### Task 3.1: Migrar a BullMQ/Redis
- [ ] Instalar dependencias: `bullmq`, `ioredis`
- [ ] Crear `VerifactuQueueModule` en adapters
- [ ] Reemplazar cron polling con worker BullMQ
- [ ] Configuración: concurrency=5, backoff exponencial 2^n minutos

### Task 3.2: Retry y DLQ
- [ ] Mover items fallidos a `verifactu_dead_letter_queue` después de maxRetries
- [ ] Exponencial backoff: 1m, 2m, 4m, 8m, 16m
- [ ] Métricas: contador de DLQ, tasa de éxito por hora

### Task 3.3: Idempotencia en API
- [ ] Middleware `IdempotencyGuard` que verifique header `Idempotency-Key`
- [ ] Tabla `idempotency_keys` con unique(tenant_id, idempotency_key)
- [ ] Retornar respuesta cached si key ya procesada

---

## Phase 4: Seguridad Multi-Tenant (Week 4)

### Task 4.1: API Keys con scopes
- [ ] Tabla `tenant_api_keys` con `key_hash`, `scopes` (submit, query, manage_webhooks)
- [ ] Guard renovado: `VerifactuApiKeyGuard` verifica scopes y tenant
- [ ] Rotación de keys: endpoint `/v1/api-keys/rotate`

### Task 4.2: Firma de Webhooks
- [ ] HMAC SHA256 con secret por webhook endpoint
- [ ] Header `X-Verifactu-Signature` con timestamp para prevenir replay
- [ ] Retry policy: 5 intentos con backoff, luego a DLQ webhooks

### Task 4.3: mTLS para Enterprise
- [ ] Endpoint `/v1/tenant/:id/certificate` para subir cert chain PEM
- [ ] Cifrado AES-256-GCM con key maestra del servidor
- [ ] Validar certificado contra FNMT/AEAT en endpoint

---

## Phase 5: UI Enhancement (Week 5)

### Task 5.1: Dashboard Chain Status
- [ ] Card "Cadena de Hash" con estado verde/rojo
- [ ] Último bloque, número de registros, próximo a enviar
- [ ] Botón "Verificar cadena" manual

### Task 5.2: Rectificativa Wizard
- [ ] Formulario: tipo S/I, motivo, facturas a rectificar
- [ ] Preview del XML generado con hashes
- [ ] Confirmación antes de enviar

### Task 5.3: Certificate Management UI
- [ ] Upload PEM de certificado (drag & drop)
- [ ] Mostrar subject, valid-to, estado de conexión
- [ ] Test de conexión mTLS contra endpoint AEAT

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

## Decision Points (Aclarar con Usuario)

### DP-1: ¿Usar BullMQ o mantener cron polling?
- **Recomendado**: BullMQ - más robusto, DLQ, retry policy formal
- **Alternativa**: Mantener cron para simplicidad, añadir lock distribuido

### DP-2: ¿Unificar verifactu-crm-api y verifactu-api?
- **Recomendado**: Sí, tener un único API service
- **Alternativa**: Mantener separados con shared-db

### DP-3: ¿Modo rectificación automática o manual?
- **Recomendado**: Manual desde UI con wizard
- **Alternativa**: Automático al crear invoice con `rectifies_invoice_id`

### DP-4: ¿Firma de webhooks con timestamp?
- **Recomendado**: Sí, 5 minutos ventana
- **Alternativa**: Solo firma HMAC sin timestamp

---

## Definition of Done (DoD)

- [ ] Cobertura >80% en `verifactu-core` y `verifactu-adapters`
- [ ] Todas operaciones mutables con idempotencia
- [ ] Webhooks con firma HMAC + retry policy
- [ ] Chain verification integrada en submit
- [ ] Worker BullMQ con DLQ y métricas
- [ ] UI muestra estado cadena + certificados
- [ ] Tests contra mocks AEAT (errores 1001-1003)