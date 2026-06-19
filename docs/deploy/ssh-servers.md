# Despliegue en servidores SSH (Babooni)

Guía para el equipo de desarrollo: acceso SSH, configuración del servidor en `/var/deploys/` y pipelines de GitHub Actions.

> **Railway → servidores propios:** el repo sigue teniendo `deploy-railway.yml` por compatibilidad, pero el flujo recomendado es **GHCR + Docker Compose + deploy SSH**.

## Arquitectura

```text
push main/dev  →  nx-affected-ci (lint/test/build)
              →  docker-images (build/push GHCR)
              →  deploy-ssh (SSH al VPS: pull imágenes + compose up)
```

| Componente | Ubicación |
|------------|-----------|
| Código en servidor | `/var/deploys/erp/` (clone del monorepo) |
| Variables de entorno | `/var/deploys/erp/deploy/.env` o `.env.staging` |
| Compose producción | `docker-compose.prod.yml` en la raíz del repo |
| Imágenes | `ghcr.io/angelnietos/erp/<servicio>:<tag>` |

## Parte 1 — Tu máquina (Windows)

### 1. Comprobar si ya tienes clave SSH

```powershell
Get-ChildItem $HOME\.ssh\
```

Si ves `id_ed25519` e `id_ed25519.pub`, salta al paso 3.

### 2. Generar clave (una vez por dispositivo)

```powershell
ssh-keygen -t ed25519 -C "tu_nombre@tu-pc"
```

- Ruta por defecto: `C:\Users\TuUsuario\.ssh\id_ed25519`
- **Passphrase recomendada** (cifra la clave privada en disco)

Si `ssh-keygen` no existe: **Configuración → Aplicaciones → Características opcionales → OpenSSH Client**.

Arrancar el agente (opcional, para no escribir la passphrase en cada sesión):

```powershell
# PowerShell como administrador (una vez)
Set-Service ssh-agent -StartupType Automatic
Start-Service ssh-agent
ssh-add $HOME\.ssh\id_ed25519
```

### 3. Copiar clave pública

```powershell
Get-Content $HOME\.ssh\id_ed25519.pub | Set-Clipboard
```

Envía **solo** el contenido de `.pub` al administrador (Slack/email). **Nunca** compartas `id_ed25519` (sin `.pub`).

### 4. Probar conexión

Cuando el admin confirme:

```powershell
ssh babooni@IP_O_HOSTNAME_DEL_SERVIDOR
```

Primera vez: escribe `yes` al fingerprint.

---

## Parte 2 — Servidor (administrador o primera vez)

### Requisitos

- Ubuntu con Docker Engine + Compose v2
- Usuario `babooni` (o el acordado) con acceso SSH por clave
- Puertos HTTP/HTTPS abiertos según reverse proxy

### Bootstrap automático

En el servidor, como usuario con sudo:

```bash
sudo bash /var/deploys/erp/deploy/scripts/bootstrap-server.sh
```

O clonar y ejecutar desde el repo (ver script en `deploy/scripts/bootstrap-server.sh`).

### Bootstrap manual

```bash
sudo mkdir -p /var/deploys
sudo chown "$USER:$USER" /var/deploys
cd /var/deploys

git clone https://github.com/angelnietos/erp.git erp
cd erp

cp deploy/.env.example deploy/.env
# Editar deploy/.env con secretos reales (ver abajo)

# Login GHCR (PAT con read:packages)
echo "ghp_..." | docker login ghcr.io -u TU_USUARIO_GITHUB --password-stdin

set -a && source deploy/.env && set +a
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Migraciones (backend)
docker compose -f docker-compose.prod.yml --profile core run --rm backend \
  npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### `deploy/.env` (producción)

Copia desde `deploy/.env.example`. Valores mínimos Josanz:

```bash
COMPOSE_PROFILES=josanz,core

DATABASE_URL=postgresql://postgres:SECRETO@postgres:5432/josanz_erp?schema=public
POSTGRES_PASSWORD=SECRETO
JWT_SECRET=SECRETO_LARGO_MIN_32_CHARS
CORS_ORIGIN=https://tu-dominio.com

BACKEND_IMAGE=ghcr.io/angelnietos/erp/backend:main
JOSANZ_WEB_APP_IMAGE=ghcr.io/angelnietos/erp/josanz-web-app:main
```

El host de Postgres en `DATABASE_URL` debe ser **`postgres`** (nombre del servicio en Compose), no `localhost`.

### Git pull en el servidor

Si el servidor clona por HTTPS, Git pedirá usuario + **Personal Access Token** (no la contraseña de GitHub):

1. GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
2. Permiso: `repo` (repositorios privados)
3. En `git pull`: Password = token `ghp_...`

Alternativa: configurar deploy key o SSH remote en el servidor.

---

## Parte 3 — GitHub Actions (pipelines)

### Workflows

| Workflow | Cuándo | Qué hace |
|----------|--------|----------|
| `nx-affected-ci.yml` | push/PR a `main` | lint, test, build affected |
| `docker-images.yml` | push a `main`, `dev` | build/push imágenes a GHCR |
| `deploy-ssh.yml` | tras `docker-images` OK, o manual | SSH → pull + compose up |
| `deploy-railway.yml` | manual (legacy) | Railway |

### Secretos del repositorio

**Settings → Secrets and variables → Actions**

| Secreto | Descripción |
|---------|-------------|
| `DEPLOY_HOST` | IP o hostname del VPS |
| `DEPLOY_USER` | Usuario SSH (ej. `babooni`) |
| `DEPLOY_SSH_KEY` | Contenido completo de la clave **privada** PEM (la del CI, no la tuya personal*) |
| `DEPLOY_PATH` | `/var/deploys/erp` |
| `GHCR_PULL_TOKEN` | PAT con `read:packages` |
| `GHCR_PULL_USER` | Usuario GitHub del PAT |

\* Para CI suele crearse un par de claves dedicado al deploy (`github-actions-deploy`) cuya **pública** añade el admin al servidor, y la **privada** va en `DEPLOY_SSH_KEY`.

### Environments

Crear en GitHub **Settings → Environments**:

- `production` — rama `main`, usa `deploy/.env.production` o `deploy/.env`
- `staging` — rama `dev`, usa `deploy/.env.staging`

### Despliegue manual

Actions → **Deploy — SSH (Ubuntu)** → Run workflow → elegir `production` o `staging`.

### Actualizar solo en servidor (emergencia)

```bash
ssh babooni@SERVIDOR
cd /var/deploys/erp
git pull
set -a && source deploy/.env && set +a
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

---

## Perfiles Compose

| Perfil | Servicios |
|--------|-----------|
| `josanz,core` | Postgres + backend + josanz-web-app |
| `legacy-front,core` | Postgres + backend + frontend (nginx /api) |
| `saas` | saas-platform |
| `verifactu` | verifactu-api + verifactu-worker |
| `all` | Todo lo configurado en `.env` |

---

## Problemas frecuentes

### `Permission denied (publickey)`

- El admin no ha añadido tu clave pública, o usas otro usuario/host.
- En CI: revisa `DEPLOY_SSH_KEY` y que la clave pública correspondiente esté en `~/.ssh/authorized_keys` del servidor.

### `denied: permission_denied` al pull GHCR

```bash
echo TOKEN | docker login ghcr.io -u USUARIO --password-stdin
```

Token necesita scope `read:packages`. Las imágenes del repo deben ser accesibles (org/package settings).

### Backend no arranca / DB

- `DATABASE_URL` con host `postgres`
- Postgres healthy: `docker compose -f docker-compose.prod.yml ps`
- Migraciones pendientes: ver comando `prisma migrate deploy` arriba

### Imagen antigua en producción

Comprueba tag en `deploy/.env` (`:main`, `:dev` o SHA). Tras push a `main`, espera a que termine **Docker — build & push** antes del deploy SSH.
