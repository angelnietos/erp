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
  // aiApiKey: 'xai-rtUJRQ0KKE96WunqD5eYq8odwaXVIdhv7Sd1eYWHzju3xP5nwYrJqOLEHhpW3oVBa43G9keJruQFtbcE',
  aiApiKey: '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',
};
