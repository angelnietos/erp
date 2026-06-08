# Keycloak OIDC Authentication Library

Esta librería proporciona integración completa con Keycloak OIDC para el ecosistema Josanz ERP.

## Arquitectura

```
Angular (josanz-web-app, saas-platform)
   ↓ (OIDC/OAuth2)
Keycloak (realm por cliente)
   ↓ (tokens)
JWT tokens
   ↓
NestJS API (middleware de validación)
   ↓
Validación JWT + roles + tenant
```

## Backend (libs/node/shared/auth-keycloak)

### Uso

```typescript
// En app.module.ts
import { KeycloakAuthModule } from '@josanz-erp/auth-keycloak';

@Module({
  imports: [
    KeycloakAuthModule.forRoot({ enabled: true }),
  ],
})
export class AppModule {}
```

## Frontend (libs/browser/shared/auth-keycloak)

### Uso

```typescript
// En app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { KeycloakInterceptor, KeycloakService } from '@josanz-erp/shared-auth-keycloak';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([KeycloakInterceptor])),
    KeycloakService,
  ],
};
```

## Variables de Entorno

### Backend (.env)
- `KEYCLOAK_ENABLED=true|false` - Habilita/deshabilita Keycloak
- `KEYCLOAK_REALM` - Nombre del realm configurado
- `KEYCLOAK_AUTH_SERVER_URL` - URL del servidor Keycloak
- `KEYCLOAK_SSL_REQUIRED` - none|external|all
- `KEYCLOAK_RESOURCE` - Client ID del API
- `KEYCLOAK_CREDENTIALS_SECRET` - Secret del client

### Frontend (environment.ts)
```typescript
export const environment = {
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-web-app-spa',
  },
};
```