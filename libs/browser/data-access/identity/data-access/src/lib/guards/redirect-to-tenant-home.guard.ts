import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { resolveTenantHomePath } from '../utils/post-login-navigation';

/** Redirige `/` o rutas desconocidas al home del tenant (sin usar redirectTo + canMatch). */
export const redirectToTenantHomeGuard: CanActivateFn = () =>
  inject(Router).createUrlTree([resolveTenantHomePath()]);
