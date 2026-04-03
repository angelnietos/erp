# Josanz ERP — Escalabilidad y opciones de negocio futuras

Audiencia: CTO, arquitectura, estrategia y socios que evalúan **crecimiento técnico y comercial**.

## 1. Escalado técnico horizontal

- **API Nest (backend)**: instancias stateless detrás de un balanceador; sesiones y tenant en cabeceras/JWT, no en memoria local del nodo.
- **Base de datos**: PostgreSQL con réplicas de lectura si los informes o listados masivos crecen; particionamiento por tenant solo si el volumen por cliente lo exige.
- **Worker Verifactu**: colas (Redis, RabbitMQ, SQS) entre API y worker para picos de facturación de fin de mes; varios consumidores con la misma lógica idempotente.
- **Frontend**: CDN para estáticos; Angular ya permite despliegue independiente del backend.

## 2. Almacenamiento de firmas y adjuntos

Hoy el campo de firma puede contener data URL o URL. A escala:

| Opción | Pros | Contras |
|--------|------|---------|
| Solo DB (texto largo) | Simple, transaccional | Tamaño de backups, límites de fila |
| Object storage (S3, Azure Blob, GCS) + URL firmada | Escalable, barato por GB | Más componentes, políticas de acceso |
| Servicio de firma (Signaturit, DocuSign, etc.) | Valor legal alto | Coste por transacción, integración |

Recomendación típica: **objeto en bucket privado** y en BD solo **clave + hash + metadatos**; el ERP genera URLs temporales para visualización.

## 3. Features, plugins y cartera de producto

- Cada gran capacidad (clientes, albaranes, Verifactu, etc.) puede tratarse como **plugin de producto**: mismo código, activación por **plan**, **tenant** o **rol**.
- **Escalar a muchos negocios** no implica muchas copias del software: implica **configuración** (qué plugins tiene cada uno) y **gobernanza** (datos aislados, informes opcionalmente consolidados para grupos).
- **Colectivos y redes** pueden contratar el mismo paquete base y diferenciarse solo por datos y ajustes (plantillas, pipelines), no por forks.
- Ver detalle técnico en [tecnico-arquitectura.md](./tecnico-arquitectura.md) (§4–§7).

## 4. Multi-tenant y negocio SaaS

- **Modelo por esquema o por fila**: el diseño actual apunta a **filas con `tenantId`** (más simple operativamente).
- **Planes**: límites por número de usuarios, facturas/mes, o almacenamiento de firmas/PDF.
- **White-label**: theming en Angular y dominios por tenant con misma base de código.

## 5. Verifactu y cumplimiento

- Escalado del worker acoplado a **throughput regulatorio** (reintentos, dead letter queue, monitorización de rechazos AEAT).
- Opción B2B: **API pública documentada** para que ERPs de terceros envíen facturas a través de Josanz (nuevo flujo de ingresos).

## 6. Opciones de producto / mercado

- **Verticalización**: paquetes “alquiler AV”, “eventos”, “construcción” con plantillas de presupuesto y informes.
- **Integraciones**: contabilidad (Holded, A3, Sage), pasarelas de pago, firma electrónica.
- **Mobile**: PWA primero; apps nativas si el campo (conductores, técnicos) lo exige offline.

## 7. Observabilidad y operación

- Métricas por tenant (latencia API, errores Verifactu, tamaño de cola).
- Alertas cuando el worker deje de consumir o haya tasas altas de error AEAT.
- Backups cifrados y pruebas de restauración antes de escalar número de clientes.

## 8. Resumen

La base monorepo y la separación **core / adapters / apps** permiten escalar por **servicios** (más instancias API, más workers) y por **almacenamiento externo** (firmas y PDF definitivos) sin reescribir el dominio. **Sumar negocios** es combinar **plugins** y **configuración**; **propagar mejoras** es desplegar una sola línea de producto y usar plantillas o flags para el rollout. Las decisiones de mayor impacto económico son **dónde vive la prueba legal de la firma**, **cómo se empaqueta el CRM u otros verticales**, y **cómo se factura Verifactu y almacenamiento** al cliente final.
