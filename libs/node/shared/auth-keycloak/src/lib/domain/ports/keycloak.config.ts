import { registerAs } from '@nestjs/config';

export interface KeycloakConfig {
  realm: string;
  authServerUrl: string;
  sslRequired: 'none' | 'external' | 'all';
  resource?: string;
  credentialsSecret?: string;
  tokenLeeway?: number;
}

export default registerAs('keycloak', () => ({
  realm: process.env.KEYCLOAK_REALM || 'josanz-web-app-realm',
  authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080',
  sslRequired: (process.env.KEYCLOAK_SSL_REQUIRED || 'none') as 'none' | 'external' | 'all',
  resource: process.env.KEYCLOAK_RESOURCE || 'josanz-erp-api',
  credentialsSecret: process.env.KEYCLOAK_CREDENTIALS_SECRET,
  tokenLeeway: parseInt(process.env.KEYCLOAK_TOKEN_LEEWAY || '60', 10),
}));