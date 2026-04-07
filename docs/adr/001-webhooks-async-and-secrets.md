# ADR 001 — Webhooks salientes: cola asíncrona y secretos cifrados

## Estado

Aceptado (implementado en Fase 4).

## Contexto

Los webhooks de integración deben entregarse de forma fiable ante fallos de red o del receptor, y los secretos HMAC no deben almacenarse en claro.

## Decisión

1. **Entrega asíncrona**: los eventos de dominio encolan filas en `integration_webhook_queue`; un worker periódico (`WebhookQueueWorker`) realiza el `POST` HTTP, registra entregas en `integration_webhook_deliveries` y reintenta con política de cola.
2. **Secretos cifrados**: el campo `secret` de `integration_webhooks` se persiste cifrado (AES-256-GCM) en reposo; la clave maestra proviene de `WEBHOOK_ENCRYPTION_KEY` (u opción equivalente en `shared-infrastructure`).
3. **Listados**: `GET /api/integrations/webhooks` no devuelve el secreto en claro; solo se expone el secreto en el alta (`POST`) y en la rotación explícita.

## Consecuencias

- Mayor latencia respecto al envío síncrono inmediato, a cambio de resiliencia.
- Operaciones deben gestionar backup y rotación de la clave de cifrado con el mismo cuidado que otros secretos de producción.
