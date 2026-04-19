/**
 * Desarrollo: `apiOrigin` vacío + `proxy.conf.json` reenvía `/api/*` al backend (p. ej. :3000).
 * Así el navegador llama al mismo origen que el dev server (:4200) y evita CORS / puerto incorrecto.
 */
export const environment = {
  production: false,
  /** Vacío = peticiones relativas `/api/*` → proxy → backend local. */
  apiOrigin: '',
  /** Opcional: si el verifactu-api exige VERIFACTU_REQUIRE_API_KEY, pegar aquí la clave del tenant. */
  verifactuApiKey: '',
  // aiApiKey: 'xai-rtUJRQ0KKE96WunqD5eYq8odwaXVIdhv7Sd1eYWHzju3xP5nwYrJqOLEHhpW3oVBa43G9keJruQFtbcE',
  aiApiKey: '',
  googleApiKey: '',
};
