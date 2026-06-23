# Guía de arranque — Demo local (ERP + Verifactu)

Documento pensado para **alguien que no conoce el proyecto**. Sigue los pasos en orden la primera vez; después bastará con la sección [Arranque rápido](#arranque-rápido-día-a-día).

---

## Qué vas a levantar

| Servicio | URL | Para qué sirve |
|----------|-----|----------------|
| **ERP (frontend)** | http://localhost:4200 | Hub multi-tenant: Generic ERP, Babooni, Alexis… |
| **ERP (API)** | http://localhost:3000/api | Backend NestJS (facturación, clientes, cola Verifactu…) |
| **Verifactu (UI)** | http://localhost:4230 | Plataforma AEAT (cola, series, certificados) |
| **Verifactu (API CRM)** | http://localhost:3120/api | API del CRM fiscal |
| **Verifactu worker** | *(sin UI, puerto 3130)* | Procesa la cola AEAT en segundo plano |
| **Generador docs** | http://localhost:4210 | App documentos IA (opcional) |
| **Panel SaaS** | http://localhost:4300 | Admin platform (opcional) |
| **Keycloak** | http://localhost:8081 | Login SSO (usuarios demo) |
| **Swagger ERP** | http://localhost:3000/api/docs | Documentación API |

---

## Requisitos previos

1. **Node.js** 20 LTS o superior (`node -v`).
2. **pnpm** (el repo usa pnpm; si no lo tienes: `corepack enable` y `corepack prepare pnpm@latest --activate`).
3. **Docker Desktop** (Windows/Mac) o Docker Engine (Linux), **en ejecución**.
4. **Git** clonado en tu máquina:
   ```bash
   git clone <url-del-repo> josanz-erp
   cd josanz-erp
   ```

> **Windows:** usa PowerShell o terminal integrada de VS Code/Cursor. Los comandos de esta guía usan `pnpm`; en scripts npm del `package.json` algunos usan `npm run` indistintamente.

---

## Instalación (solo la primera vez)

### 1. Dependencias

```bash
pnpm install
```

Esto genera clientes Prisma (ERP + CRM) vía el script `postinstall`.

### 2. Variables de entorno

Copia los ejemplos y **no los subas a git**:

```bash
# ERP API
copy apps\backend\.env.example apps\backend\.env

# CRM Verifactu API
copy apps\verifactu-crm-api\.env.example apps\verifactu-crm-api\.env
```

**Comprueba** que `DATABASE_URL` en `apps/backend/.env` apunta al puerto **5435** (Postgres del `docker-compose.yml`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/josanz_erp?schema=public"
```

En `apps/verifactu-crm-api/.env` el puerto CRM es **55432**:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/generic_crm?schema=public
```

### 3. Infraestructura Docker

```bash
pnpm run services:up
pnpm run crm:db:up
```

Espera ~30 s y verifica:

```bash
docker ps
```

Debes ver contenedores como `josanz_erp_db` (5435), `josanz-erp-keycloak-1` (8081), `generic-crm-postgres` (55432).

### 4. Base de datos ERP (migraciones + datos demo)

```bash
pnpm run db:setup
```

Incluye: migraciones, generate Prisma y **seed** (tenants josanz, babooni, alexis, facturas demo, cola Verifactu…).

### 5. Base de datos CRM Verifactu

```bash
pnpm run crm:db:setup
```

Crea tenants CRM alineados (demo, josanz, babooni, alexis) y usuarios locales CRM.

### 6. Usuarios Keycloak (SSO)

```bash
pnpm run keycloak:sync
```

Sincroniza usuarios y roles en Keycloak para login en `:4200` y `:4230`.

---

## Arranque rápido (día a día)

Con Docker ya levantado y BD inicializada, abre **6 terminales** (o usa un gestor tipo `tmux`):

| Terminal | Comando |
|----------|---------|
| 1 | `pnpm run dev:backend` |
| 2 | `pnpm run dev:frontend` |
| 3 | `pnpm run dev:verifactu-crm-api` |
| 4 | `pnpm run dev:verifactu-platform` |
| 5 | `pnpm run dev:verifactu-worker` |
| 6 *(opcional)* | `pnpm run dev:docs` |

Espera a ver mensajes del tipo `Application is running on…` / `Compiled successfully`.

---

## Comprobar que todo responde

En PowerShell o navegador:

```powershell
Invoke-WebRequest http://localhost:3000/api/health    # → 200
Invoke-WebRequest http://localhost:3120/api/health    # → 200
Invoke-WebRequest http://localhost:4200               # → 200
Invoke-WebRequest http://localhost:4230               # → 200
```

Keycloak admin (solo debug): http://localhost:8081 — usuario `admin` / contraseña `admin` (contenedor dev).

---

## Cómo entrar (usuarios demo)

### ERP — http://localhost:4200

Tras abrir la app, elige **organización** en el selector de tenant.

| Organización | Login | Contraseña | Notas |
|--------------|-------|------------|--------|
| **Generic ERP** (josanz) | `admin@josanz.com` | `Admin123!` | Keycloak |
| **Babooni** | `root@babooni.com` | `Admin123!` | Keycloak (realm `babooni-tenant`) |
| **Alexis** | `admin@alexis.local` | `Admin123!` | Keycloak |
| **Demo** | `admin@demo.local` | `Admin123!` | Keycloak (ERP) |

> Login **local** (sin Keycloak) también existe para algunos tenants de desarrollo; la demo oficial usa Keycloak.

### Verifactu — http://localhost:4230

| Tenant | Usuario CRM (local) | Contraseña | SSO Keycloak |
|--------|---------------------|------------|--------------|
| demo | `admin@demo.local` | `Demo12345!` | `admin@demo.local` / `Admin123!` |
| josanz | `admin@josanz.com` | `Demo12345!` | mismo email KC / `Admin123!` |
| babooni | `root@babooni.com` | `Demo12345!` | `root@babooni.com` / `Admin123!` |

Desde el ERP, menú **VeriFactu** redirige automáticamente a `:4230` si ya tienes sesión Keycloak. Para quedarte en el monitor integrado del ERP: botón **Fijar vista ERP** o URL `http://localhost:4200/verifactu?stay=1`.

---

## Recorrido de prueba (15 minutos)

### A. Facturación + AEAT (tenant Babooni)

1. Entra en http://localhost:4200 con **Babooni** / `root@babooni.com`.
2. Menú **Facturación** → elige una factura emitida.
3. Pulsa **Enviar AEAT** → la factura pasa a cola `PENDING`.
4. En ~10 s el **worker** (`dev:verifactu-worker`) procesa → estado **SINCRO OK**.
5. En el detalle de factura aparece el **código QR** AEAT.
6. Menú **VeriFactu** → redirección a plataforma o puente con estadísticas de cola.

### B. Plataforma Verifactu

1. Abre http://localhost:4230/login?tenant=babooni
2. Login Keycloak con `root@babooni.com` / `Admin123!`
3. Revisa pestañas: **Overview**, **Cola**, **Historial**, **Certificado**.

### C. API (opcional)

```bash
# Salud ERP
curl http://localhost:3000/api/health

# Overview Verifactu (requiere JWT + tenant; más fácil desde la UI)
```

---

## Mapa de puertos (referencia)

| Puerto | Servicio |
|--------|----------|
| 4200 | Frontend ERP |
| 3000 | Backend ERP |
| 4230 | Frontend Verifactu |
| 3120 | API CRM Verifactu |
| 3130 | Worker Verifactu (HTTP mínimo) |
| 4210 | Generador documentos |
| 4300 | SaaS platform |
| 5435 | PostgreSQL ERP (`josanz_erp`) |
| 55432 | PostgreSQL CRM (`generic_crm`) |
| 6379 | Redis (sesiones BFF) |
| 8081 | Keycloak |

---

## Problemas frecuentes

### «Cannot connect to database»

- ¿Docker encendido? `docker ps`
- ¿Puerto correcto en `.env`? ERP **5435**, CRM **55432**.
- Reintenta: `pnpm run services:up` y `pnpm run db:setup`.

### Keycloak / login falla

```bash
pnpm run keycloak:sync
```

Si realms corruptos (muy raro):

```bash
pnpm run keycloak:reimport
```

### Verifactu: factura en cola pero no pasa a SENT

1. Comprueba que corre `pnpm run dev:verifactu-worker` (puerto **3130**).
2. Comprueba backend ERP en `:3000`.
3. Logs del worker en la terminal 5.

### Error `Http failure … localhost:3110`

El servicio legacy **verifactu-api:3110** ya no se usa. Actualiza el frontend y usa ERP `:3000` + worker `:3130`.

### Errores TypeScript en libs CRM (`libs/tsconfig.base.json`)

Corregido en el repo: los `tsconfig.json` bajo `libs/crm/isomorphic/.../api` y `libs/crm/node/backend/...` deben extender `../../../../../../tsconfig.base.json` (6 niveles hasta la raíz). Si ves el error en el IDE: **Reload Window** en VS Code/Cursor.

### Puerto ocupado

```bash
# Windows — ver qué usa el 3000
netstat -ano | findstr :3000
```

Cierra procesos Node huérfanos o cambia `PORT` en `.env`.

---

## Comandos útiles

| Acción | Comando |
|--------|---------|
| Parar Docker infra | `pnpm run services:down` |
| Parar CRM Postgres | `pnpm run crm:db:down` |
| Prisma Studio ERP | `pnpm run db:studio` |
| Prisma Studio CRM | `pnpm run crm:db:studio` |
| Reseed ERP | `pnpm run db:seed` |
| Reseed CRM | `pnpm run crm:db:seed` |
| Lint todo | `pnpm run lint` |
| Tests CI | `pnpm run test` |

---

## Documentación relacionada

- [RUNBOOK.md](./RUNBOOK.md) — despliegue backend/prod
- [USER_GUIDE.md](./USER_GUIDE.md) — guía funcional
- [keycloackusers.md](./keycloackusers.md) — administración Keycloak

---

## Checklist primera instalación

- [ ] `pnpm install`
- [ ] `apps/backend/.env` y `apps/verifactu-crm-api/.env` creados
- [ ] `pnpm run services:up` + `pnpm run crm:db:up`
- [ ] `pnpm run db:setup` + `pnpm run crm:db:setup`
- [ ] `pnpm run keycloak:sync`
- [ ] 5 procesos dev en marcha (backend, frontend, crm-api, platform, worker)
- [ ] Health 200 en `:3000` y `:3120`
- [ ] Login Babooni en `:4200` OK
- [ ] Enviar factura AEAT + ver QR

*Última revisión: entorno demo Windows + Docker, monorepo Nx `josanz-erp`.*
