import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface PluginState {
  enabledPlugins: string[];
  realtimeSync: boolean;
  highPerformanceMode: boolean;
}

const initialState: PluginState = {
  enabledPlugins: ['dashboard', 'clients', 'inventory', 'budgets', 'delivery', 'fleet', 'rentals', 'billing', 'verifactu'],
  realtimeSync: true,
  highPerformanceMode: false,
};

export const PluginStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    togglePlugin(pluginId: string) {
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
    setPlugins(plugins: string[]) {
      patchState(store, { enabledPlugins: plugins });
    },
    isPluginEnabled(pluginId: string) {
      return store.enabledPlugins().includes(pluginId);
    }
  }))
);
