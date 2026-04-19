/**
 * Desarrollo — API del ERP (`nx serve backend`, por defecto :3000):
 * - URL absoluta: el navegador llama directamente al Nest (CORS ya permite `http://localhost:4200`).
 *   Evita el fallo "Cannot POST /api/..." cuando el proxy del dev server no reenvía bien.
 * - `''`: rutas relativas `/api/*` → `proxy.conf.json` → mismo host que el dev server.
 * Debe coincidir con `PORT` en `apps/backend/.env` (por defecto 3000).
 */
export const environment = {
  production: false,
  apiOrigin: 'http://localhost:3000',
  /** Opcional: si el verifactu-api exige VERIFACTU_REQUIRE_API_KEY, pegar aquí la clave del tenant. */
  verifactuApiKey: '',
  // aiApiKey: 'xai-rtUJRQ0KKE96WunqD5eYq8odwaXVIdhv7Sd1eYWHzju3xP5nwYrJqOLEHhpW3oVBa43G9keJruQFtbcE',
  aiApiKey: '',
  googleApiKey: '',
};
