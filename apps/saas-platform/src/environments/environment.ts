export const environment = {
  production: false,
  apiOrigin: 'http://localhost:3000',
  keycloak: {
    enabled: true,
    url: 'http://localhost:8081',
    realm: 'babooni-platform',
    clientId: 'babooni-saas-platform',
  },
  keycloakEnabled: true,
  /** URL de un dashboard Grafana para embeber (p. ej. …?kiosk=tv&theme=dark). Vacío = pantalla de ayuda. */
  grafanaDashboardUrl: '' as string,
};
