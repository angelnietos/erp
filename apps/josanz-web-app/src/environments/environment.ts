export const environment = {
  production: false,
  /** Modo BFF: rutas relativas `/api/*` + proxy (cookies HttpOnly). */
  apiOrigin: '',
  auth: {
    mode: 'bff' as const,
  },
  keycloak: {
    url: 'http://localhost:8081',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-web-app-spa',
    enabled: true,
  },
  grafanaDashboardUrl: '' as string,
};
