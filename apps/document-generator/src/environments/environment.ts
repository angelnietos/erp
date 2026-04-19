/**
 * Desarrollo: el dev server de Angular (Vite) no puede proxyar /api de forma fiable porque el
 * HTML fallback captura esas peticiones. Las peticiones relativas /api/* se envían al origen real aquí.
 */
export const environment = {
  production: false,
  /** Vacío = mismas peticiones relativas (p. ej. detrás de un reverse proxy en prod). */
  apiOrigin: 'http://localhost:3000',
  /** Opcional: si el verifactu-api exige VERIFACTU_REQUIRE_API_KEY, pegar aquí la clave del tenant. */
  verifactuApiKey: '',
  aiApiKey: '',
  googleApiKey: '',
};
