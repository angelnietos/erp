import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const apiOriginInterceptor: HttpInterceptorFn = (req, next) => {
  const origin = environment.apiOrigin?.replace(/\/$/, '') ?? '';
  if (origin && req.url.startsWith('/api')) {
    return next(req.clone({ url: `${origin}${req.url}` }));
  }
  return next(req);
};
