import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, JosanzCatalogListComponent],
  template: `
    @if (showSuccessToast()) {
    <div class="josanz-client-success-toast" role="status">
      <span aria-hidden="true">✓</span>
      {{ successToastMessage() }}
      <button
        type="button"
        class="josanz-client-success-toast__close"
        aria-label="Cerrar"
        (click)="dismissToast()"
      >
        ×
      </button>
    </div>
    }

    <josanz-catalog-list [config]="listConfig()" />
  `,
})
export class JosanzEventsFeatureListComponent implements OnInit {
  private readonly eventApi = inject(JosanzEventApiService);
  private readonly catalogTheme = inject(CatalogThemeFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly showSuccessToast = signal(false);
  readonly successToastMessage = signal('');

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
    const created = this.route.snapshot.queryParamMap.get('created') === '1';
    const deleted = this.route.snapshot.queryParamMap.get('deleted') === '1';

    if (created || deleted) {
      this.successToastMessage.set(
        created ? 'Evento creado correctamente' : 'Evento eliminado correctamente',
      );
      this.showSuccessToast.set(true);
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

  dismissToast(): void {
    this.showSuccessToast.set(false);
  }
}
