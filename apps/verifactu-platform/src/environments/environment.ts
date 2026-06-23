/**
 * Valores por defecto en tiempo de compilación.
 * En runtime, `public/config.json` puede sobrescribir `apiBaseUrl` (ver AppRuntimeConfig).
 */
export const environment = {
  /** API identidad CRM — :3120 (3100 suele estar ocupado por Loki en Docker). */
  apiBaseUrl: 'http://localhost:3120',
  defaultTenantSlug: 'demo',
  erpHubUrl: 'http://localhost:4200/auth/tenant',
  keycloak: {
    enabled: true,
    url: 'http://localhost:8081',
    realm: 'josanz-web-app-realm',
    clientId: 'verifactu-crm-spa',
  },
};
