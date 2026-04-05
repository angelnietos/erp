import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { computed } from '@angular/core';

export interface PluginState {
  enabledPlugins: string[];
  realtimeSync: boolean;
  highPerformanceMode: boolean;
}

const initialState: PluginState = {
  enabledPlugins: ['dashboard', 'clients', 'services', 'reports', 'audit', 'inventory', 'budgets', 'delivery', 'fleet', 'rentals', 'billing', 'verifactu'],
  realtimeSync: true,
  highPerformanceMode: false,
};

export const PluginStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    premiumExperience: computed(() => !state.highPerformanceMode()),
  })),
  withMethods((store) => ({
    togglePlugin(pluginId: string) {
      if (pluginId === 'dashboard') return;
      
      const current = store.enabledPlugins();
      if (current.includes(pluginId)) {
        patchState(store, { enabledPlugins: current.filter(id => id !== pluginId) });
      } else {
        patchState(store, { enabledPlugins: [...current, pluginId] });
      }
    },
    toggleRealtime() {
      patchState(store, { realtimeSync: !store.realtimeSync() });
    },
    togglePerformance() {
      patchState(store, { highPerformanceMode: !store.highPerformanceMode() });
    },
    setPremiumExperience(enabled: boolean) {
      patchState(store, { highPerformanceMode: !enabled });
    },
    setPlugins(plugins: string[]) {
      patchState(store, { enabledPlugins: plugins });
    },
    isPluginEnabled(pluginId: string) {
      return store.enabledPlugins().includes(pluginId);
    }
  }))
);
