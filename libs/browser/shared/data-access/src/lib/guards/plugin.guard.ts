import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PluginStore } from '../store/plugin.store';

export const pluginGuard = (pluginId: string): CanActivateFn => {
  return () => {
    const store = inject(PluginStore);
    const router = inject(Router);

    if (store.enabledPlugins().includes(pluginId)) {
      return true;
    }

    // Redirect to dashboard or a "Module Disabled" page
    void router.navigate(['/']);
    return false;
  };
};

/** Shell `/users` (lista + disponibilidad): al menos uno de los módulos debe estar activo */
export const usersShellGuard: CanActivateFn = () => {
  const store = inject(PluginStore);
  const router = inject(Router);
  const p = store.enabledPlugins();
  if (p.includes('identity') || p.includes('availability')) {
    return true;
  }
  void router.navigate(['/']);
  return false;
};
