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
import {
  LucideAngularModule,
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  MapPin,
  Eye,
  History,
  TrendingUp,
  Activity,
  Clock,
  Layout,
  Zap,
  CirclePlus
} from 'lucide-angular';
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
} from '@josanz-erp/shared-ui-kit';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled' | 'draft';
  attendees: number;
  capacity: number;
  type:
    | 'conference'
    | 'workshop'
    | 'meeting'
    | 'social'
    | 'presentation'
    | 'other';
  organizer: string;
  cost: number;
  createdAt: string;
}

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
  ],
  template: `
    <div class="events-container">
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
          [value]="events().length.toString()" 
          icon="layout" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Activos" 
          [value]="activeEventsCount().toString()" 
          icon="zap" 
          [trend]="15">
        </ui-stat-card>
        <ui-stat-card 
          label="Próximo" 
          [value]="nextEventDays().toString() + ' días'" 
          icon="clock">
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
          />
          <ui-select
            label="TIPO"
            [(ngModel)]="filters.type"
            name="type"
            [options]="typeOptions"
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
              { icon: 'users', label: event.attendees + '/' + event.capacity }
            ]"
          >
             <div footer-extra class="event-actions">
                <ui-button variant="ghost" size="sm" icon="eye" [routerLink]="['/events', event.id]" title="Ver detalles"></ui-button>
             </div>
          </ui-feature-card>
        } @empty {
          <div class="empty-state">
            <lucide-icon name="calendar" size="64" class="empty-icon"></lucide-icon>
            <h3>No hay eventos</h3>
            <p>Parece que no hay nada programado para los filtros seleccionados.</p>
            <ui-button variant="solid" routerLink="/events/new" icon="CirclePlus">Crear evento</ui-button>
          </div>
        }
      </ui-feature-grid>
      }
    </div>
  `,
  styles: [`
    .events-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .event-actions { display: flex; gap: 0.25rem; }

    .events-filter-states {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 1.25rem;
      align-items: flex-end;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      text-align: center;
      background: var(--surface);
      border-radius: 20px;
      border: 2px dashed var(--border-soft);
    }
    .empty-icon { color: var(--text-muted); opacity: 0.3; margin-bottom: 1.5rem; }

    @media (max-width: 900px) {
       .quick-filters { width: 100%; flex-direction: column; }
    }
  `],
})
export class EventsListComponent implements OnInit, OnDestroy, FilterableService<Event> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'events.view', 'events.manage');

  currentTheme = this.themeService.currentThemeData;

  expandedEvent = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = 10;

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

  events = signal<Event[]>([]);
  filteredEvents = signal<Event[]>([]);

  activeEventsCount = computed(
    () => this.events().filter((e: Event) => e.status === 'active').length,
  );

  totalAttendees = computed(() =>
    this.events().reduce((sum: number, e: Event) => sum + e.attendees, 0),
  );

  nextEventDays = computed(() => {
    const now = new Date();
    const futureEvents = this.events()
      .filter(
        (event: Event) => new Date(event.date) >= now && event.status === 'active',
      )
      .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (futureEvents.length === 0) return 0;

    const nextEvent = futureEvents[0];
    const diffTime = new Date(nextEvent.date).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });

  initialEvents: Event[] = [
    {
      id: 'ev-concierto-2026',
      title: 'Concierto Verano 2026',
      description: 'Montaje audio, iluminación y streaming para gira de verano',
      date: '2026-07-18',
      time: '21:00',
      location: 'Auditorio Municipal',
      status: 'active',
      attendees: 0,
      capacity: 5000,
      type: 'other',
      organizer: 'Producción Josanz',
      cost: 0,
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: '1',
      title: 'Evento Corporativo ABC',
      description: 'Evento anual de networking y presentación de productos',
      date: '2024-04-15',
      time: '10:00',
      location: 'Sala de Conferencias Principal',
      status: 'active',
      attendees: 150,
      capacity: 200,
      type: 'conference',
      organizer: 'María González',
      cost: 0,
      createdAt: '2024-03-01T09:00:00Z',
    },
    {
      id: '2',
      title: 'Taller de Desarrollo Profesional',
      description:
        'Sesión de formación para empleados sobre nuevas tecnologías',
      date: '2024-04-20',
      time: '14:30',
      location: 'Sala de Formación',
      status: 'active',
      attendees: 25,
      capacity: 30,
      type: 'workshop',
      organizer: 'Carlos Rodríguez',
      cost: 50,
      createdAt: '2024-03-05T14:20:00Z',
    },
    {
      id: '3',
      title: 'Presentación de Producto XYZ',
      description: 'Lanzamiento del nuevo producto de la compañía',
      date: '2024-03-28',
      time: '16:00',
      location: 'Auditorio Principal',
      status: 'completed',
      attendees: 200,
      capacity: 250,
      type: 'presentation',
      organizer: 'Ana López',
      cost: 0,
      createdAt: '2024-02-15T11:30:00Z',
    },
    {
      id: '4',
      title: 'Reunión Trimestral de Equipo',
      description:
        'Revisión de objetivos y planificación del próximo trimestre',
      date: '2024-04-10',
      time: '09:00',
      location: 'Sala de Juntas Ejecutiva',
      status: 'active',
      attendees: 12,
      capacity: 15,
      type: 'meeting',
      organizer: 'Director General',
      cost: 0,
      createdAt: '2024-03-20T16:45:00Z',
    },
    {
      id: '5',
      title: 'Cena de Navidad Corporativa',
      description: 'Evento social de fin de año para empleados y familias',
      date: '2024-12-20',
      time: '20:00',
      location: 'Hotel Gran Palacio',
      status: 'draft',
      attendees: 0,
      capacity: 150,
      type: 'social',
      organizer: 'RRHH',
      cost: 75,
      createdAt: '2024-03-10T10:15:00Z',
    },
  ];

  onRowClick(event: Event) {
    this.router.navigate(['/events', event.id]);
  }

  onEdit(event: Event) {
    this.router.navigate(['/events', event.id, 'edit']);
  }

  onDuplicate(event: Event) {
    const newEvent: Event = {
      ...event,
      id: Math.random().toString(36).substring(7),
      title: `${event.title} (COPIA)`,
      createdAt: new Date().toISOString()
    };
    this.events.update(list => [newEvent, ...list]);
    this.applyFilters();
  }

  onDelete(event: Event) {
    if (confirm(`¿Estás seguro de que deseas eliminar el evento ${event.title}?`)) {
      this.events.update(list => list.filter(e => e.id !== event.id));
      this.applyFilters();
    }
  }

  getInitials(title: string): string {
    return title.slice(0, 2).toUpperCase();
  }

  constructor() {
    // Sincronizar búsqueda local con MasterFilter (workflows: navigateAndFilter → search)
    effect(() => {
      const q = this.masterFilter.query();
      if (this.filters.search === q) {
        return;
      }
      this.filters = { ...this.filters, search: q };
      this.applyFilters();
    });
  }

  getEventGradient(type: string): string {
    switch (type) {
      case 'conference': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'workshop': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'meeting': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'social': return 'linear-gradient(135deg, #ec4899, #be185d)';
      case 'presentation': return 'linear-gradient(135deg, #6366f1, #4338ca)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  ngOnInit() {
    this.events.set(this.initialEvents);
    this.masterFilter.registerProvider(this);
    this.route.queryParamMap.pipe(take(1)).subscribe((q: any) => {
      const text = q.get('search')?.trim();
      if (text) {
        this.filters.search = text;
        this.applyFilters();
      } else {
        this.filteredEvents.set(this.events());
      }
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

  filter(query: string): Observable<Event[]> {
    const term = query.toLowerCase();
    const matches = this.events().filter((e: Event) => 
      e.title.toLowerCase().includes(term) || 
      (e.description ?? '').toLowerCase().includes(term) || 
      (e.organizer ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  applyFilters() {
    let filtered = [...this.events()];

    if (this.filters.search) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (event: Event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.organizer?.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm),
      );
    }

    if (this.filters.status) {
      filtered = filtered.filter(
        (event: Event) => event.status === this.filters.status,
      );
    }

    if (this.filters.type) {
      filtered = filtered.filter((event: Event) => event.type === this.filters.type);
    }

    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter((event: Event) => new Date(event.date) >= fromDate);
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((event: Event) => new Date(event.date) <= toDate);
    }

    const field = this.sortField();
    const dir = this.sortDirection();
    filtered.sort((a: Event, b: Event) => {
      let cmp = 0;
      if (field === 'date') {
        cmp =
          new Date(a.date).getTime() - new Date(b.date).getTime();
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

  clearFilters() {
    this.filters = {
      search: '',
      status: '',
      type: '',
      dateFrom: '',
      dateTo: '',
    };
    this.applyFilters();
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

  getStatusVariant(status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
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
