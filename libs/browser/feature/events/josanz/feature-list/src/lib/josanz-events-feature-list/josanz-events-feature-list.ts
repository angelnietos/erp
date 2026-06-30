import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JosanzCatalogListComponent, type JosanzCatalogListConfig } from '@josanz-erp/josanz-ui';
import {
  countActiveEvents,
  mapEventToCatalogRow,
} from '@josanz-erp/josanz-ui';
import { JosanzEventApiService } from '../services/josanz-event-api.service';

@Component({
  selector: 'josanz-events-feature-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzEventsFeatureListComponent implements OnInit {
  private readonly eventApi = inject(JosanzEventApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  config: JosanzCatalogListConfig = {
    title: 'Eventos',
    primaryBtnLabel: 'Añadir Evento',
    statusColumnLabel: 'Estado',
    addRoute: '/events/new',
    detailRoute: '/events',
    filterOptions: ['Todos', 'Externos', 'Hoteles', 'Espacios'],
    summaryLine: {
      before: '0 eventos · ',
      emphasis: '0 activos',
      after: ' esta semana',
    },
    rows: [],
    features: {
      advancedFilters: false,
      statusFilters: false,
    },
    paginationTotal: 1,
    paginationVariant: 'numbered',
    pageSize: 10,
    statusBadgeStyle: 'outline',
  };

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('created') === '1') {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
    this.loadEvents();
  }

  private loadEvents(): void {
    this.eventApi.list().subscribe({
      next: (events) => {
        const rows = events.map((event, index) => mapEventToCatalogRow(event, index));
        const total = events.length;
        const pageSize = this.config.pageSize ?? 10;
        this.config = {
          ...this.config,
          rows,
          summaryLine: {
            before: `${total} eventos · `,
            emphasis: `${countActiveEvents(events)} activos`,
            after: ' esta semana',
          },
          paginationTotal: Math.max(1, Math.ceil(total / pageSize)),
        };
      },
    });
  }
}
