# Lo que perdemos sin PaaS — capacidades que el modelo actual no da

**Para:** dirección, producto y equipo de desarrollo  
**Proyecto:** Josanz ERP  
**Versión:** Abril 2026

> Este documento lista **solo lo malo**: qué dejamos de tener (o nunca tuvimos) al operar VPS + SSH + Docker Compose frente a Railway, Vercel, Azure App Service, Render, Fly.io, etc.  
> No es una guía de migración. Para TCO y recomendaciones, ver [comparativa-ssh-vs-paas.md](./comparativa-ssh-vs-paas.md).

---

## Resumen ejecutivo

Con PaaS, la plataforma **asume** releases, observabilidad, rollback y buena parte de la seguridad operativa. Con el modelo actual (servidor propio, aunque exista `deploy-ssh.yml`), **eso lo paga el equipo** en tiempo, riesgo e incidencias — o **simplemente no existe**.

| Área | Con PaaS | Modelo actual (VPS / SSH) |
|------|----------|---------------------------|
| Rollback | Minutos, un clic / redeploy imagen | Manual, lento, riesgo con migraciones DB |
| Logs | Panel, búsqueda, retención | `docker logs` por SSH o montar stack aparte |
| Deploy | Automático tras CI | Semi-auto (Actions) + tentación de scripts manuales |
| Previews por PR | URL temporal nativa | No hay (salvo otro servidor entero) |
| Onboarding dev | Minutos | Horas (claves, runbooks, `.env`) |
| Quién despliega | Pipeline | Personas + pipeline en paralelo = confusión |

**En una frase:** ahorramos euros en la factura del VPS y **perdemos capacidades de producto** que la industria da por hechas desde hace años.

---

## 1. Rollback y control de versiones en producción

### Lo que da un PaaS

- Historial de deploys ligado a **commit / imagen / build ID**.
- **Redeploy** de la versión N−1 en pocos clics o vía API.
- Artefacto **inmutable** (contenedor) como contrato: “prod = esta imagen”.
- En muchos proveedores: rollback **sin tocar git** en el servidor.

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **No hay botón “volver atrás”** | Un deploy malo requiere intervención humana bajo presión |
| **Rollback ≠ revertir git** | `git checkout` viejo + `compose up` puede no coincidir con la imagen GHCR que había en prod |
| **Prisma / migraciones** | Bajar código sin bajar migraciones deja **DB y app desincronizadas** — rollback “a ojo” |
| **Sin catálogo de releases** | No hay lista oficial “versión 2026-04-12 14:32 = commit abc123” salvo disciplina manual |
| **Rollback parcial imposible** | Monorepo con 6+ servicios: volver solo `backend` sin coordinación es frágil |

**Escenario real:** viernes 19:00, un merge rompe login. En PaaS: redeploy imagen anterior, 5 minutos. En VPS: alguien con SSH, decidir qué tag usar, `compose pull`, rezar con migraciones, 30–90 minutos si hay suerte.

---

## 2. Logs, métricas y observabilidad

### Lo que da un PaaS

- **Logs agregados** por servicio, búsqueda, filtros, retención configurable.
- **Métricas** CPU/RAM/latencia/request rate en dashboard.
- **Trazas** (según plan) y alertas integrables.
- Acceso para todo el equipo **sin shell en producción**.

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **No hay panel de logs** | Hay que `ssh` + `docker compose logs -f servicio` |
| **Logs se pierden** | Rotación de Docker, disco lleno, reinicio de contenedor = huecos |
| **Sin correlación request-id** | Debug de incidencias multi-servicio (API + worker + front) es manual |
| **Sin alertas out-of-the-box** | Caída de API a las 3:00 → nadie se entera hasta que lo reporta un usuario |
| **Métricas hay que montarlas** | Prometheus + Grafana + node_exporter = proyecto aparte |
| **Storybook / workers / Verifactu** | Cada servicio = otro stream de logs que alguien debe mirar |

**Coste oculto:** cada incidencia empieza con “¿puedes entrar al servidor?” en lugar de abrir un dashboard.

---

## 3. Deploy: automático vs manual vs “semi”

### Lo que da un PaaS

- Push/merge → **deploy solo**, siempre igual.
- Estado visible: building → deploying → live / failed.
- Mismo procedimiento para **todos** los devs; cero runbooks personales.

### Lo que perdemos hoy

Aunque exista `deploy-ssh.yml`, el entorno real suele mezclar:

| Fricción | Por qué duele |
|----------|----------------|
| **Guía interna con `git pull` manual** | Compañeros despliegan distinto que GitHub Actions |
| **Dos servidores posibles** | Actions va a B, la guía a A — el fix “no se ve” |
| **Scripts manuales** (`bootstrap`, `source .env`, perfiles Compose) | Un paso olvidado = prod rota |
| **Deploy depende de secretos bien puestos** | `DEPLOY_*`, GHCR token, `.env` en disco — tres puntos de fallo |
| **Sin deploy atómico por servicio** | `compose up` de todo el stack aunque solo cambió el front |
| **Deploy un viernes** | Si Actions falla, ¿quién tiene acceso y conoce el runbook? |

**Lo peor:** la sensación de tener CI/CD **y a la vez** pedir SSH + PAT + procedimientos manuales. Dos velocidades, dos verdades.

---

## 4. Entornos preview y staging de verdad

### Lo que da un PaaS

- **Preview URL** por PR (o por rama) para que producto/QA vea cambios antes de merge.
- Staging **aislado** con un clic.
- Paridad razonable staging ≈ prod sin duplicar runbooks.

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **No hay preview por PR** | QA prueba en local o directamente en staging compartido |
| **Staging = otro VPS o el mismo mal particionado** | Hay que pagar y operar otra máquina o mezclar puertos/env |
| **Datos de prueba en staging** | Seed manual, copia de prod (riesgo GDPR), o staging vacío e inútil |
| **“Probar en prod” por tentación** | Sin preview, la presión empuja a saltarse el ciclo |

Para un ERP con facturación, Verifactu y multi-tenant, **no poder probar en URL real antes de prod** es riesgo de negocio directo.

---

## 5. Seguridad operativa y auditoría

### Lo que da un PaaS

- **Sin shell de producción** para la mayoría del equipo.
- Tokens de deploy **rotables** y scoped.
- Audit log del proveedor: quién desplegó, cuándo, qué versión.
- RBAC en panel (quién ve logs, quién dispara deploy).

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **SSH = shell en prod** | Cada clave de compañero es superficie de ataque |
| **PATs personales en servidor** | Credenciales humanas en máquina compartida |
| **“¿Quién desplegó?”** | Logs de SSH + git + Actions dispersos; no hay verdad única |
| **Revocar acceso** | Hay que quitar claves en `authorized_keys` una a una |
| **Separación dev/prod** | Misma máquina si no se duplica infra — error humano más barato |
| **Parches OS / Docker** | Responsabilidad nuestra; PaaS los absorbe en gran parte |

---

## 6. Onboarding, documentación y dependencia de personas

### Lo que da un PaaS

- Invitar al proyecto → listo.
- La plataforma **es** la documentación de deploy.

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **Runbooks largos** | `ssh-servers.md`, guía interna, README deploy, comparativas… |
| **2–4 h onboarding** por persona | Clave SSH, PAT, path `/var/deploys`, perfiles Compose |
| **Bus factor** | Solo “el que tiene llaves” puede salvar un viernes |
| **Conocimiento tribal** | “En prod hay que hacer X antes del pull” no está en el código |
| **Rotación de equipo** | Cada baja/alta = tickets a admin + riesgo de claves huérfanas |

---

## 7. Base de datos, backups y continuidad

### Lo que da un PaaS (con addon DB gestionada)

- Backups automáticos, point-in-time recovery (según plan).
- Parches de Postgres gestionados.
- Escalado de disco/CPU sin SSH.

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **Postgres en Docker en el VPS** | Backup = script cron que alguien debe verificar |
| **Restore no probado** | Hasta que no hay desastre, no se sabe si el backup sirve |
| **Migraciones Prisma en prod** | Fallo a medias = estado corrupto; PaaS no lo arregla, pero rollback de app es más claro |
| **Disco lleno** | Logs + imágenes Docker viejas tumban prod |
| **Sin réplica/geo** | Un VPS = single point of failure |

---

## 8. Red, SSL, CDN y rendimiento

### Lo que da un PaaS

- **HTTPS** automático (Let’s Encrypt gestionado).
- **CDN** en fronts (Vercel, Azure SWA, Cloudflare integrado).
- DDoS básico absorbido por el borde del proveedor.

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **Certificados SSL** | Certbot + renovación + nginx/Caddy — otra tarea manual |
| **Un solo nodo en una región** | Latencia para usuarios lejos; sin CDN salvo montarla |
| **Angular estático** | Servido desde el mismo VPS que la API — sin edge global |
| **Caída del VPS** | Todo cae: API, front, Keycloak si está ahí, workers |

---

## 9. Escalabilidad y picos de negocio

### Lo que da un PaaS

- Escalar servicio (más RAM/réplicas) desde panel o autoscaling.
- Separar workers de la API sin renegociar la infra entera.

### Lo que perdemos hoy

| Problema | Impacto |
|----------|---------|
| **Techo fijo del VPS** | Evento Josanz con pico de usuarios → OOM o lentitud |
| **Escalar = comprar otro servidor** | No es minutos; es proyecto |
| **Verifactu worker + API + fronts** | Compiten por CPU/RAM del mismo metal |
| **Planificar capacidad** | Alguien debe mirar gráficas (si existen) y decidir upgrade |

---

## 10. Multi-app monorepo (nuestro caso concreto)

Josanz ERP no es una sola app. Perdemos especialmente:

| Servicio | Sin PaaS |
|----------|----------|
| `backend` | Deploy coordinado con migraciones; logs a mano |
| `josanz-web-app` / `frontend` | Sin CDN; rebuild + compose |
| `saas-platform` | Otro contenedor más que vigilar |
| `document-generator` | Colas/workers sin dashboard |
| `verifactu-api` + worker | Crítico legal; incidencia = SSH + logs |
| Storybook | En Railway tenía flujo; en VPS hay que justificar otro host/puerto |

En PaaS: **un servicio = un panel = un historial de deploy**. En VPS: **un servidor = un cubo de complejidad**.

---

## 11. Aun con GitHub Actions (`deploy-ssh.yml`) seguimos perdiendo

El repo mitiga **parte** del manual puro, pero **no recupera** el nivel PaaS:

| Capacidad PaaS | ¿Lo da `deploy-ssh.yml`? |
|----------------|--------------------------|
| Deploy automático tras merge | **Parcial** — sí, si secretos y servidor están bien |
| Historial visual de releases | **No** |
| Rollback one-click | **No** |
| Logs centralizados | **No** |
| Preview por PR | **No** |
| Alertas / uptime | **No** |
| SSL gestionado | **No** |
| Backups DB | **No** |
| Escalado | **No** |
| Cero SSH para devs | **No** — la guía sigue pidiendo acceso |

**Conclusión:** Actions evita el peor escenario (`git pull` por cada dev), pero **no convierte un VPS en PaaS**.

---

## Checklist: “¿lo tenemos?”

Usar en reunión con dirección — marcar honestamente:

| Capacidad | PaaS | Nosotros hoy |
|-----------|:----:|:------------:|
| Rollback < 15 min sin SSH | ✅ | ☐ |
| Logs buscables últimos 7 días | ✅ | ☐ |
| Alerta si API cae | ✅ | ☐ |
| Preview URL por PR | ✅ | ☐ |
| Deploy 100 % sin intervención humana | ✅ | ☐ |
| Onboarding dev < 1 h | ✅ | ☐ |
| Auditoría “quién desplegó commit X” | ✅ | ☐ |
| Backup DB probado mensualmente | ✅ | ☐ |
| SSL sin intervención manual | ✅ | ☐ |
| Escalar bajo pico sin comprar otro VPS | ✅ | ☐ |

Cada ☐ vacío es **deuda** que el equipo paga en incidencias o **riesgo** que asume negocio.

---

## Coste que no sale en la factura del VPS

| Lo que perdemos | Cómo se manifiesta |
|-----------------|-------------------|
| **Velocidad** | Fixes llegan tarde; QA empieza tarde |
| **Calidad** | Menos previews → más bugs en prod |
| **Tranquilidad** | Miedo a desplegar viernes |
| **Enfoque** | Devs pensando en servidores en vez de features |
| **Reputación interna** | “El ERP otra vez caído” |
| **Contratación** | Perfil producto, no DevOps; runbooks SSH no escalan |

Estimación ya documentada en [comparativa-ssh-vs-paas.md](./comparativa-ssh-vs-paas.md): **5–12 h/mes** de operación ≈ **225–540 €/mes** en tiempo técnico — por encima del ahorro típico del VPS (**30–110 €/mes**).

---

## Mensaje para dirección (copiar/pegar)

> Al dejar PaaS por VPS + SSH **no solo cambiamos de proveedor**: perdemos rollback rápido, logs unificados, previews, alertas y deploy sin personas.  
> GitHub Actions reduce el daño del deploy manual, pero **no sustituye** un PaaS.  
> Lo que ahorramos en infra lo pagamos en **incidencias, lentitud de releases y dependencia de quien tenga llaves**.  
> Si la decisión es mantener VPS, hay que **asignar tiempo DevOps explícito** y asumir que varias filas del checklist anterior quedarán vacías.

---

## Documentos relacionados

| Documento | Para qué |
|-----------|----------|
| [comparativa-ssh-vs-paas.md](./comparativa-ssh-vs-paas.md) | TCO, diagramas, opciones A/B/C |
| [servidor-unico-ssh-y-cicd.md](./servidor-unico-ssh-y-cicd.md) | Cómo reducir caos (un solo VPS + Actions) |
| [guia-interna-vs-deploy-github.md](./guia-interna-vs-deploy-github.md) | Por qué conviven guía manual y CI |
| [deploy/README-DIRECCION.md](../../deploy/README-DIRECCION.md) | Índice para dirección |

---

*Lista de gaps operativos — Josanz ERP. Actualizar cuando cambie la infra (por ejemplo, si se monta Grafana/Loki o se recupera Railway).*
