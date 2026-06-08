export const environment = {
  production: true,
  apiOrigin: '/api',
  keycloak: {
    url: '/auth/realms',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-web-app-spa',
  },
  grafanaDashboardUrl: '' as string,
};