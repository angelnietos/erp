# @josanz-erp/shared-auth-keycloak (Browser)

Cliente Angular para autenticación enterprise con **BFF + cookies HttpOnly**.

## Quick start

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  bffAuthInterceptor,
  provideEnterpriseAuth,
  BffAuthClient,
} from '@josanz-erp/shared-auth-keycloak';

export const appConfig: ApplicationConfig = {
  providers: [
    provideEnterpriseAuth({
      mode: 'bff',           // 'legacy' para JWT en localStorage
      apiPrefix: '/api',
      defaultTenantSlug: 'josanz',
    }),
    provideHttpClient(withInterceptors([bffAuthInterceptor])),
  ],
};
```

## API

### `provideEnterpriseAuth(config)`

| Campo | Descripción |
|-------|-------------|
| `mode` | `'bff'` \| `'legacy'` |
| `apiPrefix` | Prefijo API (p. ej. `/api`) |
| `defaultTenantSlug` | Slug tenant ERP por defecto |
| `csrfCookieName` | Override nombre cookie CSRF |

### `BffAuthClient`

- `erpLogin()`, `erpSession()`, `erpLogout()`
- `platformLogin()`, `platformSession()`, `platformLogout()`
- `isBffMode()`, `getErpCsrf()`, `getPlatformCsrf()`

### `bffAuthInterceptor`

- Añade `withCredentials: true`
- Envía `X-CSRF-Token` en mutaciones (POST/PUT/PATCH/DELETE)
- No añade `Authorization` (lo hace el middleware BFF en servidor)

## Documentación completa

Ver [docs/auth-enterprise-standard.md](../../../../docs/auth-enterprise-standard.md).

## Servicios OIDC legacy

`KeycloakService`, `KeycloakInterceptor`, `KeycloakAuthGuard` — adaptador OIDC redirect (roadmap PKCE). No usar junto con BFF en producción.
