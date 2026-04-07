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
