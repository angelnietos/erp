export const environment = {
  production: true,
  apiOrigin: '',
  auth: {
    mode: 'bff' as const,
  },
  keycloak: {
    enabled: false,
    url: '',
    realm: 'babooni-platform',
    clientId: 'babooni-saas-platform',
  },
  keycloakEnabled: false,
  /** Configurar en build o sustituir por URL real del dashboard Grafana. */
  grafanaDashboardUrl: '' as string,
  erpHubUrl: '/auth/tenant',
};
