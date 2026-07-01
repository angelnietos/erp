import { Injectable } from '@angular/core';
import { slugifyExportName } from '../list-export/list-export.utils';
import {
  createDefaultCatalogSortState,
  type JosanzCatalogSortState,
} from '../list-view/catalog-list-sort';

export interface JosanzCatalogListFilterState {
  searchQuery: string;
  activeTypology: string;
  activeStatusFilter: string;
  modalFilters: Record<string, string>;
  currentPage: number;
  sort: JosanzCatalogSortState;
}

const DEFAULT_FILTER_STATE: JosanzCatalogListFilterState = {
  searchQuery: '',
  activeTypology: 'Todos',
  activeStatusFilter: '',
  modalFilters: {},
  currentPage: 1,
  sort: createDefaultCatalogSortState(),
};

export function resolveCatalogListStateKey(input: {
  stateKey?: string;
  title: string;
}): string {
  return input.stateKey?.trim() || slugifyExportName(input.title);
}

/** Estado de filtros/búsqueda por listado catálogo (persiste al navegar entre features). */
@Injectable({ providedIn: 'root' })
export class JosanzCatalogListStateService {
  private readonly states = new Map<string, JosanzCatalogListFilterState>();

  get(key: string): JosanzCatalogListFilterState | undefined {
    const state = this.states.get(key);
    if (!state) {
      return undefined;
    }
    return {
      ...state,
      modalFilters: { ...state.modalFilters },
      sort: { ...state.sort },
    };
  }

  save(key: string, state: JosanzCatalogListFilterState): void {
    this.states.set(key, {
      searchQuery: state.searchQuery,
      activeTypology: state.activeTypology,
      activeStatusFilter: state.activeStatusFilter,
      modalFilters: { ...state.modalFilters },
      currentPage: state.currentPage,
      sort: { ...state.sort },
    });
  }

  clear(key: string): void {
    this.states.delete(key);
  }
}

export function createDefaultCatalogListFilterState(): JosanzCatalogListFilterState {
  return {
    ...DEFAULT_FILTER_STATE,
    modalFilters: {},
    sort: createDefaultCatalogSortState(),
  };
}
