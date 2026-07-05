export const environment = {
  production: true,
  apiOrigin: '',
  auth: {
    mode: 'bff' as const,
  },
  keycloak: {
    url: '',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-figma-spa',
    enabled: true,
  },
  grafanaDashboardUrl: '' as string,
};
