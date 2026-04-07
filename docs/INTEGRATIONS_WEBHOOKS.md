# Contrato de webhooks salientes (Josanz ERP)

## Cabeceras en el `POST` al receptor

| Cabecera | Descripción |
|----------|-------------|
| `Content-Type` | `application/json` |
| `X-Josanz-Signature` | `sha256=<HMAC-SHA256(secret, body)>` del cuerpo JSON tal cual se envía |
| `X-Josanz-Event-Id` | UUID del registro en `domain_events` (idempotencia en el lado del consumidor) |

## Cuerpo JSON

Incluye `id`, `eventType`, `aggregateType`, `aggregateId`, `payload` y `occurredAt` (ISO 8601).

## Idempotencia recomendada

El consumidor **debe** tratar `X-Josanz-Event-Id` como clave idempotente: si ya procesó ese id, responder `2xx` sin repetir efectos secundarios. Josanz puede reintentar entregas; sin deduplicación el receptor podría duplicar acciones.

## Calendario ICS

`GET /api/integrations/calendar/feed.ics` con cabecera `x-tenant-id` (UUID válido) devuelve un iCalendar con hasta 500 eventos del tenant (tabla `events`), ordenados por fecha de inicio.
