import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  JosanzCatalogListComponent,
  type JosanzCatalogListConfig,
  resolveEventStatusPillColor,
} from '@josanz-erp/josanz-ui';
import {
  countActiveEvents,
  mapEventToCatalogRow,
  CatalogThemeFacade,
} from '@josanz-erp/josanz-ui';
import { JosanzEventsFacade } from '../services/josanz-events.facade';
import { ClientsFacade } from '@josanz-erp/clients-data-access';

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

    <josanz-catalog-list
      #catalogList
      [config]="listConfig()"
      (rowStatusChange)="onRowStatusChange($event)"
    />
  `,
})
export class JosanzEventsFeatureListComponent implements OnInit {
  @ViewChild('catalogList') catalogList?: JosanzCatalogListComponent;

  private readonly eventsFacade = inject(JosanzEventsFacade);
  private readonly clientsFacade = inject(ClientsFacade);
  private readonly catalogTheme = inject(CatalogThemeFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly showSuccessToast = signal(false);
  readonly successToastMessage = signal('');

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
      statusBoard: true,
    },
    paginationVariant: 'numbered',
    pageSize: EVENT_LIST_PAGE_SIZE,
    statusBadgeStyle: 'outline',
  };

  readonly listConfig = computed<JosanzCatalogListConfig>(() => {
    const events = this.eventsFacade.events();
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
      loading: this.eventsFacade.loading() && events.length === 0,
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
    this.clientsFacade.prefetchClients();
    if (created || deleted) {
      this.eventsFacade.refreshEvents();
    } else {
      this.eventsFacade.loadEvents();
    }
  }

  dismissToast(): void {
    this.showSuccessToast.set(false);
  }

  onRowStatusChange(change: { id: string; status: string; previousStatus: string }): void {
    const event = this.eventsFacade.events().find((row) => row.id === change.id);
    if (!event || event.status === change.status) {
      return;
    }

    const theme = this.catalogTheme.mergedTheme();
    const previousColor = event.statusPillColor ?? null;
    const nextColor = resolveEventStatusPillColor(change.status, theme) ?? null;

    this.eventsFacade.patchEventStatus(change.id, change.status, nextColor);
    this.catalogList?.setStatusUpdateBusy(change.id, true);

    this.eventsFacade
      .updateEventStatus(change.id, change.status, nextColor)
      .pipe(finalize(() => this.catalogList?.setStatusUpdateBusy(change.id, false)))
      .subscribe({
        next: () => {
          this.successToastMessage.set('Estado guardado en el servidor');
          this.showSuccessToast.set(true);
        },
      error: () => {
        this.eventsFacade.patchEventStatus(change.id, change.previousStatus, previousColor);
        this.successToastMessage.set('No se pudo cambiar el estado. Inténtalo de nuevo.');
        this.showSuccessToast.set(true);
      },
    });
  }
}
