# Josanz ERP — Resumen de negocio (CEO, CTO, producto)

Audiencia: dirección, producto, finanzas y operaciones que necesitan entender **qué aporta el sistema** sin detalle de implementación.

## 1. Qué es Josanz ERP

Plataforma integrada para gestionar el ciclo operativo de una empresa de servicios o alquiler de equipamiento: **clientes**, **inventario**, **presupuestos**, **entregas y devoluciones (albaranes)**, **flota**, **alquileres**, **facturación** y **cumplimiento normativo** con la normativa española de facturación electrónica (**Verifactu**).

## 2. Valor para el negocio

- **Un solo lugar** para operación y trazabilidad: menos hojas de cálculo y menos errores entre ventas, logística y administración.
- **Trazabilidad de entregas**: albaranes firmados (texto o imagen) como evidencia frente a clientes e incidencias.
- **Cumplimiento fiscal**: línea de trabajo Verifactu orientada a registrar y consultar el estado de envío de facturas al sistema público, reduciendo riesgo de incumplimiento y facilitando auditorías.
- **Multi-tenant**: mismo producto sirve a varias empresas o marcas con aislamiento lógico de datos (clave para SaaS o grupos empresariales).

## 3. Módulos en lenguaje de negocio

| Módulo | Utilidad |
|--------|----------|
| Clientes | Cartera y datos maestros para presupuestos, alquileres y facturación. |
| Inventario | Disponibilidad de equipos y reservas ligadas a presupuestos u operaciones. |
| Presupuestos | Ofertas comerciales previas a facturar o entregar material. |
| Albaranes | Documento de entrega/devolución; firma del receptor como acuse. |
| Flota / Alquileres | Operaciones de vehículos y alquileres de equipamiento según el despliegue. |
| Facturación | Emisión y seguimiento de facturas, enlazada con Verifactu donde aplique. |
| Verifactu | Visibilidad del estado regulatorio de las facturas y colas de procesamiento. |

## 4. Riesgos y decisiones ya abordadas en producto

- **Firmas digitales**: el sistema admite texto de conformidad o imagen (incluido pegado en formato estándar). Para contratos de alto valor, la empresa puede complementar con firma electrónica cualificada externa.
- **PDF desde el navegador**: útil para comprobantes operativos; documentos con exigencia legal estricta pueden requerir PDF generado y archivado en servidor.
- **Datos de demostración**: los entornos de prueba deben usar firmas o imágenes **válidas** (p. ej. dibujo incrustado) para que dirección y ventas vean el flujo real sin “iconos rotos” que no reflejan el producto final.

## 5. Plugins, muchos negocios y un CRM de plataforma

- El producto se entiende como **caja de herramientas**: cada empresa (o colectivo) contrata **el conjunto de módulos** que necesita; el mismo software sirve a un autónomo, a una filial o a una red de socios.
- **No hace falta un CRM distinto por sector** en el sentido de “otro programa”: la ambición de plataforma es un **CRM común** (cuentas, contactos, oportunidades, actividades) **configurable** y enlazado a presupuestos, entregas y facturación ya existentes.
- Las **novedades funcionales** se despliegan una vez y **llegan a todos los clientes** del SaaS; lo que se “copia” entre organizaciones son **plantillas y configuraciones** (embudos, listas, informes), no ramas de código distintas.
- Detalle de cómo se mapea esto en código (features, shells, guards de plugins) en [tecnico-arquitectura.md](./tecnico-arquitectura.md).

## 6. Mensaje para inversores o comité

Josanz ERP encamina la operación diaria hacia **datos estructurados** y **registros auditables**, alineados con la **digitalización fiscal en España**. La arquitectura modular permite **priorizar módulos por vertical** y **empaquetar ofertas** (p. ej. “operación + fiscalidad + CRM”) sin rehacer el núcleo.

## 7. Próximos pasos de producto (orientativos)

Definir con negocio: política de **archivo de firmas** (solo base de datos vs. almacenamiento de objetos), **retención** de documentos, **nivel de integración Verifactu** por tipo de cliente (PYME vs. gran cuenta), y **hoja de ruta del CRM** (MVP, integración con clientes y facturación, plantillas por sector).
