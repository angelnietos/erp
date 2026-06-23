/**
 * Desarrollo: el dev server de Angular (Vite) no puede proxyar /api de forma fiable porque el
 * HTML fallback captura esas peticiones. Las peticiones relativas /api/* se envían al origen real aquí.
 */
export const environment = {
  production: false,
  apiOrigin: 'http://localhost:3000',
  erpHubUrl: 'http://localhost:4200/auth/tenant',
  /** Opcional: si el verifactu-api exige VERIFACTU_REQUIRE_API_KEY, pegar aquí la clave del tenant. */
  verifactuApiKey: '',
  aiApiKey: '',
  googleApiKey: '',
};
