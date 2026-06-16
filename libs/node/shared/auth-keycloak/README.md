# @josanz-erp/auth-keycloak (Backend)

Librería enterprise de autenticación: **Keycloak como IdP** + **BFF con cookies HttpOnly**.

## Arquitectura recomendada (producción)

```
Angular SPA                    NestJS BFF + API
     │                                │
     │  POST /bff/auth/login          │
     │  (withCredentials)             ├──► Keycloak (password grant, servidor)
     │                                │◄── access_token
     │◄── Set-Cookie: erp_sid (HttpOnly)
     │    Set-Cookie: erp_csrf
     │                                │
     │  POST /api/... + X-CSRF-Token  │
     │───────────────────────────────►│ Middleware: cookie → Bearer + tenant
```

El navegador **nunca** almacena JWT en `localStorage`.

## Módulos

### BffAuthModule

Registrado en `identity-backend`:

```typescript
import { BffAuthModule } from '@josanz-erp/auth-keycloak';

BffAuthModule.forRoot()
```

Incluye:
- `InMemoryBffSessionStore` — sesiones en memoria (dev/single-node)
- `BffSessionMiddleware` — inyecta `Authorization` y valida CSRF
- `KeycloakTokenClient` — token exchange server-side

### KeycloakAuthModule (legacy OIDC guard)

Validación JWT vía JWKS para rutas que reciben Bearer directamente.

## Cookies

| App | Session (HttpOnly) | CSRF (legible JS*) |
|-----|-------------------|-------------------|
| ERP | `erp_sid` | `erp_csrf` |
| Platform | `saas_sid` | `saas_csrf` |

\*En cross-origin dev el CSRF se devuelve también en JSON (`csrfToken`).

## Variables de entorno

```env
KEYCLOAK_ENABLED=true
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8081
KEYCLOAK_SPA_CLIENT_SECRET=
KEYCLOAK_PLATFORM_REALM=babooni-platform
KEYCLOAK_PLATFORM_CLIENT_ID=babooni-saas-platform
BFF_SESSION_MAX_AGE_HOURS=24
NODE_ENV=production   # activa Secure en cookies
```

## Frontend

Ver `@josanz-erp/shared-auth-keycloak` y [docs/auth-enterprise-standard.md](../../../../docs/auth-enterprise-standard.md).

## Migración desde legacy

1. Backend: desplegar con `BffAuthModule` + `cookie-parser`
2. Frontend: `provideEnterpriseAuth({ mode: 'bff' })` + `bffAuthInterceptor`
3. CORS con `credentials: true`
4. Verificar login/logout en ERP y Platform
5. Desactivar `auth.mode: 'legacy'` en todos los entornos

## Roadmap técnico

- Redis session store
- Authorization Code + PKCE (eliminar password grant)
- Keycloak back-channel logout
