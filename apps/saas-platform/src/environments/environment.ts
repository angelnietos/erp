export const environment = {
  production: false,
  apiOrigin: 'http://localhost:3000',
  keycloak: {
    url: 'http://localhost:8081',
    realm: 'saas-platform-realm',
    clientId: 'saas-platform-spa',
  },
  /** URL de un dashboard Grafana para embeber (p. ej. …?kiosk=tv&theme=dark). Vacío = pantalla de ayuda. */
  grafanaDashboardUrl: '' as string,
};
