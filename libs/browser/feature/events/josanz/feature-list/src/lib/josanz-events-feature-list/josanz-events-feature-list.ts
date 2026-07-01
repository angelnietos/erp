import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JosanzCatalogListComponent, type JosanzCatalogListConfig } from '@josanz-erp/josanz-ui';
import {
  countActiveEvents,
  mapEventToCatalogRow,
  CatalogThemeFacade,
} from '@josanz-erp/josanz-ui';
import { JosanzEventApiService, type JosanzEventRecord } from '../services/josanz-event-api.service';

const EVENT_LIST_PAGE_SIZE = 10;

@Component({
  selector: 'josanz-events-feature-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="listConfig()" />`,
})
export class JosanzEventsFeatureListComponent implements OnInit {
  private readonly eventApi = inject(JosanzEventApiService);
  private readonly catalogTheme = inject(CatalogThemeFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly events = signal<JosanzEventRecord[]>([]);

  private readonly baseConfig: Omit<
    JosanzCatalogListConfig,
    'rows' | 'summaryLine' | 'paginationTotal'
  > = {
    title: 'Eventos',
    primaryBtnLabel: 'Añadir Evento',
    statusColumnLabel: 'Estado',
    addRoute: '/events/new',
    detailRoute: '/events',
    filterOptions: ['Todos', 'Externos', 'Hoteles', 'Espacios'],
    features: {
      advancedFilters: false,
      statusFilters: false,
    },
    paginationVariant: 'numbered',
    pageSize: EVENT_LIST_PAGE_SIZE,
    statusBadgeStyle: 'outline',
  };

  readonly listConfig = computed<JosanzCatalogListConfig>(() => {
    const events = this.events();
    const theme = this.catalogTheme.mergedTheme();
    const rows = events.map((event, index) => mapEventToCatalogRow(event, index, theme));
    const total = events.length;

    return {
      ...this.baseConfig,
      rows,
      summaryLine: {
        before: `${total} eventos · `,
        emphasis: `${countActiveEvents(events)} activos`,
        after: ' esta semana',
      },
      paginationTotal: Math.max(1, Math.ceil(total / EVENT_LIST_PAGE_SIZE)),
    };
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('created') === '1') {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
    this.catalogTheme.loadCatalogTheme();
    this.eventApi.list().subscribe({
      next: (events) => this.events.set(events),
    });
  }
}
