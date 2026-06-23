import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { SessionTokenStorageService } from '@generic-crm/shared-browser-data-access';

/**
 * Impide entrar en rutas que requieren JWT (Clientes, Verifactu).
 * Sin token, redirige a `/login?returnUrl=…` (Keycloak) para volver tras el login.
 */
export const sessionRequiredGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean | UrlTree => {
  const storage = inject(SessionTokenStorageService);
  const router = inject(Router);
  if (storage.getAccessToken()) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
