import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { take } from 'rxjs/operators';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import {
  UiButtonComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureFilterBarComponent,
  UiSelectComponent,
  UiFeatureAccessDeniedComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';
import { EventItem, EventsStateService } from '../services/events-state.service';

interface EventFilter {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: 'lib-events-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    UiButtonComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiFeatureFilterBarComponent,
    UiSelectComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiLoaderComponent,
  ],
  template: `
    <div class="events-container feature-page-shell">
      @if (!canAccess()) {
        <ui-feature-access-denied
          message="No tienes permiso para ver eventos."
          permissionHint="events.view"
        />
      } @else {
        <ui-feature-header
          title="Eventos"
          subtitle="Planificación y gestión de eventos corporativos"
          icon="calendar"
          actionLabel="NUEVO EVENTO"
          routerLink="/events/new"
        ></ui-feature-header>

        <ui-feature-stats>
          <ui-stat-card
            label="Total Eventos"
            [value]="eventsState.events().length.toString()"
            icon="layout"
            [accent]="true"
          >
          </ui-stat-card>
          <ui-stat-card
            label="Activos"
            [value]="activeEventsCount().toString()"
            icon="zap"
            [trend]="15"
          >
          </ui-stat-card>
          <ui-stat-card
            label="Próximo"
            [value]="nextEventDays().toString() + ' días'"
            icon="clock"
          >
          </ui-stat-card>
          <ui-stat-card
            label="Asistentes"
            [value]="totalAttendees().toString()"
            icon="users"
            [trend]="8"
          ></ui-stat-card>
        </ui-feature-stats>

        <ui-feature-filter-bar
          [appearance]="'feature'"
          [searchVariant]="'glass'"
          placeholder="Buscar eventos…"
          (searchChange)="onSearchChange($event)"
        >
          <div uiFeatureFilterStates class="events-filter-states">
            <ui-select
              label="ESTADO"
              [(ngModel)]="filters.status"
              name="status"
              [options]="statusOptions"
              (ngModelChange)="applyFilters()"
            />
            <ui-select
              label="TIPO"
              [(ngModel)]="filters.type"
              name="type"
              [options]="typeOptions"
              (ngModelChange)="applyFilters()"
            />
          </div>
          <ui-button
            variant="ghost"
            size="sm"
            [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
            (clicked)="toggleSort()"
          >
            Ordenar:
            {{
              sortField() === 'date'
                ? 'fecha'
                : sortField() === 'title'
                  ? 'título'
                  : 'estado'
            }}
          </ui-button>
        </ui-feature-filter-bar>

        @if (isLoading()) {
          <div class="feature-loader-wrap">
            <ui-loader message="Cargando eventos…"></ui-loader>
          </div>
        } @else if (!hasAnyEvents()) {
          <div class="feature-empty feature-empty--wide">
            <lucide-icon name="calendar" size="64" class="feature-empty__icon"></lucide-icon>
            <h3>Sin eventos</h3>
            <p>Aún no hay eventos. Crea el primero para empezar a planificar.</p>
            <ui-button variant="solid" routerLink="/events/new" icon="CirclePlus">Crear evento</ui-button>
          </div>
        } @else if (filterProducesNoResults()) {
          <div class="feature-empty feature-empty--wide">
            <lucide-icon name="search-x" size="64" class="feature-empty__icon"></lucide-icon>
            <h3>Sin resultados</h3>
            <p>Ningún evento coincide con la búsqueda o los filtros actuales.</p>
            <ui-button variant="ghost" size="sm" (clicked)="clearFiltersAndSearch()">
              Limpiar búsqueda y filtros
            </ui-button>
          </div>
        } @else {
          <ui-feature-grid>
            @for (event of filteredEvents(); track event.id) {
              <ui-feature-card
                [name]="event.title"
                [subtitle]="event.location || 'Sin ubicación'"
                [avatarInitials]="getInitials(event.title)"
                [avatarBackground]="getEventGradient(event.type)"
                [status]="event.status === 'active' ? 'active' : 'offline'"
                [badgeLabel]="getStatusText(event.status) | uppercase"
                [badgeVariant]="getStatusVariant(event.status)"
                [showEdit]="true"
                [showDuplicate]="true"
                [showDelete]="true"
                (cardClicked)="onRowClick(event)"
                (editClicked)="onEdit(event)"
                (duplicateClicked)="onDuplicate(event)"
                (deleteClicked)="onDelete(event)"
                [footerItems]="[
                  { icon: 'calendar', label: formatDate(event.date) },
                  { icon: 'users', label: event.attendees + '/' + event.capacity },
                ]"
              >
                <div footer-extra class="event-actions">
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="eye"
                    [routerLink]="['/events', event.id]"
                    title="Ver detalles"
                  ></ui-button>
                </div>
              </ui-feature-card>
            }
          </ui-feature-grid>
        }
      }
    </div>
  `,
  styles: [
    `
      .event-actions {
        display: flex;
        gap: 0.25rem;
      }

      .events-filter-states {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem 1.25rem;
        align-items: flex-end;
      }

      @media (max-width: 900px) {
        .quick-filters {
          width: 100%;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class EventsListComponent implements OnInit, OnDestroy, FilterableService<EventItem> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly eventsState = inject(EventsStateService);
  readonly canAccess = rbacAllows(this.authStore, 'events.view', 'events.manage');

  currentTheme = this.themeService.currentThemeData;

  expandedEvent = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = 10;
  isLoading = signal(true);

  filters: EventFilter = {
    search: '',
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
  };

  statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Activo', value: 'active' },
    { label: 'Completado', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' },
    { label: 'Borrador', value: 'draft' },
  ];

  typeOptions = [
    { label: 'Todos los tipos', value: '' },
    { label: 'Conferencia', value: 'conference' },
    { label: 'Taller', value: 'workshop' },
    { label: 'Reunión', value: 'meeting' },
    { label: 'Evento Social', value: 'social' },
    { label: 'Presentación', value: 'presentation' },
    { label: 'Otro', value: 'other' },
  ];

  sortField = signal<'date' | 'title' | 'status'>('date');
  sortDirection = signal<1 | -1>(-1);

  filteredEvents = signal<EventItem[]>([]);

  readonly hasAnyEvents = computed(() => this.eventsState.events().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyEvents() && this.filteredEvents().length === 0,
  );

  activeEventsCount = computed(
    () => this.eventsState.events().filter((e: EventItem) => e.status === 'active').length,
  );

  totalAttendees = computed(() =>
    this.eventsState.events().reduce((sum: number, e: EventItem) => sum + e.attendees, 0),
  );

  nextEventDays = computed(() => {
    const now = new Date();
    const futureEvents = this.eventsState
      .events()
      .filter(
        (event: EventItem) => new Date(event.date) >= now && event.status === 'active',
      )
      .sort(
        (a: EventItem, b: EventItem) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

    if (futureEvents.length === 0) {
      return 0;
    }

    const nextEvent = futureEvents[0];
    const diffTime = new Date(nextEvent.date).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });

  constructor() {
    effect(() => {
      const q = this.masterFilter.query();
      if (this.filters.search === q) {
        return;
      }
      this.filters = { ...this.filters, search: q };
      this.applyFilters();
    });

    effect(() => {
      this.eventsState.events();
      this.applyFilters();
    });
  }

  onRowClick(event: EventItem) {
    void this.router.navigate(['/events', event.id]);
  }

  onEdit(event: EventItem) {
    void this.router.navigate(['/events', event.id, 'edit']);
  }

  onDuplicate(event: EventItem) {
    this.eventsState.duplicate(event);
    this.applyFilters();
  }

  onDelete(event: EventItem) {
    if (confirm(`¿Estás seguro de que deseas eliminar el evento ${event.title}?`)) {
      this.eventsState.delete(event.id);
      this.applyFilters();
    }
  }

  getInitials(title: string): string {
    return title.slice(0, 2).toUpperCase();
  }

  getEventGradient(type: string): string {
    switch (type) {
      case 'conference':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'workshop':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'meeting':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'social':
        return 'linear-gradient(135deg, #ec4899, #be185d)';
      case 'presentation':
        return 'linear-gradient(135deg, #6366f1, #4338ca)';
      default:
        return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.route.queryParamMap.pipe(take(1)).subscribe((q) => {
      const text = q.get('search')?.trim();
      if (text) {
        this.filters.search = text;
        this.masterFilter.search(text);
        this.applyFilters();
      } else {
        this.applyFilters();
      }
    });
    queueMicrotask(() => {
      window.setTimeout(() => this.isLoading.set(false), 120);
    });
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearchChange(term: string) {
    this.filters.search = term;
    this.masterFilter.search(term);
    this.applyFilters();
  }

  clearFiltersAndSearch() {
    this.filters = {
      search: '',
      status: '',
      type: '',
      dateFrom: '',
      dateTo: '',
    };
    this.masterFilter.search('');
    this.applyFilters();
  }

  filter(query: string): Observable<EventItem[]> {
    const term = query.toLowerCase();
    const matches = this.eventsState
      .events()
      .filter(
        (e: EventItem) =>
          e.title.toLowerCase().includes(term) ||
          (e.description ?? '').toLowerCase().includes(term) ||
          (e.organizer ?? '').toLowerCase().includes(term),
      );
    return of(matches);
  }

  applyFilters() {
    let filtered = [...this.eventsState.events()];

    if (this.filters.search) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (event: EventItem) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.organizer?.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm),
      );
    }

    if (this.filters.status) {
      filtered = filtered.filter((event: EventItem) => event.status === this.filters.status);
    }

    if (this.filters.type) {
      filtered = filtered.filter((event: EventItem) => event.type === this.filters.type);
    }

    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter((event: EventItem) => new Date(event.date) >= fromDate);
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((event: EventItem) => new Date(event.date) <= toDate);
    }

    const field = this.sortField();
    const dir = this.sortDirection();
    filtered.sort((a: EventItem, b: EventItem) => {
      let cmp = 0;
      if (field === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (field === 'title') {
        cmp = a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
      } else {
        cmp = a.status.localeCompare(b.status, 'es');
      }
      return cmp * dir;
    });

    this.filteredEvents.set(filtered);
    this.currentPage.set(1);
  }

  toggleSort() {
    if (this.sortField() === 'date') {
      this.sortField.set('title');
      this.sortDirection.set(1);
    } else if (this.sortField() === 'title') {
      this.sortField.set('status');
      this.sortDirection.set(1);
    } else {
      this.sortField.set('date');
      this.sortDirection.set(-1);
    }
    this.applyFilters();
  }

  toggleEventExpansion(eventId: string) {
    this.expandedEvent.set(this.expandedEvent() === eventId ? null : eventId);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  get totalPages() {
    return () => Math.ceil(this.filteredEvents().length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getStatusVariant(
    status: string,
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusText(status: string) {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
