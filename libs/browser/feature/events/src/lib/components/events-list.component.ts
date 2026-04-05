import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiInputComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService } from '@josanz-erp/shared-data-access';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled';
  attendees: number;
}

@Component({
  selector: 'lib-events-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UiCardComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <header
        class="page-header"
        [style.border-bottom-color]="currentTheme().primary + '33'"
      >
        <div class="header-breadcrumb">
          <h1
            class="page-title text-uppercase glow-text"
            [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'"
          >
            Eventos
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary"
              >GESTIÓN</span
            >
            <span class="separator">/</span>
            <span>EVENTOS</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button
            variant="primary"
            [routerLink]="['/events/new']"
            class="create-button"
          >
            <lucide-icon [img]="PlusIcon" size="16"></lucide-icon>
            Nuevo Evento
          </ui-josanz-button>
        </div>
      </header>

      <!-- Search and Filters -->
      <div class="filters-section">
        <ui-josanz-card>
          <div class="filters-content">
            <div class="search-box">
              <ui-josanz-input
                placeholder="Buscar eventos..."
                [formControl]="searchControl"
              >
                <lucide-icon
                  [img]="SearchIcon"
                  size="16"
                  slot="prefix"
                ></lucide-icon>
              </ui-josanz-input>
            </div>
            <div class="filter-buttons">
              <ui-josanz-button variant="ghost" size="sm">
                <lucide-icon [img]="FilterIcon" size="16"></lucide-icon>
                Filtros
              </ui-josanz-button>
            </div>
          </div>
        </ui-josanz-card>
      </div>

      <!-- Events Grid -->
      <div class="events-grid">
        @for (event of filteredEvents(); track event.id) {
          <ui-josanz-card
            class="event-card"
            [routerLink]="['/events', event.id]"
          >
            <div class="event-header">
              <div class="event-info">
                <h3 class="event-title">{{ event.title }}</h3>
                <p class="event-description">{{ event.description }}</p>
              </div>
              <div class="event-status">
                <ui-josanz-badge [variant]="getStatusVariant(event.status)">
                  {{ getStatusText(event.status) }}
                </ui-josanz-badge>
              </div>
            </div>

            <div class="event-details">
              <div class="event-detail">
                <lucide-icon [img]="CalendarIcon" size="16"></lucide-icon>
                <span>{{ event.date }} - {{ event.time }}</span>
              </div>
              <div class="event-detail">
                <lucide-icon [img]="UsersIcon" size="16"></lucide-icon>
                <span>{{ event.attendees }} asistentes</span>
              </div>
              @if (event.location) {
                <div class="event-detail">
                  <lucide-icon [img]="MapPinIcon" size="16"></lucide-icon>
                  <span>{{ event.location }}</span>
                </div>
              }
            </div>

            <div class="event-actions">
              <ui-josanz-button
                variant="ghost"
                size="sm"
                [routerLink]="['/events', event.id, 'edit']"
                (click)="$event.stopPropagation()"
              >
                <lucide-icon [img]="EditIcon" size="14"></lucide-icon>
              </ui-josanz-button>
              <ui-josanz-button
                variant="ghost"
                size="sm"
                class="danger"
                (click)="$event.stopPropagation()"
              >
                <lucide-icon [img]="Trash2Icon" size="14"></lucide-icon>
              </ui-josanz-button>
            </div>
          </ui-josanz-card>
        }
      </div>

      @if (filteredEvents().length === 0) {
        <div class="empty-state">
          <ui-josanz-card>
            <div class="empty-content">
              <lucide-icon [img]="CalendarIcon" size="48"></lucide-icon>
              <h3>No hay eventos</h3>
              <p>No se encontraron eventos que coincidan con tu búsqueda.</p>
              <ui-josanz-button
                variant="primary"
                [routerLink]="['/events/new']"
              >
                <lucide-icon [img]="PlusIcon" size="16"></lucide-icon>
                Crear primer evento
              </ui-josanz-button>
            </div>
          </ui-josanz-card>
        </div>
      }
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

      .glow-text {
        font-size: 1.6rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
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

      .breadcrumb .active {
        color: var(--primary);
      }

      .breadcrumb .separator {
        opacity: 0.5;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .create-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .filters-section {
        margin-bottom: 2rem;
      }

      .filters-content {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .search-box {
        flex: 1;
        max-width: 400px;
      }

      .events-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
      }

      .event-card {
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 1.5rem;
      }

      .event-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .event-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .event-info {
        flex: 1;
      }

      .event-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #fff;
      }

      .event-description {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .event-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .event-detail {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--text-muted);
      }

      .event-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      .event-actions button.danger:hover {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .empty-state {
        text-align: center;
        margin-top: 4rem;
      }

      .empty-content {
        padding: 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .empty-content h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #fff;
      }

      .empty-content p {
        margin: 0;
        color: var(--text-muted);
      }

      @media (max-width: 768px) {
        .events-grid {
          grid-template-columns: 1fr;
        }

        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .filters-content {
          flex-direction: column;
          align-items: stretch;
        }

        .search-box {
          max-width: none;
        }
      }
    `,
  ],
})
export class EventsListComponent implements OnInit {
  public readonly themeService = inject(ThemeService);

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

  searchControl = new FormControl('');

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
    },
  ]);

  filteredEvents = signal<Event[]>([]);

  ngOnInit() {
    // Set initial filtered events
    this.filteredEvents.set(this.events());

    // Subscribe to search control changes
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        const filtered = this.events().filter(
          (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        this.filteredEvents.set(filtered);
      } else {
        this.filteredEvents.set(this.events());
      }
    });
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
