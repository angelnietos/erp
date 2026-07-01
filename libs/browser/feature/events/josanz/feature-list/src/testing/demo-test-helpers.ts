import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { ClientsFacade } from '@josanz-erp/clients-data-access';
import { CatalogThemeFacade, defaultTenantCatalogTheme } from '@josanz-erp/josanz-ui';
import type { JosanzEventRecord } from '../lib/services/josanz-event-api.service';
import { JosanzEventsFacade } from '../lib/services/josanz-events.facade';

export const demoEvent = (overrides: Partial<JosanzEventRecord> = {}): JosanzEventRecord => ({
  id: 'event-demo-1',
  name: 'Evento Demo',
  status: 'DRAFT',
  typology: 'Evento externo',
  clientId: 'client-demo-1',
  operatorContactId: 'op-1',
  startDate: '2026-07-15',
  endDate: '2026-07-15',
  eventTime: '10:00',
  eventSchedule: [{ date: '2026-07-15', time: '10:00' }],
  location: 'Madrid',
  venueSchedule: [],
  notes: null,
  summary: null,
  budgetAddress: null,
  budgetContact: null,
  budgetObservations: null,
  createdAt: '2026-07-01T00:00:00.000Z',
  client: { id: 'client-demo-1', name: 'Demo Cliente S.L.' },
  operator: { id: 'op-1', name: 'Operador Uno', email: null, phone: null },
  ...overrides,
});

export function createEventsFacadeMock(initial: JosanzEventRecord[] = [demoEvent()]) {
  const events = signal<JosanzEventRecord[]>(initial);
  const loading = signal(false);

  return {
    events: computed(() => events()),
    loading: computed(() => loading()),
    error: computed(() => null),
    hasCache: computed(() => events().length > 0),
    loadEvents: jest.fn(),
    refreshEvents: jest.fn(),
    patchEventStatus: jest.fn((id: string, status: string, color?: string | null) => {
      events.update((rows) =>
        rows.map((row) =>
          row.id === id ? { ...row, status, statusPillColor: color ?? row.statusPillColor } : row,
        ),
      );
    }),
    updateEventStatus: jest.fn(() => of(demoEvent({ status: 'CONFIRMED' }))),
    createEvent: jest.fn(() => of(demoEvent())),
    _events: events,
  } satisfies Partial<JosanzEventsFacade> & {
    _events: ReturnType<typeof signal<JosanzEventRecord[]>>;
  };
}

export function createClientsFacadeMockForEvents() {
  return {
    clients: signal([]).asReadonly(),
    prefetchClients: jest.fn(),
    loadClients: jest.fn(),
  } satisfies Partial<ClientsFacade>;
}

export function createCatalogThemeFacadeMock() {
  const theme = signal(defaultTenantCatalogTheme());
  return {
    loadCatalogTheme: jest.fn(),
    mergedTheme: computed(() => theme()),
  } satisfies Partial<CatalogThemeFacade>;
}
