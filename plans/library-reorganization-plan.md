# Plan: Reorganizar libs - Estructura con Responsabilidades

## Objetivo
Reorganizar la estructura de las libs para separar claramente frontend y backend, con responsabilidades claramente definidas para cada parte.

## Estructura Propuesta

### Frontend (mantener estructura actual con responsabilidades claras):

```
frontend/
├── api/           # Comunicación externa - acceso HTTP
├── data-access/   # Estado y lógica de datos - stores, facades
├── feature/       # Casos de uso UI - componentes inteligentes
└── shell/         # Composición y layout - routing, lazy loading
```

### Responsibilities por carpeta:

#### 🔌 api (Comunicación Externa)
- **Responsabilidad**: Comunicación con el backend o servicios externos
- **Incluye**:
  - Servicios HTTP (HttpClient)
  - Métodos CRUD (get, post, put, delete)
  - Adaptadores de API
  - DTOs para responses
- **NO debe tener**: Lógica de negocio compleja, solo acceso a datos remotos
- **Ejemplo**:
```typescript
getUsers(): Observable<UserDto[]> {
  return this.http.get<UserDto[]>('/api/users');
}
```

#### 🗃️ data-access (Manejo de Estado y Datos)
- **Responsabilidad**: Puente entre la API y la UI
- **Incluye**:
  - Stores (NgRx, SignalStore, Akita, etc.)
  - Facades
  - Lógica de negocio relacionada con datos
  - Transformación de DTO → modelos de dominio
  - Selectors
- **SI tiene**: Lógica de datos, pero enfocada a datos no a UI
- **Ejemplo**:
```typescript
loadUsers() {
  this.api.getUsers().subscribe(users => {
    this.usersSignal.set(users);
  });
}
```

#### 🧠 feature (Casos de Uso / UI)
- **Responsabilidad**: Funcionalidad concreta que ve el usuario
- **Incluye**:
  - Componentes "inteligentes" (smart components)
  - Páginas
  - Orquestación de flujos
  - Conexión con data-access
- **Usa**: data-access, pero NO llama directamente a api
- **Ejemplo**:
```typescript
@Component({...})
export class UsersPage {
  users$ = this.usersFacade.users$;

  ngOnInit() {
    this.usersFacade.loadUsers();
  }
}
```

#### 🧱 shell (Composición y Layout)
- **Responsabilidad**: Contenedor de alto nivel de la feature
- **Incluye**:
  - Layouts
  - Routing de la feature
  - Componentes contenedores principales
  - Lazy loading
- **NO contiene**: Lógica de negocio, solo estructura
- **Ejemplo**:
```typescript
const routes: Routes = [
  {
    path: '',
    component: UsersShellComponent,
    children: [...]
  }
];
```

#### 🔄 Flujo Typical
```
UI (feature) → data-access → api → backend
backend → api → data-access → feature → UI
```

#### 🚫 Reglas Importantes
- feature ❌ NO llama directamente a api
- api ❌ NO conoce feature
- data-access ✅ puede usar api
- shell solo organiza, no implementa lógica

---

### Backend (reorganizar):
```
backend/
├── domain/       # Entidades, interfaces, DTOs
└── src/          # Controllers, Services, Modules
```

---

## Módulos a Reorganizar

### 1. Fleet (Flota de Vehículos)

| Carpeta | Contenido |
|---------|-----------|
| `domain/` | Vehicle, Driver entities, ports |
| `backend/` | FleetController, FleetService, FleetModule |
| `frontend/api/` | FleetApiClient - llamadas HTTP |
| `frontend/data-access/` | VehicleStore, VehicleFacade |
| `frontend/feature/` | FleetListComponent, FleetDetailComponent |
| `frontend/shell/` | FleetShellComponent, rutas |

### 2. Clients (Clientes)

| Carpeta | Contenido |
|---------|-----------|
| `domain/` | Client entity, ports |
| `backend/` | ClientsController, ClientsService |
| `frontend/api/` | ClientsApiClient |
| `frontend/data-access/` | ClientStore, ClientFacade |
| `frontend/feature/` | ClientsListComponent, ClientsDetailComponent |
| `frontend/shell/` | ClientsShellComponent, rutas |

### 3. Billing (Facturación)

| Carpeta | Contenido |
|---------|-----------|
| `domain/` | Invoice, InvoiceLine entities |
| `backend/` | BillingController, BillingService |
| `frontend/api/` | BillingApiClient |
| `frontend/data-access/` | InvoiceStore, InvoiceFacade |
| `frontend/feature/` | BillingListComponent, BillingDetailComponent |
| `frontend/shell/` | BillingShellComponent, rutas |

### 4. Inventory (Inventario)

| Carpeta | Contenido |
|---------|-----------|
| `domain/` | Product, Reservation entities |
| `backend/` | InventoryController, InventoryService |
| `frontend/api/` | InventoryApiClient |
| `frontend/data-access/` | ProductStore, ProductFacade |
| `frontend/feature/` | InventoryListComponent, ProductDetailComponent |
| `frontend/shell/` | InventoryShellComponent, rutas |

### 5. Delivery (Entregas)

| Carpeta | Contenido |
|---------|-----------|
| `domain/` | DeliveryNote entities |
| `backend/` | DeliveryController, DeliveryService |
| `frontend/api/` | DeliveryApiClient |
| `frontend/data-access/` | DeliveryNoteStore, DeliveryFacade |
| `frontend/feature/` | DeliveryListComponent, DeliveryDetailComponent |
| `frontend/shell/` | DeliveryShellComponent, rutas |

### 6. Budget (Presupuestos)

| Carpeta | Contenido |
|---------|-----------|
| `domain/` | Budget, BudgetLine entities |
| `backend/` | BudgetController, BudgetService |
| `frontend/api/` | BudgetApiClient |
| `frontend/data-access/` | BudgetStore, BudgetFacade |
| `frontend/feature/` | BudgetListComponent, BudgetCreateComponent |
| `frontend/shell/` | BudgetShellComponent, rutas |

### 7. Rentals (Alquileres)

| Carpeta | Contenido |
|---------|-----------|
| `domain/` | Rental entities |
| `backend/` | RentalsController, RentalsService |
| `frontend/api/` | RentalsApiClient |
| `frontend/data-access/` | RentalStore, RentalFacade |
| `frontend/feature/` | RentalsListComponent, RentalsDetailComponent |
| `frontend/shell/` | RentalsShellComponent, rutas |

---

## Pasos de Implementación

### Para cada módulo:

1. **Crear carpeta `domain/`** y mover entidades de `core/`
2. **Crear carpeta `backend/`** y mover controllers de `api/`
3. **Crear carpeta `frontend/`** y mover las 4 carpetas existentes
4. **Crear `frontend/api/`** (si no existe) con clientes HTTP
5. **Actualizar project.json** de cada carpeta
6. **Actualizar exports** en index.ts
7. **Actualizar imports** en todos los archivos
8. **Actualizar tsconfig.base.json** y tsconfig.app.json con los nuevos paths

---

## Pendiente de Confirmación

¿Confirmas esta estructura con las responsabilidades claras? ¿Empezamos con la implementación?
