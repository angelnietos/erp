import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

/** Añade x-api-key a la API Verifactu (3110) si está definida en entorno y VERIFACTU_REQUIRE_API_KEY=true en servidor. */
export const verifactuApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('localhost:3110')) {
    return next(req);
  }
  const key = environment.verifactuApiKey?.trim();
  if (!key || req.headers.has('x-api-key')) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'x-api-key': key } }));
};
