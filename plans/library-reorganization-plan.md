📐 Plan: Reorganización de Librerías Nx (Frontend + Backend)
🎯 Objetivo

Definir una arquitectura modular, escalable y mantenible en Nx, separando claramente:

Frontend vs Backend
Infraestructura vs dominio
UI vs lógica de datos

Con reglas claras de dependencia que eviten acoplamientos incorrectos.

🧱 Estructura Global
libs/
└── <scope>/<feature>/
    ├── domain/        # Modelo de negocio puro (agnóstico)
    ├── backend/       # Implementación backend (NestJS, etc.)
    └── frontend/
        ├── api/           # Infraestructura HTTP
        ├── data-access/   # Estado + lógica de datos
        ├── feature/       # Casos de uso UI
        └── shell/         # Composición + routing
🧠 Principios Arquitectónicos
Separación de responsabilidades (SoC)
Dependency Rule (Clean Architecture)
→ Nada depende de capas más externas
Frontend desacoplado del backend
Dominio reutilizable y agnóstico
🎨 Frontend
📁 api (Infraestructura / IO)
🔌 Responsabilidad

Acceso a datos externos (backend, APIs).

✅ Incluye
Servicios HTTP (HttpClient)
Métodos CRUD
Adaptadores de API
DTOs (request/response)
Mappers básicos (opcional, si son triviales)
❌ NO incluye
Estado
Lógica de negocio
Conocimiento de UI
💡 Ejemplo
getUsers(): Observable<UserDto[]> {
  return this.http.get<UserDto[]>('/api/users');
}
📁 data-access (Orquestación de datos)
🗃️ Responsabilidad

Gestionar estado y coordinar datos entre API y UI.

✅ Incluye
Stores (NgRx, Signals, Akita…)
Facades
Selectors
Transformación DTO → modelo de dominio
Lógica de negocio relacionada con datos
❌ NO incluye
Componentes Angular
Templates
Routing
💡 Ejemplo
loadUsers() {
  this.api.getUsers().subscribe(users => {
    this.usersSignal.set(users);
  });
}
📁 feature (Casos de uso UI)
🧠 Responsabilidad

Implementar lo que el usuario puede hacer/ver.

✅ Incluye
Smart components (containers)
Páginas
Orquestación de flujos
Integración con data-access
❌ NO incluye
Llamadas HTTP directas
Estado global
💡 Ejemplo
@Component({...})
export class UsersPage {
  users$ = this.usersFacade.users$;

  ngOnInit() {
    this.usersFacade.loadUsers();
  }
}
📁 shell (Composición)
🧱 Responsabilidad

Estructura y composición de alto nivel.

✅ Incluye
Routing
Lazy loading
Layouts
Componentes contenedores principales
❌ NO incluye
Lógica de negocio
Acceso a datos
💡 Ejemplo
const routes: Routes = [
  {
    path: '',
    component: UsersShellComponent,
    children: [...]
  }
];
🔄 Flujo de Datos
UI (feature)
   ↓
data-access
   ↓
api
   ↓
backend

Y de vuelta:

backend → api → data-access → feature → UI
🚫 Reglas de Dependencia (CRÍTICO)

✔ feature → puede usar → data-access
✔ data-access → puede usar → api
✔ api → NO depende de nadie

❌ feature NO llama a api
❌ api NO conoce feature
❌ shell NO contiene lógica

👉 Recomendado: enforce con nx.json (tags + constraints)

🧩 Backend
📁 domain (Core de negocio)
🎯 Responsabilidad

Modelo de dominio puro, independiente de frameworks.

✅ Incluye
Entidades
Value Objects
Interfaces (ports)
Reglas de negocio
DTOs de dominio (no HTTP)
❌ NO incluye
NestJS
Decoradores
Infraestructura
📁 backend (Infraestructura backend)
⚙️ Responsabilidad

Implementación técnica del dominio.

✅ Incluye
Controllers
Services
Modules
Repositorios
Integraciones externas
❌ NO incluye
Lógica de negocio compleja (debe vivir en domain)
📦 Módulos
🟦 Fleet
domain/: Vehicle, Driver, reglas
backend/: FleetController, Service
frontend/api/: FleetApiClient
frontend/data-access/: VehicleStore, Facade
frontend/feature/: páginas y containers
frontend/shell/: routing
🟩 Clients
Domain: Client
Backend: ClientsController
Frontend: API + Store + UI
🟨 Billing
Domain: Invoice, InvoiceLine
Backend: BillingService
Frontend: gestión de facturación
🟧 Inventory
Domain: Product, Reservation
Backend: InventoryService
Frontend: stock UI
🟥 Delivery
Domain: DeliveryNote
Backend: DeliveryController
Frontend: gestión de entregas
🟪 Budget
Domain: Budget, BudgetLine
Backend: BudgetService
Frontend: creación de presupuestos
⚫ Rentals
Domain: Rental
Backend: RentalsService
Frontend: alquileres
🚀 Pasos de Implementación
🔁 Por cada módulo
Crear domain/
Mover entidades desde core
Limpiar dependencias Angular/Nest
Crear backend/
Mover controllers/services desde api actual
Crear frontend/
Reorganizar en:
api
data-access
feature
shell
Crear clientes HTTP en frontend/api
Implementar stores/facades en data-access
Separar smart vs dumb components (si aplica)
Actualizar:
project.json
index.ts (exports públicos)
imports internos
Configurar paths:
tsconfig.base.json
(Recomendado) Añadir reglas Nx:
"constraints": [
  {
    "sourceTag": "type:feature",
    "onlyDependOnLibsWithTags": ["type:data-access"]
  }
]
⚠️ Errores Comunes a Evitar
Meter lógica en api
Saltarse data-access
Mezclar DTOs con modelos de dominio
Hacer el domain dependiente de Angular/Nest
Components llamando HTTP directamente
✅ Resultado Esperado
Código desacoplado
Fácil testeo
Escalable por equipos
Reutilización real del dominio
Menos deuda técnica