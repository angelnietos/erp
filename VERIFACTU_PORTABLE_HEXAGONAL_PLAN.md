# Verifactu Portable Platform

Plan de arquitectura para convertir Verifactu en un producto reutilizable, portable y comercializable (API SaaS + integración para ERP interno y terceros).

## 1) Objetivo

Evolucionar la implementación actual de Verifactu a una plataforma desacoplada del ERP:

- reusable en varios proyectos,
- vendible como servicio de integración fiscal,
- preparada para cambios normativos y escalado,
- con arquitectura hexagonal y contratos estables.

## 2) Principios de diseño

- Dominio primero: la lógica fiscal vive en el dominio, no en controllers.
- Hexagonal (Ports & Adapters): el core no conoce Nest, Prisma, HTTP ni colas.
- Contratos versionados: API y eventos versionados (`v1`, `v2`).
- Idempotencia y trazabilidad: obligatorio en operaciones de emisión/cancelación.
- Multi-tenant desde el inicio: aislamiento por `tenantId`.
- Compliance by design: auditoría, hash chain, evidencias y logs firmados.

## 3) Contextos funcionales (bounded contexts)

Separar el producto en contextos claros:

1. `BillingDocument`
   - normalización de factura,
   - validaciones fiscales,
   - generación de artefactos (XML/QR/hash).

2. `Submission`
   - envío a AEAT,
   - reintentos y backoff,
   - estados y reconciliación.

3. `ComplianceLedger`
   - trazabilidad inmutable,
   - cadena de hash,
   - evidencia auditable.

4. `TenantManagement`
   - empresas, certificados, series,
   - API keys, límites y plan.

5. `IntegrationAPI`
   - endpoints REST,
   - webhooks salientes,
   - query de registros.

## 4) Arquitectura hexagonal propuesta

Cada contexto sigue el mismo patrón:

- `domain/`
  - entidades, value objects, domain services, domain events.
- `application/`
  - casos de uso (commands/queries), orchestrators.
- `ports/`
  - interfaces de entrada/salida.
- `adapters/`
  - `in/http` (controllers),
  - `out/persistence` (Prisma/Postgres),
  - `out/aeat`, `out/certificate`, `out/queue`, `out/webhook`.
- `infrastructure/`
  - wiring/DI, config, observabilidad.

Regla: `domain` no importa nada de `adapters`.

## 5) Estructura sugerida de repo

```text
verifactu-platform/
  apps/
    api/                    # REST API pública
    worker-submission/      # workers de envío/reintentos
    worker-webhooks/        # delivery de webhooks
  libs/
    verifactu-domain/
      billing-document/
      submission/
      compliance-ledger/
      tenant-management/
    verifactu-application/
      use-cases/
      dto/
    verifactu-ports/
      in/
      out/
    verifactu-adapters/
      http-rest/
      persistence-prisma/
      aeat-soap/
      queue-bullmq/
      certificates/
      webhooks/
    verifactu-contracts/
      openapi/
      events/
  docs/
    adr/
```

## 6) Mapeo de lo que ya existe (reutilización)

Del código actual de `C:\Users\amuni\Desktop\josanz-proyect\verifactu`:

- `xml`, `hash`, `qr` -> mover a `verifactu-domain/billing-document` (servicios de dominio + puertos).
- `aeat/aeat-soap.service.ts` -> `adapters/out/aeat-soap`.
- `certificate/*` -> `adapters/out/certificates`.
- `queue/*` -> `adapters/out/queue`.
- `record-query`, `compliance` -> `compliance-ledger` + `integration-api`.
- `invoice/*`, `documents/*` -> casos de uso en `application/use-cases`.

No rehacer desde cero: extraer por capas.

## 7) Contrato API mínimo (v1)

### Endpoints core

- `POST /v1/invoices`
- `POST /v1/invoices/{id}/submit`
- `POST /v1/invoices/{id}/cancel`
- `GET /v1/invoices/{id}`
- `GET /v1/invoices/{id}/artifacts`
- `GET /v1/records`
- `POST /v1/webhooks/endpoints`

### Reglas

- Header obligatorio: `Idempotency-Key` en creación/envío/cancelación.
- Header obligatorio: `X-Tenant-Id` (o derivado por API key).
- Errores normalizados (problem+json).
- Estados explícitos: `DRAFT`, `PENDING_SUBMISSION`, `SUBMITTED`, `ACCEPTED`, `REJECTED`, `CANCELLED`.

## 8) Modelo de datos recomendado

Tablas clave:

- `tenants`
- `tenant_api_keys`
- `tenant_certificates`
- `invoices`
- `invoice_lines`
- `invoice_hash_chain`
- `submission_attempts`
- `aeat_responses`
- `webhook_endpoints`
- `webhook_deliveries`
- `audit_events`
- `idempotency_keys`
- `outbox_events`

Todos los agregados con `tenant_id`.

## 9) Integración con ERP Josanz

Patrón recomendado:

- ERP no implementa lógica fiscal, solo invoca API Verifactu.
- Guardar en ERP:
  - `verifactuInvoiceId`,
  - `verifactuStatus`,
  - `lastSubmissionAt`,
  - `errorCode/errorMessage` (si aplica).
- Sincronización por webhooks:
  - `invoice.submitted`
  - `invoice.accepted`
  - `invoice.rejected`
  - `invoice.cancelled`

## 10) Seguridad y cumplimiento

- API keys con hash (no guardar key en claro).
- mTLS opcional enterprise.
- Cifrado de certificados y secretos (KMS/HashiCorp Vault).
- Firma de webhooks (`X-Signature` HMAC SHA256).
- Audit trail inmutable.
- Rate limiting por tenant y plan.

## 11) Observabilidad operativa

- Correlation ID por request y propagado a workers.
- Métricas:
  - latencia por endpoint,
  - ratio de aceptación/rechazo AEAT,
  - retries,
  - webhook success rate.
- Logs estructurados JSON.
- Trazas OpenTelemetry.

## 12) Roadmap de implementación (8 semanas)

### Fase 1 (Semana 1-2): Foundations

- bootstrap repo y estructura hexagonal,
- contratos OpenAPI v1,
- autenticación API key multi-tenant,
- tabla `idempotency_keys` + outbox.

### Fase 2 (Semana 3-4): Core fiscal

- migrar XML/hash/QR al dominio,
- casos de uso de emisión/cancelación,
- persistencia Prisma/Postgres.

### Fase 3 (Semana 5-6): AEAT + resiliencia

- adapter AEAT SOAP,
- cola/retries/backoff/dlq,
- estados de submission y reconciliación.

### Fase 4 (Semana 7): Integración ERP

- cliente HTTP en ERP,
- webhooks de estado,
- panel mínimo de seguimiento.

### Fase 5 (Semana 8): Hardening y release

- pruebas E2E, carga y resiliencia,
- observabilidad completa,
- documentación comercial/developer portal.

## 13) Criterios de calidad (Definition of Done)

- Cobertura de casos críticos > 80% (application + domain).
- Todas las operaciones mutables con idempotencia.
- Sin imports de infraestructura en `domain`.
- Webhooks con firma y reintentos.
- Recuperación ante caída sin pérdida de eventos (outbox + retries).

## 14) ADRs recomendados (documentar decisiones)

- ADR-001: Hexagonal architecture + bounded contexts.
- ADR-002: Outbox pattern para integración asíncrona.
- ADR-003: Multi-tenant strategy (shared DB + tenant_id).
- ADR-004: API Key auth + scopes.
- ADR-005: Evolución de modular monolith a servicios.

## 15) Riesgos y mitigación

- Cambios normativos AEAT -> versionar reglas y validadores por normativa.
- Acoplamiento legado -> strangler pattern por módulo.
- Bloqueos de entrega webhooks -> DLQ + replay.
- Crecimiento de tenants -> límites, cuotas, particionado futuro.

## 16) Decisión final recomendada

Construir Verifactu como plataforma independiente desde ya, reutilizando el código existente por extracción gradual a capas hexagonales.  
El ERP de Josanz debe pasar a ser primer consumidor del servicio, no contenedor de la lógica fiscal.

