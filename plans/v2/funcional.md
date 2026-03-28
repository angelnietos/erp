# ERP Marca Blanca / Plataforma Multi-Tenant
## Definición Funcional V2 (Basada en Arquitectura de Plugins)

---

## 1. Visión y Descripción Funcional V2
La plataforma evoluciona de ser un "ERP Monolítico cerrado para Josanz Audiovisuales" a convertirse en una **Plataforma Modular y Multi-Tenant (Marca Blanca)**. Esto significa que el sistema está diseñado para albergar a múltiples clientes o empresas, donde cada funcionalidad actúa como un "Plugin" activable.

Se podrán compilar versiones a medida del CRM para distintos clientes, inyectando estilos visuales (colores corporativos, logos) y reglas de negocio específicas, sin alterar el código base o "Core".

### 1.1 Plataforma Base (App Shells)
El sistema se despliega mediantes "Chasis" o "Shells" vacíos por cliente, a los cuales se les inyectan dinámicamente:
- **Core Compartido:** Autenticación (Identity), Gestión de roles, y UI Kit genérico.
- **Plugins Contratados:** (Ej. Cliente A: Presupuestos + Facturación. Cliente B: Inventario + Flota).

### 1.2 Módulos Funcionales (Plugins)

#### 1.2.1 Identity (Acceso y Gestión de Usuarios Multi-Tenant)
- Acceso a través de login (usuario/contraseña y recuperación por email).
- **Multi-Tenant:** Un usuario puede pertenecer a un "Tenant" (Empresa/Cliente) específico. Su visibilidad de datos quedará estrictamente aislada a su Tenant.
- Rol "SuperAdmin Platform" (Gestiona todos los tenants) vs "Administrador de Tenant".
- Roles dinámicos y granulares por Plugin.

#### 1.2.2 Clients (CRM y Seguimiento)
- Plugin encargado del listado y perfilado de clientes finales de cada Tenant.
- Registro histórico de interacciones y seguimiento de cuenta.

#### 1.2.3 Budget (Gestión de Presupuestos)
- Ciclo de vida del presupuesto comercial.
- Plantillas PDF inyectables (cada Tenant puede tener una plantilla distinta de exportación, definida por configuración).
- Envíos por enlace mágico o adjunto.

#### 1.2.4 Inventory & Rentals (Almacén y Reservas)
- Control dinámico de disponibilidad basado en matriz de tiempo.
- Separación entre "Bienes genéricos" (cables) y "Material Crítico Unitario" (cámaras con N.º de Serie).
- Reservas de alquiler parametrizables.

#### 1.2.5 Delivery (Gestión Logística y Entregas)
- Firma biométrica en dispositivo móvil (Tablet) para validación física.
- Separado del presupuesto para permitir entregas de material parciales.

#### 1.2.6 Fleet (Gestión de Flota)
- Asignación de vehículos a proyectos.
- Registro de salidas/entradas y mantenimientos.

#### 1.2.7 Billing (Facturación y Verifactu)
- Módulo encargado del cumplimiento legal.
- Emisión de facturas y facturas rectificativas.
- Integración opcional del "Adapter de Verifactu", que garantiza la inmutabilidad y reporte automático a la AEAT.

---

## 2. Tecnologías Propuestas V2
Se elimina React.js en favor del ecosistema **Angular (Frontend) + NestJS (Backend) bajo un Monorepo Nx.**
- **Frontend (Angular):** Estructura en base a librerías y componentes Standalone (Lazy Load). Inyección de Dependencias para sobreescribir lógicas UI por Tenant.
- **Backend (NestJS + Prisma):** Arquitectura Hexagonal y de Módulos. Capacidad de reemplazar servicios concretos (ej. `CalculadoraDeImpuestosService`) inyectando variantes específicas de cada cliente.
- **Base de Datos (PostgreSQL):** Esquema unificado usando `tenant_id` (o bases de datos particionadas físicamente, dependiendo del nivel de aislamiento contratado).

---

## 3. Fases de Implantación V2 (Roadmap Multi-Tenant)
1. **Fase 1 (Plataforma Core & Plugins Base):** Desarrollo del ecosistema inicial. Transformación de las ideas funcionales en "Plugins Vanilla" cerrados y probados.
2. **Fase 2 (Inyección de Configuraciones):** Refactor de hardcodes. Todo lo susceptible a cambio (colores, columnas de tablas, lógicas de impuestos) se extrae a Tokens de Inyección.
3. **Fase 3 (Despliegue Tenant 0 - Josanz):** Se ensambla el primer "App Shell" importando todos los plugins para Josanz, inyectando sus estilos operacionales.
4. **Fase 4 (Comercialización SaaS):** Capacidad de desplegar de forma automatizada nuevas `apps/<clienteY>` compilando un subconjunto de librerías para entregar sistemas CRM dedicados a escala.
