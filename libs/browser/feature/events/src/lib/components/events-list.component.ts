import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiInputComponent,
  UiSelectComponent,
  UiStatCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

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
    UiCardComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiStatCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div
      class="page-container animate-fade-in"
      [class.perf-optimized]="pluginStore.highPerformanceMode()"
    >
      <header
        class="page-header"
        [style.border-bottom-color]="currentTheme().primary + '33'"
      >
        <div class="header-breadcrumb">
          <h1
            class="page-title text-uppercase glow-text"
            [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'"
          >
            Sistema de Eventos
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary"
              >GESTIÓN Y PLANIFICACIÓN</span
            >
            <span class="separator">/</span>
            <span>EVENTOS CORPORATIVOS</span>
          </div>
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card
          label="Total Eventos"
          [value]="events().length.toString()"
          icon="calendar"
          [accent]="true"
        >
        </ui-josanz-stat-card>
        <ui-josanz-stat-card
          label="Eventos Activos"
          [value]="activeEventsCount().toString()"
          icon="activity"
          [trend]="15"
        >
        </ui-josanz-stat-card>
        <ui-josanz-stat-card
          label="Próximo Evento"
          [value]="nextEventDays().toString() + ' días'"
          icon="clock"
        >
        </ui-josanz-stat-card>
        <ui-josanz-stat-card
          label="Asistentes Totales"
          [value]="totalAttendees().toString()"
          icon="users"
          [trend]="8"
        >
        </ui-josanz-stat-card>
      </div>

      <div class="events-content">
        <!-- Filters -->
        <ui-josanz-card class="filters-card">
          <div class="filters-header">
            <h2>Filtros de Búsqueda Avanzada</h2>
            <ui-josanz-button
              variant="ghost"
              size="sm"
              icon="filter"
              (click)="clearFilters()"
            >
              Limpiar
            </ui-josanz-button>
          </div>

          <div class="filters-grid">
            <ui-josanz-input
              label="Buscar"
              [(ngModel)]="filters.search"
              name="search"
              placeholder="Título, descripción, organizador..."
              icon="search"
            />

            <ui-josanz-select
              label="Estado"
              [(ngModel)]="filters.status"
              name="status"
              [options]="statusOptions"
            />

            <ui-josanz-select
              label="Tipo"
              [(ngModel)]="filters.type"
              name="type"
              [options]="typeOptions"
            />

            <ui-josanz-input
              label="Fecha Desde"
              type="date"
              [(ngModel)]="filters.dateFrom"
              name="dateFrom"
            />

            <ui-josanz-input
              label="Fecha Hasta"
              type="date"
              [(ngModel)]="filters.dateTo"
              name="dateTo"
            />

            <div class="filter-actions">
              <ui-josanz-button
                variant="primary"
                icon="search"
                (click)="applyFilters()"
              >
                Aplicar Filtros
              </ui-josanz-button>
              <ui-josanz-button
                variant="primary"
                [routerLink]="['/events/new']"
              >
                <lucide-icon [img]="PlusIcon" size="16"></lucide-icon>
                Nuevo Evento
              </ui-josanz-button>
            </div>
          </div>
        </ui-josanz-card>

        <!-- Events List -->
        <ui-josanz-card class="events-card">
          <div class="events-header">
            <h2>Eventos Planificados</h2>
            <span class="events-count"
              >{{ filteredEvents().length }} eventos encontrados</span
            >
          </div>

          <div class="events-list">
            @for (event of paginatedEvents(); track event.id) {
              <div
                class="event-item"
                [class.expanded]="expandedEvent() === event.id"
              >
                <div
                  class="event-summary"
                  (click)="toggleEventExpansion(event.id)"
                  (keydown.enter)="toggleEventExpansion(event.id)"
                  (keydown.space)="
                    toggleEventExpansion(event.id); $event.preventDefault()
                  "
                  tabindex="0"
                >
                  <div class="event-icon">
                    <lucide-icon
                      [img]="getEventIcon(event.type)"
                      size="20"
                    ></lucide-icon>
                  </div>

                  <div class="event-info">
                    <div class="event-primary">
                      <span class="event-title">{{ event.title }}</span>
                      <span class="event-type">{{
                        getTypeText(event.type)
                      }}</span>
                      <span class="event-organizer">
                        @if (event.organizer) {
                          por {{ event.organizer }}
                        }
                      </span>
                    </div>
                    <div class="event-meta">
                      <span class="event-date">
                        <lucide-icon
                          [img]="CalendarIcon"
                          size="14"
                        ></lucide-icon>
                        {{ formatDate(event.date) }} - {{ event.time }}
                      </span>
                      <span class="event-attendees">
                        <lucide-icon [img]="UsersIcon" size="14"></lucide-icon>
                        {{ event.attendees }}/{{ event.capacity }} asistentes
                      </span>
                      <ui-josanz-badge
                        [variant]="getStatusVariant(event.status)"
                      >
                        {{ getStatusText(event.status) }}
                      </ui-josanz-badge>
                    </div>
                  </div>

                  <div class="event-toggle">
                    <lucide-icon
                      [img]="HistoryIcon"
                      size="16"
                      [class.rotated]="expandedEvent() === event.id"
                    ></lucide-icon>
                  </div>
                </div>

                @if (expandedEvent() === event.id) {
                  <div class="event-details">
                    @if (event.description) {
                      <div class="details-section">
                        <h4>Descripción</h4>
                        <p>{{ event.description }}</p>
                      </div>
                    }

                    <div class="details-section">
                      <h4>Información del Evento</h4>
                      <div class="details-grid">
                        <div class="detail-item">
                          <span class="detail-label">Ubicación:</span>
                          <span class="detail-value">{{
                            event.location || 'No especificada'
                          }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">Costo:</span>
                          <span class="detail-value">{{
                            event.cost ? '€' + event.cost : 'Gratuito'
                          }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">Capacidad:</span>
                          <span class="detail-value">{{
                            event.capacity || 'Sin límite'
                          }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">Creado:</span>
                          <span class="detail-value">{{
                            formatCreatedDate(event.createdAt)
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="event-actions">
                      <ui-josanz-button
                        variant="ghost"
                        size="sm"
                        [routerLink]="['/events', event.id]"
                        (click)="$event.stopPropagation()"
                      >
                        <lucide-icon [img]="EyeIcon" size="14"></lucide-icon>
                        Ver Detalles
                      </ui-josanz-button>
                      <ui-josanz-button
                        variant="ghost"
                        size="sm"
                        [routerLink]="['/events', event.id, 'edit']"
                        (click)="$event.stopPropagation()"
                      >
                        <lucide-icon [img]="EditIcon" size="14"></lucide-icon>
                        Editar
                      </ui-josanz-button>
                      <ui-josanz-button
                        variant="ghost"
                        size="sm"
                        class="danger"
                        (click)="$event.stopPropagation()"
                      >
                        <lucide-icon [img]="Trash2Icon" size="14"></lucide-icon>
                        Eliminar
                      </ui-josanz-button>
                    </div>
                  </div>
                }
              </div>
            }

            @if (paginatedEvents().length === 0) {
              <div class="no-events">
                <lucide-icon [img]="CalendarIcon" size="48"></lucide-icon>
                <h3>No se encontraron eventos</h3>
                <p>No hay eventos que coincidan con los filtros aplicados.</p>
                <ui-josanz-button
                  variant="primary"
                  [routerLink]="['/events/new']"
                >
                  <lucide-icon [img]="PlusIcon" size="16"></lucide-icon>
                  Crear Nuevo Evento
                </ui-josanz-button>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <ui-josanz-button
                variant="ghost"
                size="sm"
                [disabled]="currentPage() === 1"
                (click)="goToPage(currentPage() - 1)"
              >
                Anterior
              </ui-josanz-button>

              <span class="page-info">
                Página {{ currentPage() }} de {{ totalPages() }}
              </span>

              <ui-josanz-button
                variant="ghost"
                size="sm"
                [disabled]="currentPage() === totalPages()"
                (click)="goToPage(currentPage() + 1)"
              >
                Siguiente
              </ui-josanz-button>
            </div>
          }
        </ui-josanz-card>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .header-breadcrumb {
        flex: 1;
      }

      .page-title {
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
        font-weight: 700;
        letter-spacing: 0.025em;
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        margin-top: 0.5rem;
      }

      .separator {
        opacity: 0.5;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .events-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .filters-card {
        padding: 1.5rem;
      }

      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .filters-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .filter-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      .events-card {
        padding: 1.5rem;
      }

      .events-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .events-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .events-count {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .events-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .event-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        overflow: hidden;
      }

      .event-summary {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .event-summary:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .event-icon {
        padding: 0.5rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 0.375rem;
        color: var(--primary);
        flex-shrink: 0;
      }

      .event-info {
        flex: 1;
      }

      .event-primary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
      }

      .event-title {
        font-weight: 600;
        color: var(--text-primary);
      }

      .event-type {
        color: var(--accent);
        font-weight: 500;
        font-size: 0.875rem;
      }

      .event-organizer {
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-style: italic;
      }

      .event-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .event-date,
      .event-attendees {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .event-toggle {
        transition: transform 0.2s;
      }

      .event-toggle .rotated {
        transform: rotate(180deg);
      }

      .event-details {
        padding: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
      }

      .details-section {
        margin-bottom: 1rem;
      }

      .details-section h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .detail-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .detail-value {
        font-size: 0.875rem;
        color: var(--text-primary);
      }

      .event-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 1rem;
      }

      .no-events {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
      }

      .no-events h3 {
        margin: 1rem 0 0 0;
        font-size: 1.125rem;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .page-info {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .text-uppercase {
        text-transform: uppercase;
      }

      .glow-text {
        font-size: 1.6rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
      }

      @media (max-width: 768px) {
        .filters-grid {
          grid-template-columns: 1fr;
        }

        .event-primary {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }

        .event-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .details-grid {
          grid-template-columns: 1fr;
        }

        .pagination {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class EventsListComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  readonly CalendarIcon = Calendar;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly MoreVerticalIcon = MoreVertical;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly UsersIcon = Users;
  readonly MapPinIcon = MapPin;
  readonly HistoryIcon = History;
  readonly TrendingUpIcon = TrendingUp;
  readonly ActivityIcon = Activity;
  readonly ClockIcon = Clock;
  readonly SettingsIcon = 'settings';
  readonly PartyPopperIcon = 'party-popper';
  readonly PresentationIcon = 'presentation';
  readonly EyeIcon = Eye;

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

  activeEventsCount = computed(() => {
    return this.events().filter((event) => event.status === 'active').length;
  });

  nextEventDays = computed(() => {
    const today = new Date();
    const futureEvents = this.events()
      .filter(
        (event) => new Date(event.date) >= today && event.status === 'active',
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (futureEvents.length === 0) return 0;

    const nextEvent = futureEvents[0];
    const diffTime = new Date(nextEvent.date).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });

  totalAttendees = computed(() => {
    return this.events().reduce((total, event) => total + event.attendees, 0);
  });

  events = signal<Event[]>([
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
  ]);

  filteredEvents = signal<Event[]>([]);

  ngOnInit() {
    // Set initial filtered events
    this.filteredEvents.set(this.events());
  }

  applyFilters() {
    let filtered = [...this.events()];

    if (this.filters.search) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.organizer?.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm),
      );
    }

    if (this.filters.status) {
      filtered = filtered.filter(
        (event) => event.status === this.filters.status,
      );
    }

    if (this.filters.type) {
      filtered = filtered.filter((event) => event.type === this.filters.type);
    }

    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter((event) => new Date(event.date) >= fromDate);
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((event) => new Date(event.date) <= toDate);
    }

    // Sort by date (most recent first)
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

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

  toggleEventExpansion(eventId: string) {
    this.expandedEvent.set(this.expandedEvent() === eventId ? null : eventId);
  }

  getEventIcon(type: string) {
    switch (type) {
      case 'conference':
        return this.UsersIcon;
      case 'workshop':
        return this.UsersIcon;
      case 'meeting':
        return this.CalendarIcon;
      case 'social':
        return this.UsersIcon;
      case 'presentation':
        return this.UsersIcon;
      default:
        return this.CalendarIcon;
    }
  }

  getTypeText(type: string): string {
    const texts: Record<string, string> = {
      conference: 'Conferencia',
      workshop: 'Taller',
      meeting: 'Reunión',
      social: 'Social',
      presentation: 'Presentación',
      other: 'Otro',
    };
    return texts[type] || type;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  formatCreatedDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  get paginatedEvents() {
    return () => {
      const start = (this.currentPage() - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredEvents().slice(start, end);
    };
  }

  get totalPages() {
    return () => Math.ceil(this.filteredEvents().length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getStatusVariant(status: string) {
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
