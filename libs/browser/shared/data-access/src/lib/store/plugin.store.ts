import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';

export interface PluginState {
  enabledPlugins: string[];
  realtimeSync: boolean;
  highPerformanceMode: boolean;
}

const initialState: PluginState = {
  enabledPlugins: ['dashboard', 'clients', 'projects', 'events', 'identity', 'availability', 'services', 'reports', 'audit', 'inventory', 'budgets', 'delivery', 'fleet', 'rentals', 'billing', 'verifactu'],
  realtimeSync: true,
  highPerformanceMode: false,
};

export const PluginStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    togglePlugin(pluginId: string) {
      if (pluginId === 'dashboard') return;
      
      const current = store.enabledPlugins();
      const next = current.includes(pluginId)
        ? current.filter(id => id !== pluginId)
        : [...current, pluginId];
        
      patchState(store, { enabledPlugins: next });
      localStorage.setItem('erp_enabled_plugins', JSON.stringify(next));
    },
    toggleRealtime() {
      const next = !store.realtimeSync();
      patchState(store, { realtimeSync: next });
      localStorage.setItem('erp_realtime_sync', String(next));
    },
    togglePerformance() {
      const next = !store.highPerformanceMode();
      patchState(store, { highPerformanceMode: next });
      localStorage.setItem('erp_high_perf', String(next));
    },
    setPlugins(plugins: string[]) {
      patchState(store, { enabledPlugins: plugins });
      localStorage.setItem('erp_enabled_plugins', JSON.stringify(plugins));
    },
    isPluginEnabled(pluginId: string) {
      return store.enabledPlugins().includes(pluginId);
    },
    loadFromStorage() {
        if (typeof localStorage === 'undefined') return;
        const stored = localStorage.getItem('erp_enabled_plugins');
        if (stored) {
            try {
                patchState(store, { enabledPlugins: JSON.parse(stored) });
            } catch (e) {
                console.error('Failed to load plugins from storage', e);
            }
        }
        
        const sync = localStorage.getItem('erp_realtime_sync');
        if (sync !== null) {
            patchState(store, { realtimeSync: sync === 'true' });
        }

        const perf = localStorage.getItem('erp_high_perf');
        if (perf !== null) {
            patchState(store, { highPerformanceMode: perf === 'true' });
        }
    }
  }))
);
