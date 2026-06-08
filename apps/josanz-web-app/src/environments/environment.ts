export const environment = {
  production: false,
  apiOrigin: 'http://localhost:3000',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-web-app-spa',
  },
  grafanaDashboardUrl: '' as string,
};