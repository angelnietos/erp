import { computed, Signal } from '@angular/core';
import { GlobalAuthStore } from '../store/auth.store';

type AuthWithPermissions = InstanceType<typeof GlobalAuthStore>;

/**
 * Señal reactiva a `refreshSession`: concede acceso con `*` o con cualquiera de las claves.
 * Usar en componentes OnPush en lugar de `hasPermission()` dentro de `computed` sin leer `permissions()`.
 */
export function rbacAllows(
  auth: AuthWithPermissions,
  ...requiredPermissions: string[]
): Signal<boolean> {
  return computed(() => {
    const perms = auth.permissions();
    if (perms.includes('*')) {
      return true;
    }
    return requiredPermissions.some((k) => perms.includes(k));
  });
}
