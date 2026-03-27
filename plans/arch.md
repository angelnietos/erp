↑ Inicio
⬇ Guardar como PDF
Technical Architecture Blueprint
ERP JOSANZ
Arquitectura de Ingeniería & Hoja de Ruta

Resumen Ejecutivo: Estrategia de Entrega Simplificada
Estructura Core: Monolito Modular con Servicios de Aplicación Síncronos. Evitamos la sobre-ingeniería de eventos en procesos críticos de negocio (crear presupuestos, facturar).
Inventario MVP: Gestión de stock simple y reservas directas. El motor de disponibilidad dinámica se escala a Fase 2.
Offline & Escala: Enfoque en conectividad estable para el MVP. El "Offline-First" completo se desplaza a Fase 3 para no comprometer la entrega.
Integridad Documental: Dominios aislados con un Lifecycle Controller que garantiza la trazabilidad Presupuesto → Albarán → Factura.
Cliente
Josanz Audiovisuales S.L.
Consultoría
Babooni Technologies
Entrega
Marzo 2026
Índice Táctico
0 Alcance del Sistema
1 Validación de Riesgos
2 Estrategia Tecnológica
3 DDD y Hexagonal
4 Modelo de Datos Base
5 Diagramas y DevOps
6 Resiliencia y Observabilidad
7 Principios e Ingeniería
8 Escalabilidad y Proyección
9 Seguridad y Datos
10 Infraestructura Cloud
11 Calidad y Testing
12 Matriz RBAC
13 Evolución Distribuida
14 Anexo: Futuro, escala y backlog técnico
15 Decisiones: Descartes
16 Blindaje de Integridad
0
Alcance del Sistema
El sistema se ha diseñado para cubrir los pilares fundamentales del negocio de Josanz:

Gestión CRM: Integración con Outlook y tracking de histórico por cliente.
Ciclo Documental: Flujo estricto Presupuestos → Albaranes → Facturación.
Control de Activos: Inventario físico, lógico y gestión de alquileres.
Logística: Gestión de flota, personal operativo y entregas.
🏗️ Principios de Arquitectura Josanz

1. Simplicidad primero (KISS)
2. Evolución progresiva
3. Dominio como verdad absoluta
4. Infraestructura desacoplada
5. Preparado para escalar (no sobrediseñado)
   🚚 Logística Inteligente
   Gestión de Stock en Tránsito. Transferencia entre rodajes sin paso obligatorio por sede.

📶 Integridad Offline
Arquitectura Offline-First para operatividad total en estadios o sótanos.

Posibilidad Futura: Timeline de Vida del Equipo
La arquitectura permite evolucionar hacia un seguimiento granular del hardware basado en el histórico de eventos:

Copiar

"Este equipo registra 45 servicios realizados, 2 reparaciones y una rentabilidad acumulada de 12.000€ desde su adquisición."

1
Documento de Validación de Riesgos y Definiciones
Este blueprint técnico es una hoja de ruta de alta fidelidad. Sin embargo, para garantizar el éxito del desarrollo, es imperativo resolver los siguientes puntos críticos en la reunión inicial. Cualquier ambigüedad aquí se traduce en deuda técnica futura.

🔴 1.1 Multi-tenant: ¿Josanz o SaaS?
En el doc aparece “empresa” en usuarios y clientes.

👉 ¿El sistema es A) Una sola empresa (Josanz) o B) Multiempresa (SaaS para terceros)?

Impacto: Cambia DB (tenant_id), esquemas de Auth y aislamiento de datos.
🔴 1.2 Flujo Real de Negocio
Presupuesto → Albarán → Factura. Pero falta definir:

👉 ¿Es obligatorio el flujo completo?
👉 ¿Entregas parciales (varios albaranes por presupuesto)?
👉 ¿Agrupación de albaranes en una sola factura?
Impacto: Modelo de datos y relaciones entre dominios.
🔴 1.3 Máquina de Estados
👉 ¿Estados definidos o libres?

Presupuesto: Borrador, enviado, aceptado, rechazado.
Factura: Pendiente, emitida, pagada, cancelada.
Impacto: Lógica de dominio, validaciones y UI.
🔴 1.4 Inventario REAL vs Simple
👉 ¿El stock es simple (campo unidades) o real (movimientos, histórico, reservas)?

👉 ¿Se bloquea stock al hacer presupuesto o albarán?

Impacto: Define si el sistema es un CRUD o un motor de inventario.
🔴 1.5 Sistema de Alquiler y Disponibilidad
Muy crítico en Josanz Audiovisuales:

👉 ¿Estados: Reservado, Alquilado, Mantenimiento, Disponible?
👉 ¿Control de disponibilidad por fechas y conflictos de calendario?
Impacto: Requiere un motor de reservas complejo.
🟠 2.1 Productos vs Servicios
👉 ¿Son entidades distintas o una sola entidad con tipos?

Impacto: Pricing y lógica de facturación.
🟠 2.2 Lotes de Productos
👉 ¿Un lote es una agrupación lógica o inventario físico indivisible?

Impacto: Trazabilidad y stock.
🟠 2.3 Flota y Conductores
👉 ¿Dominio real: solo info estática o tracking de uso real (viajes, mantenimientos)?

Impacto: Puede derivar en un mini-sistema logístico.
🟠 2.4 Entidad Clientes
👉 ¿Múltiples contactos, direcciones y datos de facturación diferenciados?

Impacto: Si no se define, genera deuda técnica inmediata.
🟢 3.1 Histórico de Emails (Estrategia MVP)
👉 MVP: Servicio SMTP/SendGrid + Tabla de Logs en DB para trazabilidad inmediata.

👉 Fase 2: Evaluación de Microsoft Graph SOLO si se requiere sincronización real bidireccional.

Sin Microsoft Graph Acelera el MVP y reduce dependencia de Azure AD.
🔴 3.2 Verifactu (Legal)
👉 ¿Solo envío de factura o cumplimiento completo (firma digital, hash encadenado)?

Impacto: Trazabilidad inmutable requerida por ley.
🟠 4.1 Plantillas PDF
👉 ¿Fijas en código o configurables (Drag & Drop) por el usuario? ¿Multi-idioma?

🟠 4.2 Versionado de Documentos
👉 Si se modifica un presupuesto ya enviado: ¿Se versiona (V2) o se sobrescribe?

Impacto: Crítico para auditoría.
🔴 5.1 Roles y Permisos (RBAC)
👉 El doc cita admin/user, pero ¿se requiere permiso granular por acción o módulo?

🟠 5.2 Auditoría Avanzada
👉 ¿Registro total de "quién cambió qué"? Prácticamente obligatorio en ERPs.

🟠 6.1 Volumen de Exportación (Excel)
👉 ¿Cargas de 100 registros o 100k? Define la estrategia de streaming en backend.

🟡 7.1 Escala de Usuarios
👉 ¿10 usuarios simultáneos o 200+? Afecta estrategia de caching y queries.

🧨 8. Desafíos de Arquitectura Monorepo
8.1 Límites de Dominio: Separación estricta (Budget vs Invoice). Si se mezclan, el monolito se rompe.
8.2 Comunicación: ¿Llamadas directas o eventos asíncronos? (Decidido: Mediante Bus interno).
8.3 Shared Libs: Riesgo de convertir la carpeta "shared" en un basurero. Control estricto de Nx Tags.
📋 Decisiones Arquitectónicas para el MVP
Para mitigar riesgos críticos, se establecen las siguientes definiciones base para la Fase 1:

Tenencia: Modelo Single-tenant (Josanz únicamente). Se mantiene el campo company_id en el esquema para permitir evolución a Multi-tenant en el futuro, pero el aislamiento lógico no será el foco inicial.
Flujo Documental: Relación 1:N Budget-Delivery (entregas parciales permitidas) y N:1 Delivery-Invoice (agrupación de albaranes en factura). Versionado obligatorio de documentos para auditoría.
Disponibilidad: Motor de reservas basado en tiempo (Time-based Availability). El stock disponible se calcula dinámicamente según el rango de fechas solicitado.
2
Estrategia de Monorepo (Nx) y Angular
🚀 Evolución Tecnológica: De React a Angular
Aunque el preliminar funcional mencionaba React, hemos pivotado a Angular (Enterprise Edition) por su superioridad en entornos ERP:

Robustez: Angular es un framework completo, garantizando que el código sea mantenible a 10 años sin depender de librerías externas volátiles.
Ecosistema Mobile (PWA & Capacitor): Angular permite desplegar como PWA nativa hoy, y evolucionar fácilmente a **Apps Nativas en App Store/Google Play** usando **Ionic/Capacitor** mañana, reutilizando el 90% del código.
💎 Ventajas de Nx Monorepo
Single Source of Truth: Interfaces compartidas entre Front y Back. Cero discrepancias.
Filtro de Despliegue (Affected): Solo compilamos lo que cambia, ahorrando costes de infra.
Arquitectura Blindada: Reglas ESLint que impiden el código espagueti entre dominios.
Workspace NX (Monorepo)
Angular Web UI
Apps
NestJS REST API
Librerías Compartidas
data-access
ui-kit
shared-models
ADR-001 — Arquitectura Modular (Monolito)
Decisión: Adopción de un Monolito Modular basado en Arquitectura Hexagonal.

Contexto: Evitamos la complejidad operativa de los microservicios (red, latencia, consistencia distribuida) manteniendo una separación lógica estricta que permite extraer módulos en el futuro si fuera necesario.

Beneficios: Despliegue único, transacciones atómicas de base de datos y facilidad de testing.

ADR-002 — Frontend (Angular Nx)
Decisión: Uso de Angular con Nx y arquitectura de librerías estricta.

Shared Models / API Interfaces
Data Access: Servicos HTTP y Store
UI: Componentes Presentacionales puros
Feature: Lógica de Negocio y Páginas
Apps: Host
model-budget
model-invoice
model-shared
data-access-budget
data-access-invoice
ui-buttons
ui-forms
ui-tables
feature-budget
feature-invoice
josanz-erp / App Shell
📐 Reglas de Dependencia Nx (Linter Boundary Rules)
Para evitar el "acoplamiento circular" y garantizar la modularidad:

Budget: Usa Inventory y Clients.
Invoice: Usa Budget.
Inventory: No depende de Budget.
Shared: Tipos y utils puras.
🧠 Gestión de Estado: NgRx Signal Store (greenfield)
Estándar recomendado (proyecto desde cero): NgRx Signal Store como store principal por dominio. Usa señales nativas para reducir boilerplate manteniendo patrones claros (selectors, updaters y effects).

Estructura de stores (feature first): un store por feature/dominio (p.ej. budget, invoice, inventory) con helpers tipo entidad; app store mínimo para cross‑cutting (auth/session, layout, router).
Facades por dominio: la UI solo habla con facades; facilitan testing y cambios internos sin romper contratos.
Effects/side‑effects: efectos aislados por dominio, idempotencia y reintentos con backoff en llamadas críticas.
Selección: selectores/computeds por feature y composición en feature shells para vistas complejas.
Umbral para introducir NgRx clásico: solo si se requiere time‑travel devtools estricto, trazabilidad legal de acciones a nivel de UI o orquestaciones transversales muy complejas entre dominios. De inicio, Signal Store puro.
Estrategia de estado
State Facade
NgRx Store (Redux)
Angular Signals
Effects + Facades
Facades por dominio
Angular UI
ADR-003 — Backend (Hexagonal Agnostic)
Decisión: Uso de NestJS con separación estricta mediante Puertos y Adaptadores.

Razón: Garantizamos la persistencia políglota (posibilidad de usar múltiples DBs como PostgreSQL y MongoDB simultáneamente) y el desacoplamiento total de NestJS. El núcleo de negocio es TS puro, facilitando migraciones tecnológicas futuras sin riesgo.

ADR-004 — Persistencia & DB
Decisión: Uso de PostgreSQL + Prisma ORM. Excelente flexibilidad sin perder la inmutabilidad y tipado fuerte.

ADR-005 — Comunicación entre módulos
Decisión: Inicial: llamadas directas (application services) y eventos de dominio en proceso. Colas externas (broker) solo si el volumen lo justifica — ver §14 Backlog técnico.

ADR-006 a 009 — Core Operativo & Estados
Transiciones de Estado (MVP): Reglas de dominio y enums/guards. Máquinas de estado explícitas (p. ej. librería tipo XState) solo donde aporte claridad legal u operativa — §14.
Auth: JWT + Refresh Tokens + Roles RBAC (Matriz definida en Sección 13).
Generación Files: PDF vía backend (Puppeteer) y facturación legal certificada.
External APIs: Uso de Adapters para Verifactu y Email. El MVP evita Microsoft Graph para no bloquear el desarrollo con OAuth complejo, usando un log interno de trazabilidad de envíos.
ADR-010 — Estructura de Servicios y Consultas
Decisión: Uso de Servicios de Aplicación Síncronos con Capa de Consulta Optimizada.

Flujos Síncronos: Las operaciones críticas (Crear Presupuesto, Generar Factura) son síncronas y transaccionales para garantizar consistencia inmediata.
Query Layer: Implementación de servicios de lectura optimizados para listados y filtros complejos, evitando la sobre-ingeniería de buses de comandos o CQRS real en el MVP.
ADR-011 — Framework Frontend: Angular vs React
Decisión: Elección de Angular como motor principal de UI.

🦁 ¿Por qué Angular y no React para el ERP de Josanz?
Estándar Corporativo (Opinionated): A diferencia de React (que requiere elegir 20 librerías externas), Angular incluye Routing, Formularios y HTTP nativos. Menos mantenimiento, más estabilidad.
Estrategia Offline-First (PWA): Implementación de Service Workers agresiva para técnicos en estadios o sótanos sin cobertura. Permite marcar material como roto o entregado offline; la PWA sincroniza los cambios al detectar señal automáticamente.
ADR-012 — Storybook y Mocking Database
Decisión: Uso de Storybook como centro de gravedad del diseño y Mocking Servers para desarrollo desacoplado.

Colaboración con Diseño: Storybook permite que los diseñadores validen estados complejos (ej: qué pasa si un formulario falla o si un listado está vacío) sin tener que esperar a que el backend esté pronto.
Catálogo Vivo (Design System): Ofrece un panorama visual completo, un "inventario de legos" que evita duplicidades y garantiza que la marca sea coherente en todo el ERP.
Testeo en Historias: Cada historia es un caso de prueba aislado de interacción y accesibilidad, asegurando que los componentes sean robustos antes de integrarse.
Mock Servers (MSW): Desacoplamiento total; el front consume datos espejo y simula errores de API para testear la UI en condiciones extremas.
Ciclo de Diseño/Desarrollo
Validation
Interaction Testing
Storybook / Isolated Dev
Diseño Figma
App Integration
Unit/Visual Tests
ADR-013 — Estilos y Componentes UI (Tailwind Policy)
Decisión: Adopción de Tailwind CSS y política de "Zero CSS" en niveles superiores.

Prohibido CSS en Features/Layouts: Las librerías de feature-\* y tipos de layouts no contienen archivos .css. Se maquetan exclusivamente usando clases de utilidad de Tailwind o componentes de la librería UI.
Librería de Componentes Obligatoria: Cualquier elemento visual (botón, tarjeta, tabla, modal) DEBE ser importado de la librería ui-kit o shared. No se permite crear UI ad-hoc en las features.
ADR-014 — Comunicación por Eventos (Efectos Secundarios)
Decisión: Uso de eventos ÚNICAMENTE para procesos no bloqueantes.

Filosofía "Core-Strict": El sistema debe ser 100% funcional sin el Event Bus. Los eventos son mejoras (emails, notifs), no lógica de negocio.
Outbox Decoupling: El Dominio emite eventos (pullEvents()), pero es la Infraestructura quien los persiste en el outbox dentro de la transacción original, manteniendo el dominio puro.

1. Commit Transacción + Outbox
2. Pull Events
3. Async
   Servicio Core
   PostgreSQL
   Event Bus (Non-Critical)
   Email/Logs/Notif
   ADR-015 — Máquinas de Estado (Uso Selectivo)
   Decisión: MVP con enums y validadores de negocio. Autómatas formales solo si el dominio lo exige (p. ej. Verifactu, conflictos de alquiler) — detalle en §14.

Prioridad máquina explícita: Billing / Verifactu y Inventory/Rentals si el calendario de reservas lo complica.
Resto: Enums + guards para mantener el código legible (presupuestos, CRM, etc.).
ADR-016 — Estrategia de Mensajería e Histórico
Decisión: Implementación de patrón Portal/Adapter para el servicio de correo.

Interface EmailService: Define el contrato send(email). El Dominio no sabe cómo se envía el mail.
MVP Implementation: SmtpEmailAdapter. Rápido, fiable y sin dependencias de terceros complejas.
Persistencia: Cada envío genera un registro en email_logs vinculado al cliente/presupuesto, cubriendo el requerimiento funcional de "histórico" sin salir de la DB propia.
Futuro (Graph): Si se requiere ver mails recibidos fuera del ERP, se creará el MsGraphEmailAdapter sin tocar una sola línea de lógica de negocio.
3
DDD y Arquitectura Hexagonal
El corazón de Josanz Audiovisuales se organiza en capas concéntricas para proteger la lógica de negocio de los cambios externos.

🏗️ Capa de aplicación: casos de uso y coordinación
Cada caso de uso modifica preferentemente un agregado. Si un flujo toca varios (p. ej. aprobar presupuesto y reservar stock), se coordina con transacción única cuando sea viable y outbox para efectos asíncronos — sin saga distribuida en el MVP.

Copiar

ApproveBudget_Flow {
// Pseudocódigo: misma transacción DB + outbox
budget.approve()
inventory.reserve(budget.items)
delivery.createDraft(budget.info)
outbox.save(budget.pullEvents())
}
Orquestadores tipo saga distribuida o process managers complejos → §14 si el sistema se parte en servicios.

🔌 Puertos y Adaptadores
Interfaces puras (Puertos) y sus implementaciones técnicas (Adaptadores: PostgreSQL, Outlook API). Permite cambiar la infraestructura sin tocar el negocio.

🚀 Agnosticismo Tecnológico y Futuro
Nuestra arquitectura está diseñada para ser Framework-Agnostic. Aunque usamos NestJS por su potencia, las reglas de Josanz no están "casadas" con él. Esto permite:

Persistencia Políglota: Usar PostgreSQL para facturas y MongoDB o Redis para el tracking de flota en tiempo real.
Intercambio de Motores: Cambiar de motor de base de datos o de framework de servidor en el futuro con un riesgo mínimo.
Testabilidad Total: Mockear la base de datos es trivial porque el dominio solo conoce interfaces, no implementaciones de SQL.
Adaptadores
Núcleo de Negocio
Capa de Entrada
PostgreSQL
Azure Storage
External APIs
Use Cases
Entities / Aggregates
PORTS / Interfaces
API Controllers
WebSockets/Sockets
Cada dominio opera de manera independiente en la capa de negocio.

1. Identity / Auth
   Responsabilidad: Users, Roles, Permissions, Auth JWT.

2. Clients
   Responsabilidad: Gestión de clientes, contactos alternativos, y tracking de histórico (correos Outlook).

3. Catalog
   Responsabilidad: Productos, servicios, tarifas base. (Estático, no es stock físico).

4. Inventory & Stock Control
   Estrategia Híbrida:
   Activos Críticos: Seguimiento por unidad (ID único) para trazabilidad de reparaciones y rentabilidad.
   Material Genérico: Control por cantidades (cables, soportes) para simplificación operativa.
   Manejo de Errores de Dominio: Implementación de excepciones controladas (InsufficientStockError, InvalidStateTransitionError).
   Stock en Tránsito/Lógico: Transferencia entre vehículos y almacenes provisionales sin paso por sede central.
5. Rentals & Time-based Reservations
   Motor de Disponibilidad: Stock_Disponible = Total - Reservas_Activas(Rango_Fechas).
   Gestión de Conflictos: Bloqueo dinámico de inventario para evitar Overbooking y colisiones en rodajes.
   Entidades: Soporte para rental_items (múltiples equipos por alquiler) y estados de ciclo de vida (Borrador, Confirmado, En Rodaje, Retornado, Mantenimiento).
6. Budget & Commercial CRM
   Responsabilidad: Creación de presupuestos comerciales, líneas y flujos de estados.

Estructura Core: Gestión de versiones de presupuesto, descuentos por volumen y tracking de estados comerciales (Enviado, Aceptado, Rechazado). 7. Delivery (POD - Proof of Delivery)
Responsabilidad: Traspaso del material del mundo comercial al físico y confirmación de recepción.

Firma Biométrica: Módulo de firma digital en tablet/móvil incrustada en el PDF y subida a Azure/AWS Blob Storage automáticamente como prueba legal de entrega. 8. Billing (Verifactu & Financial Integrity)
Trazabilidad AEAT: Campos verifactu_status (pending, sent, error) y previous_hash para el encadenamiento inmutable.
Integridad Legal: Sistema de reintentos automático para envíos fallidos a la AEAT y log de comunicación inmutable.
Idempotencia: Uso de idempotency_key para evitar duplicidad de cargos y facturas en reintentos.
Adapter Verifactu: Cobertura 2026
Modos soportados: VERIFACTU y NO VERIFACTU conmutables por configuración/env.
Chequeo de encadenamiento previo: antes de generar cada registro, el adapter valida automáticamente el encadenamiento (previous_hash → current_hash) y el orden/continuidad conforme a la OM HAC/1177/2024.
Elementos obligatorios en factura: generación de QR y leyenda legal “Factura verificable en la sede electrónica de la AEAT”.
Regímenes especiales: manejo de anulación y rectificativas (ROF) con sus reglas de referencia y encadenamiento.
Agnosticismo de Dominio: El dominio Billing no conoce la existencia de Verifactu. Solo emite una factura legal y el Adapter Verifactu (via Outbox/Event) se encarga del cumplimiento externo, manteniendo el núcleo de negocio puro.
Resiliencia: Uso de Outbox + reintentos exponenciales para asegurar que ningún registro legal se pierda por fallos de red con la AEAT. 8. Document Lifecycle (Validation Guard)
Controlador de flujo transversal para la integridad de procesos.

Pureza de Flujo: NO contiene lógica de ejecución. Solo valida reglas de estado (ej: if (!delivery.isSigned()) throw CannotInvoiceError).
Ownership: Centraliza el "quién manda" en el flujo documental sin convertirse en un God Service. 9. Reporting & Export Service
Dominio técnico encargado de la salida de datos de alto rendimiento.

Formatos: Motores dedicados para Excel (XLSX) y PDF (Puppeteer) optimizados para grandes volúmenes de líneas de presupuesto.
Async Jobs: Capacidad de generar informes pesados en background para no bloquear la UI. 10. Fleet & Mobile Outlook (Phased)
Responsabilidad: Gestión de vehículos y trazas de comunicación.

MVP (Lvl 1): Registro estático de uso de flota y log de correos enviados.
Fase 2 (Lvl 2): Sincronización real bidireccional vía Microsoft Graph API y seguimiento GPS.
🔍 Optimized Query Layer (Hard Read-Only)
Capa dedicada a la resolución de listados y dashboards.

Regla Estricta: La Capa de Consulta NUNCA utiliza entidades de dominio. Solo opera con DTOs planos y SQL directo/vistas.
Performance: Máxima velocidad de respuesta al evitar la hidratación innecesaria de objetos complejos del dominio en el frontend.
🌟 Capacidad Evolutiva: Trazabilidad del Activo
Gracias a la arquitectura basada en inventory_movements y audit_logs, el sistema podrá reconstruir la historia clínica de cada unidad física (focos, cámaras, furgonetas):

"Uso acumulado, histórico de reparaciones y rentabilidad generada."

🔥 Relaciones Clave del Flujo (Top-Down)
Copiar

FLOW 1: DOCUMENTACIÓN FINANCIERA
[Client] ---> [Budget] ---> [DeliveryNote] ---> [Invoice (Verifactu)]

FLOW 2: TRAZABILIDAD MATERIAL
[Product Catalog] ---> [Inventory (Physical Stock)] ---> [Rental Scheduler]

FLOW 3: LOGÍSTICA

⚡ Reglas de Oro: Integridad del Dominio
Para mitigar la volatilidad y complejidad del sector audiovisual, aplicamos reglas fundamentales de estabilidad operativa:

Límites Transaccionales: Un Use Case solo puede modificar un agregado principal. Coordinación multi-agregado: transacción única u outbox; orquestación distribuida avanzada → §14.
Frontera Rentals vs Inventory: Inventory es el único dueño de la disponibilidad. El dominio Rentals solicita reservas pero no altera el stock directamente.
Capa Anti-Corrupción (ACL): Las integraciones externas (Outlook, Verifactu) se aíslan mediante Adapters y DTOs, protegiendo el lenguaje ubicuo del negocio.
Semántica de Eventos: El sistema es 100% funcional sin el Bus de Eventos. Estos son opcionales y asíncronos para efectos secundarios (emails, logs).
Consultas complejas (post-MVP)
Si los listados REST quedan cortos, se puede añadir un adaptador GraphQL de solo lectura o subscriptions para tiempo real — criterios y alcance en §14.

4
Modelo de Base de Datos Base (Prisma Schema Ready)
Las decisiones importantes implícitas aquí: (1) Separar Product vs Inventory vs Rental para no romper el sistema lógico de almacén. (2) Separar la línea temporal de negocio: Budget vs Delivery vs Invoice.

Diagrama de Entidad Relación Pura Definitiva
USERS
ROLE
CLIENTS
BUDGETS
BUDGET_ITEMS
DELIVERY_NOTES
INVOICES
PRODUCTS
INVENTORY
RENTALS
VEHICLES
DRIVERS
AUDIT_LOGS
Assigns
Requires
Contains
Triggers
Settles
Priced_In
Extends_To
Used_In
Logged
Tracks_Action
Copiar

=========================================
// CORE ENTITIES [Prisma Typescript Base]
=========================================

[CLIENTS Module]
table clients { id, name, description, sector, company_id, created_at, deleted_at }

[INVENTORY & RENTALS]
table inventory { id, product_id, total_stock, status, version }
table inventory_reservations { id, product_id, quantity, start_date, end_date, reference_type ENUM('budget','rental','delivery'), reference_id UUID, status }
table inventory_movements { id, product_id, type ENUM('IN','OUT','RESERVE','RELEASE'), quantity, reference_id, created_at }
// Índices y Consultas de rendimiento (Avanzado)
INDEX idx_inventory_reservations_lookup (product_id, start_date, end_date)
QUERY overlap_check:
WHERE product_id = :pId
AND NOT (end_date <= :range_start OR start_date >= :range_end)
// Segmentación temporal recomendada si el volumen escala >10k reservas/mes.
table rentals { id, client_id, status, created_at, deleted_at }
table rental_items { id, rental_id, product_id, quantity, unit_id (optional) }

[DOCUMENTS Modules]
table budgets { id, client_id, total, status, version, idempotency_key, created_at }
table delivery_notes { id, budget_id, signature_blob_url, status, created_at }
table invoices { id, budget_id, total, verifactu_status, current_hash, previous_hash, created_at }
table verifactu_logs { id, invoice_id, request_payload JSONB, response_payload JSONB, status, error_message, created_at }

[RELIABILITY / ASYNC]
table outbox_events {
id UUID PK,
aggregate_type VARCHAR,
aggregate_id UUID,
event_type VARCHAR,
payload JSONB,
status VARCHAR, -- pending, processed, failed
retries INT,
created_at TIMESTAMP,
processed_at TIMESTAMP
}
table idempotency_keys { key VARCHAR, scope VARCHAR, response JSONB, created_at TIMESTAMP }

[FLEET & AUDIT]
table vehicles { id, plate, status }
table audit_logs { id, user_id, action, target_entity, correlation_id, changes_json, created_at }
=========================================
// INTEGRIDAD Y TRANSACCIONES
=========================================
Garantizamos la consistencia mediante "Database Transactions" en el Application Layer:

- Si la reserva de stock falla, el presupuesto no se marca como aceptado.
- Si el registro en Verifactu falla, la factura queda en estado "Pendiente de Sincronización".
- Anti-overbooking en concurrencia: lock pesimista + optimistic locking.
  SELECT \* FROM inventory
  WHERE product_id = :productId
  FOR UPDATE;
  =========================================
  table audit_logs { id, entity_name, action, user_id, timestamp, correlation_id, old_data, new_data }
  table attachments { id, entity_type (budget/invoice), entity_id, file_url, added_at }

Core Producción-Ready (Dominios + Outbox + Verifactu)
Angular App
NestJS API
Budget Domain
Inventory Domain
Delivery Domain
Invoice Domain
PostgreSQL
Outbox Events
Event Worker
Audit Logs
Verifactu Adapter
5
Diagramas Tácticos Operativos y DevOps
5.1 Integración y Calidad (CI/CD) Automática
Deploy al Cloud
CI y Calidad Strict
Commit / Pull Request
Fallo
Exito
Container Registry Hub
Docker Build Process
VPS Linux Server Webhook
Recarga de NGINX SSL Seguro
Check ESLint Boundary Rules Nx
Pipeline Git Automático
Unit Tests Automáticos
SonarQube Quality Gate
Equipo de Frontend y Backend
Gitlab / Github Repositorio
Rechaza Request
Producción y API Josanz
5.2 Cronograma Táctico Progresivo (MVP-First)
2026-04-01
2026-05-01
2026-06-01
2026-07-01
2026-08-01
2026-09-01
"Infra y Schema Lvl 1"
"CRUD Clients y Catalog"
"Budget e Inventario Basico"
"Delivery y Billing Fundamental"
"Outbox Worker y Verifactu Real"
"Async Real time Notifs"
"Adaptador Email Avanzado (OAuth/Graph)"
"Advanced Inventory Engine"
"Full Offline First y Logistica"
"Observabilidad y K8s Scaling"
Horizonte 1 MVP
Horizonte 2 Madurez
Horizonte 3 Escala
6
Resiliencia y Observabilidad
El sistema está diseñado para ser monitoreado proactivamente bajo una estrategia de "Caja de Cristal".

🛠️ Bulkhead Pattern
Aislamos los recursos del servidor para cada módulo crítico. Si el generador de PDFs se satura, no afectará a la gestión de presupuestos, evitando el colapso total del sistema.

📡 Outbox Pattern (Backend)
Los eventos se almacenan transaccionalmente en la misma operación DB. El worker garantiza entrega At-Least-Once con reintentos exponenciales e idempotencia en el receptor.

🛡️ Control de Concurrencia
Uso de Optimistic Locking (campo version) para evitar que dos usuarios sobrescriban la misma reserva o presupuesto simultáneamente.

♻️ Auditoría y Recuperación
Implementación de Soft Delete (campo deleted_at) en entidades core para mantener el histórico de auditoría y permitir recuperaciones accidentales.

Regla de negocio: Entidades con deleted_at != null no participan en lógica de negocio activa.
Visibilidad: Solo visibles en consultas de auditoría e informes históricos.
Metricas
Logs
Excepciones
Alerta/Análisis
App NestJS
Prometheus
Grafana Loki
Sentry.io
Grafana Dashboard
Indicador de Escala / Cuellos de Botella
Telemetría de Negocio
Grafana no solo mide CPU. Mide latencia por Use Case (ej: cuánto tarda en generarse un presupuesto) permitiendo detectar degradación antes de que el usuario lo reporte.

7
Principios de Ingeniería y Calidad
El desarrollo se rige por estándares de ingeniería de software que garantizan la mantenibilidad y evolución del sistema a largo plazo.

🏗️ Principios SOLID
S: Responsabilidad única por clase/módulo.
O: Abierto para extensión, cerrado para modificación.
L: Sustitución de Liskov en herencias.
I: Segregación de Interfaces (Puertos específicos).
D: Inversión de Dependencias (Hexagonal).
🧹 Clean Code & DRY
DRY (Don't Repeat Yourself): Reutilización masiva vía librerías Nx. Cero duplicidad de lógica.
KISS (Keep It Simple, Stupid): Soluciones legibles y directas frente a la sobre-ingeniería.
Código Limpio: Nombres semánticos, funciones atómicas y documentación viva en el código.
🧪 Test Driven Development (TDD) Mentalitity
Nuestra arquitectura permite testear el 100% de la lógica de negocio sin base de datos ni UI. Los tests son la red de seguridad que permite evolucionar el ERP sin miedo a romper el flujo de presupuestos o facturación.

8
Escalabilidad y Proyección
La arquitectura modular permite que el sistema crezca orgánicamente junto con las necesidades de Josanz Audiovisuales.

🚀 Escalabilidad Horizontal
Backend stateless: El uso de JWT permite levantar múltiples instancias del API en un clúster de Kubernetes o Docker Swarm sin necesidad de replicar sesiones.
Read Replicas: PostgreSQL permite configurar réplicas de lectura si el volumen de informes o analytics crece exponencialmente.
🛠 Cuándo partir el monolito
Extracción de dominios: Los límites en Nx permiten extraer Inventory, Billing, etc. solo cuando haya métricas (carga, equipos, despliegue) que lo justifiquen.
Mensajería externa: RabbitMQ/Kafka u otros brokers entran en escena si el volumen de eventos lo exige — §14.
Frontend a escala
Module Federation o microfrontends son opcionales; valorar solo con varios equipos o ciclos de release desacoplados — §14.

9
Seguridad y Protección de Datos
Protección multicapa para garantizar la confidencialidad de los datos de Josanz Audiovisuales.

🛡️ Defensa Perimetral
Rate Limiting: Throttler automático para evitar ataques de fuerza bruta o scraping.
CORS Strict: El API solo responde a dominios autorizados de Josanz.
HTTP Headers: Implementación de Helmet.js para blindaje contra XSS y Clickjacking.
Validation & Sanitization
Class Validator: DTOs estricto. Ninguna data entra al backend sin validar tipos y rangos.
Sanitización XSS: Limpieza automática de cualquier entrada de texto para evitar inyecciones de script.
Prisma Safety: Prevención nativa de SQL Injection mediante consultas parametrizadas.
📜 Cumplimiento RGPD e Integridad
Cifrado de datos sensibles en reposo y en tránsito (TLS 1.3). Sistema de permisos granulares (ACL) para asegurar que cada empleado vea solo lo necesario para su función.

10
Infraestructura y Despliegue (Azure / AWS)
Propuesta de despliegue elástico, seguro y escalable bajo una estrategia de Infraestructura como Código (IaC).

☁️ Opción A: Microsoft Azure (Recomendado)
Compute: Azure Container Apps (Serverless K8s).
Database: Azure Database for PostgreSQL (Flexible Server).
Files: Azure Blob Storage + CDN.
☁️ Opción B: Amazon Web Services (Alternativa)
Compute: AWS ECS / Fargate.
Database: Amazon RDS PostgreSQL.
Files: Amazon S3 + CloudFront.
Internal Network
HTTPS
Load Balance
Read/Write
Cache
Storage
PosgreSQL Managed
Container Service
Redis Cache
Object Storage
User
CDN / WAF
11
Estrategia de Aseguramiento de Calidad
No confiamos en la suerte. Aplicamos un ecosistema DevSecOps para garantizar estabilidad y seguridad total.

🛡️ Snyk: Seguridad en Dependencias
Escaneo automático de todas las librerías de terceros (npm). Detectamos vulnerabilidades de seguridad en el "Supply Chain" antes de que el código sea compilado, bloqueando paquetes maliciosos o desactualizados.

🛡️ SonarCloud: Calidad y Deuda
Análisis estático de código en cada Pull Request. Controlamos de forma automática:

Code Smells: Código difícil de mantener.
Complexity: Evita funciones excesivamente largas y propensas a errores.
Security Hotspots: Detecta patrones de código inseguros.
🧪 Pirámide de Testing
Unit: Jest/Vitest (Lógica de dominio pura).
E2E: Playwright/Cypress (Flujos reales de negocio).
Estrés: k6 (Simulación de carga masiva en concurrencia).
✅ Quality Gates
Ningún cambio entra a producción si no cumple con los Quality Gates: Cobertura mínima del 80%, 0 vulnerabilidades críticas en Snyk y nivel "A" en seguridad de Sonar.

Conclusión Técnica
Este blueprint define un sistema robusto, escalable y alineado con los requisitos legales y operativos de Josanz Audiovisuales.

12
Matriz de Roles y Permisos (RBAC)
Definición de accesos granulares para garantizar la seguridad de la información según el perfil del empleado.

Entidad / Dominio SuperAdmin Comercial Logística Técnico
Presupuestos budget.approve budget.create budget.read NO
Facturación / Verifactu invoice.emit invoice.read NO NO
Inventario (E/S) stock.manage stock.read stock.move stock.read
Flota de Vehículos fleet.full NO fleet.assign fleet.read
🔐 Jerarquía de Seguridad (RBAC Advanced)
El sistema no utiliza roles planos, sino una jerarquía de Permisos Atómicos agregados en Roles:

Permiso: Atómico (ej: budget.approve, stock.view).
Rol: Conjunto de permisos (ej: Comercial = [budget.*, client.view]).
Auditoría: Registro total de (Quién, Acción, Cuándo) mediante audit_logs y el patrón Outbox.
13
Evolución a Arquitectura Distribuida
No es alcance del MVP. Referencia de costuras y patrones si el monolito deja de bastar; priorizar siempre métricas y dolor real de negocio antes que esta hoja de ruta.

🔄 Comunicación con Message Brokers
Evolución: Migración de NestJS EventEmitter a Kafka / RabbitMQ para comunicación asíncrona robusta.
Event Sourcing: Transición de logs de auditoría a eventos como fuente única de verdad.
📊 Grafana como Brújula de Escala
La extracción a microservicios NO es por moda, es por datos. Usamos dashboards en Grafana para:

Identificar cuellos de botella: ¿Qué módulo satura la base de datos o el CPU?
Predecir carga: Analizar tendencias para escalar horizontalmente antes del pico de reservas.
Justificar la extracción: Solo sacamos un módulo (ej. Inventory) si Grafana demuestra que su carga compromete el resto del sistema.
⚡ gRPC & Inter-service Sync
Low-Latency Protobuf: Uso de gRPC para llamadas síncronas entre microservicios (ej: Inventario <-> Presupuestos).
🛡️ Consistencia: Patrón Saga
Manejo de flujos distribuidos mediante Sagas orquestadas, asegurando consistencia eventual y acciones de compensación en caso de fallo.

🌐 GraphQL Optativo
Se evaluará su uso únicamente si el frontend presenta problemas de "Over-fetching" reales o la complejidad de las consultas del Dashboard lo requiere.

🔍 Tracing Distribuido (Tempo / Jaeger)
Implementación de trazas para seguir una petición (Request ID) a través de múltiples microservicios.

📦 Orquestación & Service Mesh
Uso de Kubernetes junto a Istio / Linkerd para gestionar la seguridad (mTLS) y el tráfico.

🎯 Indicadores Clave para la Extacción (Split Triggers)
Carga de DB: Cuando un dominio saturación el pool de conexiones.
Velocidad de Despliegue: Cuando el monolito penaliza la agilidad del negocio.
14
Anexo: Futuro, escala y backlog técnico
Visión de producto (2027+) e ideas técnicas válidas pero no prioritarias para el MVP. Revisar solo con necesidad demostrada.

🧭 Backlog técnico (post-MVP / a valorar con métricas)
Estado (UI o dominio): Máquinas de estado explícitas (p. ej. XState) donde enums y reglas puras no basten.
Mensajería: Kafka, RabbitMQ u otro broker si el volumen de eventos supera el bus en proceso.
API de lectura: GraphQL, federación o subscriptions para dashboards o tiempo real.
Frontend: Module Federation / microfrontends para equipos o releases desacoplados.
Distribuido: Sagas distribuidas, gRPC entre servicios, service mesh (Istio/Linkerd), event sourcing pleno.
Observabilidad avanzada: Dashboards en Grafana para telemetría en tiempo real, identificando cuellos de botella y tracing distribuido (Tempo/Jaeger).
🧠 IA y heurística de negocio
IA de preventa: Sugerencia de accesorios según histórico de kits.
Optimización de rutas: Flota y logística (p. ej. Dijkstra / OR-Tools cuando haya datos).
📱 Producto y UX avanzados
PWA / campo: Notificaciones push y flujos móviles reforzados.
Timeline de vida del activo: Narrativa de uso, reparaciones y rentabilidad por unidad física.
Infraestructura y negocio
Extracción de dominios a servicios separados y colas externas entran en juego cuando el monolito modular deje de cumplir SLAs o el equipo lo exija. Grafana será el juez: solo escalaremos cuando las métricas identifiquen cuellos de botella específicos que justifiquen la complejidad adicional.

15
Decisiones de Arquitectura: Descartes
Demostración de criterio técnico basado en evitar la sobre-ingeniería.

❌ Microservicios (Inicio)
Descartado por la complejidad innecesaria en infraestructura y latencia de red. El Monolito Modular ofrece la misma separación de lógica con menor coste operativo.

❌ gRPC e Inter-comm síncrona
Descartado por ser innecesario dentro de un mismo proceso de ejecución. No aporta valor mientras los módulos compartan el mismo espacio de memoria.

❌ Event Sourcing Total
Descartado por el elevado sobrecoste de implementación y almacenamiento. Se ha optado por un sistema híbrido que ofrece trazabilidad sin duplicar la infraestructura.

❌ React / Frameworks Fragmentados
Descartado a favor de Angular para garantizar un marco estricto, evitando el "infierno de librerías" en un proyecto ERP Enterprise.

16
Blindaje de Ingeniería: Matriz de Integridad
Directrices de arquitectura avanzada para el éxito del sistema.

🧬 Regla de Consistencia Atómica
Mutaciones Críticas: Operaciones ligadas (Budget, Inventory, Invoice) ocurren en la misma transacción DB para evitar estados inconsistentes (Ghost entities).
Publicación Outbox: Los eventos de dominio NO se publican directamente. Se persisten transaccionalmente para ser despachados por un worker con reintentos exponenciales e idempotencia.
🧾 Facturación Basada en Realidad (POD)
Origen: Las Invoices se generan partiendo de Delivery Notes (Albaranes), no del presupuesto directamente.
Lógica: El presupuesto es una intención; la factura refleja la realidad física entregada y certificada por el cliente mediante firma biométrica.
🛠️ Incidencias en Alquiler Activo
Material Roto en Uso: Si se reporta rotura durante un rodaje, se mantiene la reserva actual para integridad contractual, pero se reduce el stock disponible para futuras reservas instantáneamente.
Evento de Incidente: Disparo automático de un flujo de auditoría y reemplazo logístico basado en el motor de disponibilidad.
📶 Estrategia Offline & Conflictos
Conflictos Críticos: Para Inventory y Rentals, el servidor valida obligatoriamente la disponibilidad temporal al sincronizar lote offline, rechazando cambios si detecta un conflicto insalvable.
🔐 RBAC Scopes & API Security
Scopes Económicos: Los permisos se limitan granularmente por Empresa, Cliente y Proyecto.
Idempotencia en API: Endpoints críticos requieren obligatoriamente idempotency_key en el header, asegurando que los reintentos no generen duplicados fiscales o de stock.
⚠️ Anti-Corruption Layer (ACL)
Integraciones externas (Outlook, Verifactu) aisladas mediante adapters y DTOs propios, impidiendo que la complejidad externa contamine el dominio central.

🔥 Regla Maestra contra la Complejidad
Principio de Agregado Único: Cada Use Case solo tiene permitido modificar un único agregado principal. La afectación a otros dominios se realiza mediante sincronización de eventos o servicios de aplicación desacoplados.
