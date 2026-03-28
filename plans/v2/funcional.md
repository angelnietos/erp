# 🌐 Definición Funcional y Producto V2 (ERP Marca Blanca)

El producto migra de ser un "Software a la medida cerrado" a una **Plataforma Modular B2B**, donde cada empresa contratante asume un `tenant` aislado, operando en subdominios únicos, consumiendo un set de plugins personalizables bajo suscripción.

---

## 1. El Nucleo de la Plataforma (Multi-Tenant Core)

- **Total Data Privacy:** Las bases de datos operan bajo el dogma Zero-Leak. Los datos entre empresas (`tenants`) no comparten el perímetro contextual de memoria. La misma plataforma (compilación binaria) es capaz de servir al "Tenant Josanz Audiovisuales" y al "Tenant Cliente Z", filtrando inteligentemente vía un `x-tenant-id`.
- **Identidad Agnóstica:** Un empleado (User) puede existir en el sistema pero está atado a su `Tenant`. El correo pertenece a un único marco empresarial en la tabla `Users`, permitiendo que el empleado "Pedro" opere independientemente en Josanz y en la empresa de al lado sin cruces de datos (usando Primary Keys Multi-Tenant `[tenantId, email]`).

---

## 2. Abanico de Funcionalidades (Plugins Activables)

### 👥 CRM & Relaciones (Clients Plugin)
- Registro integral de clientes y entidades corporativas (Empresas/Autónomos).
- Relacionamiento primario de los documentos comerciales (Proyectos y Presupuestos).
- Permisos configurables para que agentes de ventas solo vean su cartera de clientes (Row Level ACL, Fase Futura).

### 📄 Proyectos y Cotizaciones (Budget Plugin)
- Máxima rentabilidad y previsión. Modelado rápido de propuestas económicas agregando productos, con cálculo dinámico de impuestos (IVA, etc.).
- Fechas de vigencia de proyecto para nutrir el cruce de dependencias en el "Calendario de Disponibilidad del Almacén".
- Control de Estados (Borrador -> Pendiente -> Firmado -> Rechazado).
- Posibilidad de adjuntar reglas de validación en cadena (Módulo opcional futuro de Aprobación por Managers).

### 📦 Gestión Inteligente de Stock (Inventory & Rentals Plugin)
- **Modo Material Seriado (Unitario):** Seguimiento por N.º de Serie, permitiendo trazabilidad de desgaste físico, revisiones y reparación (Cámaras concretas, Ópticas identificables).
- **Modo Material Genérico:** Seguimiento Cuantitativo (Ej: 100 Metros de Cable XLR, 50 Cinta Gaffer).
- Integración en tiempo real de "Overbooking" alertando si el material a reservar en un presupuesto cruzará límites durante su período.

### 📝 Albaranes Técnicos y Entregas (Delivery Plugin)
- Extracción parcial o total de los equipos dictaminados en el Presupuesto hacia el furgón.
- Funcionalidad Mobile-First en el Frontend para captura in-situ de Firma Biométrica digitalizada al soltar la carga.
- Estado dual: Expedición y Retorno (para material de alquiler / rentals).

### 🚚 Logística de Motores (Fleet Plugin)
- Inventario independiente de vehículos corporativos con control de cubicaje, MMA, y revisiones de ITV.
- Asignación temporal de furgones a proyectos/operarios específicos.

### 🏛 Cumplimiento y Finanzas (Billing Plugin con Verifactu)
- Emisión definitiva de la Factura, inyectando bloqueos matemáticos (No se puede modificar una factura emitida bajo las normativas AEAT/Europa antifraude).
- Emisión de facturas rectificativas y cálculo de contabilidad automatizado.
- Integración transparente con APIs fiscales locales garantizando la inmutabilidad transaccional.

---

## 3. Dinámica Comercial Esperada (El App Shell)
Cuando Josanz Technologies venda un SaaS ERP a un nuevo cliente, se compilará un App Shell.
Si el `Cliente Autónomo X` no utiliza vehículos ni equipos grandes, se le despachará un ERP con los Plugins: `Identity, Clients, Budget, Billing`. Las pantallas de Entregas e Inventarios simplemente desaparecerán, optimizando drásticamente el Payload de Javascript y desactivando rutas HTTP innecesarias. 
*(El máximo exponente de la hiper-eficiencia corporativa).*
