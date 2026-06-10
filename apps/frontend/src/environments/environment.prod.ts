/**
 * Producción: no commitear claves reales; inyectar vía CI/secret manager o sustituir en deploy.
 */
export const environment = {
  production: true,
  apiOrigin: '',
  verifactuApiKey: '',
  aiApiKey: '',
  googleApiKey: '',
  keycloak: {
    url: '',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-web-app-spa',
    enabled: false,
  },
};
