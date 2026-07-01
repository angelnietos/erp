import { computed, signal } from '@angular/core';
import { convertToParamMap } from '@angular/router';
import type { Client } from '@josanz-erp/clients-data-access';
import {
  CatalogThemeFacade,
  defaultTenantCatalogTheme,
  JOSANZ_CATALOG_CLIENT_TABS,
} from '@josanz-erp/josanz-ui';
import { ClientsFacade } from '@josanz-erp/clients-data-access';

export const demoClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'client-demo-1',
  name: 'Demo Cliente S.L.',
  contact: 'Operador Uno',
  email: 'demo@cliente.com',
  phone: '+34 600 111 222',
  description: '',
  sector: 'Tipo cliente 1',
  type: 'COMPANY',
  tariffLabel: 'Especial 01',
  railColor: '#E91E63',
  pillColor: '#F48FB1',
  contacts: [
    {
      id: 'op-1',
      name: 'Operador Uno',
      email: 'op1@cliente.com',
      phone: '+34 600 333 444',
      position: 'Operador',
      isPrimary: true,
    },
  ],
  ...overrides,
});

export function createClientsFacadeMock(initial: Client[] = []) {
  const clients = signal<Client[]>(initial);
  const isLoading = signal(false);

  return {
    clients: clients.asReadonly(),
    isLoading: isLoading.asReadonly(),
    loadClients: jest.fn(),
    prefetchClients: jest.fn(),
    refreshClients: jest.fn(),
    upsertClient: jest.fn((client: Client) => {
      clients.update((rows) => {
        const index = rows.findIndex((row) => row.id === client.id);
        if (index === -1) {
          return [...rows, client];
        }
        const next = [...rows];
        next[index] = client;
        return next;
      });
    }),
    ensureClient: jest.fn(),
    getClientFromCache: jest.fn((id: string) =>
      clients().find((row) => row.id === id) ?? null,
    ),
    _clients: clients,
    _isLoading: isLoading,
  } satisfies Partial<ClientsFacade> & {
    _clients: ReturnType<typeof signal<Client[]>>;
    _isLoading: ReturnType<typeof signal<boolean>>;
  };
}

export function createCatalogThemeFacadeMock() {
  const theme = signal(defaultTenantCatalogTheme());
  return {
    loadCatalogTheme: jest.fn(),
    mergedTheme: computed(() => theme()),
    theme: theme.asReadonly(),
    loading: signal(false).asReadonly(),
    saving: signal(false).asReadonly(),
  } satisfies Partial<CatalogThemeFacade>;
}

export function activatedRouteWithQuery(
  query: Record<string, string> = {},
  params: Record<string, string> = {},
) {
  return {
    snapshot: {
      queryParamMap: convertToParamMap(query),
      paramMap: convertToParamMap(params),
    },
  };
}

export { JOSANZ_CATALOG_CLIENT_TABS };
