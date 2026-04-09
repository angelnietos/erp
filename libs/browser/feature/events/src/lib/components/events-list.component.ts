import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiInputComponent,
  UiSelectComponent,
  UiStatCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { take } from 'rxjs/operators';
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';

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
      <div class="hero-section">
        <div class="hero-bg-pattern"></div>
        <div class="hero-gradient-overlay"></div>
        <header
          class="page-header"
          [style.border-bottom-color]="currentTheme().primary + '33'"
        >
          <div class="header-breadcrumb">
            <div class="hero-glow-effect"></div>
            <h1 class="page-title text-uppercase">
              <span class="title-icon">🎯</span>
              Sistema de Eventos
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary"
                ><span class="breadcrumb-icon">⚡</span>GESTIÓN Y
                PLANIFICACIÓN</span
              >
              <span class="separator">/</span>
              <span
                ><span class="breadcrumb-icon">🎪</span>EVENTOS
                CORPORATIVOS</span
              >
            </div>
          </div>
        </header>
      </div>

      <div class="stats-row gaming-stats">
        <ui-stat-card
          label="Total Eventos"
          [value]="events().length.toString()"
          icon="calendar"
          [accent]="true"
          class="stat-card-animated"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Eventos Activos"
          [value]="activeEventsCount().toString()"
          icon="activity"
          [trend]="15"
          class="stat-card-animated"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Próximo Evento"
          [value]="nextEventDays().toString() + ' días'"
          icon="clock"
          class="stat-card-animated"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Asistentes Totales"
          [value]="totalAttendees().toString()"
          icon="users"
          [trend]="8"
          class="stat-card-animated"
        >
        </ui-stat-card>
      </div>

      <div class="events-content">
        <!-- Filters -->
        <ui-card class="filters-card gaming-card">
          <div class="filters-header">
            <div class="filters-title-section">
              <span class="filters-icon">🔍</span>
              <h2>Filtros de Búsqueda Avanzada</h2>
            </div>
            <ui-button
              variant="ghost"
              size="sm"
              icon="filter"
              (click)="clearFilters()"
              class="clear-filters-btn"
            >
              <span class="btn-icon">🗑️</span>
              Limpiar
            </ui-button>
          </div>

          <div class="filters-grid">
            <ui-input
              label="Buscar"
              [(ngModel)]="filters.search"
              (ngModelChange)="onSearchChange($event)"
              name="search"
              placeholder="Título, descripción, organizador..."
              icon="search"
            />

            <ui-select
              label="Estado"
              [(ngModel)]="filters.status"
              name="status"
              [options]="statusOptions"
            />

            <ui-select
              label="Tipo"
              [(ngModel)]="filters.type"
              name="type"
              [options]="typeOptions"
            />

            <ui-input
              label="Fecha Desde"
              type="date"
              [(ngModel)]="filters.dateFrom"
              name="dateFrom"
            />

            <ui-input
              label="Fecha Hasta"
              type="date"
              [(ngModel)]="filters.dateTo"
              name="dateTo"
            />

            <div class="filter-actions">
              <ui-button
                variant="primary"
                icon="search"
                (click)="applyFilters()"
              >
                Aplicar Filtros
              </ui-button>
              <ui-button
                variant="primary"
                [routerLink]="['/events/new']"
              >
                <lucide-icon [img]="PlusIcon" size="16"></lucide-icon>
                Nuevo Evento
              </ui-button>
            </div>
          </div>
        </ui-card>

        <!-- Events List -->
        <ui-card class="events-card gaming-card">
          <div class="events-header">
            <div class="events-title-section">
              <span class="events-icon">📋</span>
              <h2>Eventos Planificados</h2>
            </div>
            <span class="events-count gaming-badge"
              >{{ filteredEvents().length }}
              <span class="count-icon">🎯</span> eventos encontrados</span
            >
          </div>

          <div class="events-list">
            @for (event of paginatedEvents(); track event.id) {
              <div
                class="event-item gaming-event-item"
                [class.expanded]="expandedEvent() === event.id"
                [class]="getEventStatusClass(event.status)"
              >
                <div
                  class="event-summary gaming-summary"
                  (click)="toggleEventExpansion(event.id)"
                  (keydown.enter)="toggleEventExpansion(event.id)"
                  (keydown.space)="
                    toggleEventExpansion(event.id); $event.preventDefault()
                  "
                  tabindex="0"
                >
                  <div
                    class="event-icon gaming-icon"
                    [class]="getEventTypeClass(event.type)"
                  >
                    <lucide-icon
                      [img]="getEventIcon(event.type)"
                      size="20"
                    ></lucide-icon>
                    <div class="icon-glow"></div>
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
                      <ui-badge
                        [variant]="getStatusVariant(event.status)"
                      >
                        {{ getStatusText(event.status) }}
                      </ui-badge>
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
                        <p class="text-friendly">{{ event.description }}</p>
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

                    <div class="event-actions gaming-actions">
                      <ui-button
                        variant="ghost"
                        size="sm"
                        [routerLink]="['/events', event.id]"
                        (click)="$event.stopPropagation()"
                        class="action-btn view-btn"
                      >
                        <span class="action-icon">👁️</span>
                        <lucide-icon [img]="EyeIcon" size="14"></lucide-icon>
                        Ver Detalles
                      </ui-button>
                      <ui-button
                        variant="ghost"
                        size="sm"
                        [routerLink]="['/events', event.id, 'edit']"
                        (click)="$event.stopPropagation()"
                        class="action-btn edit-btn"
                      >
                        <span class="action-icon">✏️</span>
                        <lucide-icon [img]="EditIcon" size="14"></lucide-icon>
                        Editar
                      </ui-button>
                      <ui-button
                        variant="ghost"
                        size="sm"
                        class="danger action-btn delete-btn"
                        (click)="$event.stopPropagation()"
                      >
                        <span class="action-icon">🗑️</span>
                        <lucide-icon [img]="Trash2Icon" size="14"></lucide-icon>
                        Eliminar
                      </ui-button>
                    </div>
                  </div>
                }
              </div>
            }

            @if (paginatedEvents().length === 0) {
              <div class="no-events">
                <lucide-icon [img]="CalendarIcon" size="48"></lucide-icon>
                <h3>No se encontraron eventos</h3>
                <p class="text-friendly">
                  No hay eventos que coincidan con los filtros aplicados.
                </p>
                <ui-button
                  variant="primary"
                  [routerLink]="['/events/new']"
                >
                  <lucide-icon [img]="PlusIcon" size="16"></lucide-icon>
                  Crear Nuevo Evento
                </ui-button>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <ui-button
                variant="ghost"
                size="sm"
                [disabled]="currentPage() === 1"
                (click)="goToPage(currentPage() - 1)"
              >
                Anterior
              </ui-button>

              <span class="page-info text-friendly">
                Página {{ currentPage() }} de {{ totalPages() }}
              </span>

              <ui-button
                variant="ghost"
                size="sm"
                [disabled]="currentPage() === totalPages()"
                (click)="goToPage(currentPage() + 1)"
              >
                Siguiente
              </ui-button>
            </div>
          }
        </ui-card>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
        position: relative;
      }

      /* Hero Section */
      .hero-section {
        position: relative;
        overflow: hidden;
        margin-bottom: 3rem;
      }

      .hero-bg-pattern {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          radial-gradient(
            circle at 20% 80%,
            rgba(var(--primary-rgb), 0.1) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 80% 20%,
            rgba(var(--primary-rgb), 0.08) 0%,
            transparent 50%
          ),
          linear-gradient(
            135deg,
            rgba(var(--primary-rgb), 0.05) 0%,
            transparent 100%
          );
        animation: float 20s ease-in-out infinite;
      }

      .hero-gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          180deg,
          rgba(var(--primary-rgb), 0.1) 0%,
          rgba(var(--primary-rgb), 0.05) 50%,
          transparent 100%
        );
      }

      .hero-glow-effect {
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        background: radial-gradient(
          circle,
          rgba(var(--primary-rgb), 0.1) 0%,
          transparent 70%
        );
        animation: pulse-glow 4s ease-in-out infinite alternate;
        pointer-events: none;
      }

      .page-header {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 1.5rem;
        padding: 1.5rem 0 1rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 2;
      }

      .header-breadcrumb {
        flex: 1;
        position: relative;
      }

      .title-icon {
        display: inline-block;
        margin-right: 0.5rem;
        animation: bounce-in 1s ease-out;
      }

      .page-title {
        position: relative;
        z-index: 1;
        margin: 0 0 0.25rem 0;
        font-size: clamp(1.5rem, 2vw, 2rem);
        font-weight: 800;
        font-family: var(--font-display);
        letter-spacing: 0.04em;
        line-height: 1.15;
        text-shadow: none;
        -webkit-font-smoothing: antialiased;
        background: linear-gradient(
          135deg,
          var(--text-primary) 0%,
          color-mix(in srgb, var(--primary) 88%, #fff) 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: slide-up 0.8s ease-out;
      }

      .breadcrumb {
        display: flex;
        gap: 12px;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.15em;
        color: var(--text-muted);
        margin-top: 0.75rem;
        text-transform: uppercase;
        animation: fade-in-up 1.2s ease-out;
      }

      .breadcrumb-icon {
        margin-right: 0.25rem;
      }

      .separator {
        opacity: 0.6;
        font-weight: 400;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .gaming-stats {
        position: relative;
      }

      .gaming-stats::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: linear-gradient(
          135deg,
          rgba(var(--primary-rgb), 0.1),
          rgba(var(--primary-rgb), 0.05),
          transparent
        );
        border-radius: 1rem;
        z-index: -1;
        animation: shimmer 3s ease-in-out infinite;
      }

      .stat-card-animated {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        animation: card-enter 0.6s ease-out both;
      }

      .stat-card-animated:nth-child(1) {
        animation-delay: 0.1s;
      }
      .stat-card-animated:nth-child(2) {
        animation-delay: 0.2s;
      }
      .stat-card-animated:nth-child(3) {
        animation-delay: 0.3s;
      }
      .stat-card-animated:nth-child(4) {
        animation-delay: 0.4s;
      }

      .stat-card-animated:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(var(--primary-rgb), 0.3);
      }

      .events-content {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      .filters-card,
      .events-card {
        position: relative;
        overflow: hidden;
      }

      .gaming-card {
        background: linear-gradient(
          135deg,
          rgba(var(--surface), 0.95) 0%,
          rgba(var(--surface), 0.9) 100%
        );
        backdrop-filter: blur(20px);
        border: 1px solid rgba(var(--primary-rgb), 0.2);
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .gaming-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(
          90deg,
          var(--primary),
          var(--accent),
          var(--primary)
        );
        animation: gradient-shift 3s ease-in-out infinite;
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

      .filters-title-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .filters-icon {
        font-size: 1.5rem;
        animation: bounce-in 1s ease-out;
      }

      .filters-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .clear-filters-btn {
        transition: all 0.3s ease;
      }

      .clear-filters-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
      }

      .btn-icon {
        margin-right: 0.25rem;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .filter-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        align-items: center;
        grid-column: 1 / -1;
        margin-top: 1rem;
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

      .events-title-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .events-icon {
        font-size: 1.5rem;
        animation: bounce-in 1.2s ease-out;
      }

      .events-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .events-count {
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .gaming-badge {
        background: linear-gradient(135deg, var(--primary), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .count-icon {
        margin-left: 0.25rem;
      }

      .events-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .event-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.05);
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        animation: slide-in-left 0.6s ease-out both;
      }

      .gaming-event-item {
        backdrop-filter: blur(10px);
        box-shadow:
          0 4px 20px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .gaming-event-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--primary),
          transparent
        );
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .gaming-event-item:hover::before {
        opacity: 1;
      }

      .gaming-event-item:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.3),
          0 0 30px rgba(var(--primary-rgb), 0.2);
        border-color: rgba(var(--primary-rgb), 0.3);
      }

      .event-summary {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }

      .gaming-summary {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.02) 0%,
          rgba(255, 255, 255, 0.01) 100%
        );
      }

      .gaming-summary:hover {
        background: linear-gradient(
          135deg,
          rgba(var(--primary-rgb), 0.1) 0%,
          rgba(var(--primary-rgb), 0.05) 100%
        );
        transform: translateX(4px);
      }

      .event-icon {
        position: relative;
        padding: 0.75rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 0.75rem;
        color: var(--primary);
        flex-shrink: 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
      }

      .gaming-icon {
        position: relative;
        overflow: hidden;
      }

      .gaming-icon:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4);
      }

      .icon-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        background: radial-gradient(
          circle,
          rgba(var(--primary-rgb), 0.3) 0%,
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .gaming-icon:hover .icon-glow {
        opacity: 1;
        animation: pulse-glow 1s ease-in-out infinite alternate;
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
        font-family: var(--font-main);
        font-weight: 500;
        letter-spacing: 0.02em;
        line-height: 1.5;
      }

      .event-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 1.5rem;
        position: relative;
      }

      .gaming-actions {
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.1) 0%,
          rgba(0, 0, 0, 0.05) 100%
        );
        padding: 1.5rem;
        margin: 1.5rem -1.5rem -1.5rem -1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .action-btn {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }

      .action-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
        transition: left 0.5s ease;
      }

      .action-btn:hover::before {
        left: 100%;
      }

      .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }

      .view-btn:hover {
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
      }

      .edit-btn:hover {
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
      }

      .delete-btn:hover {
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
      }

      .action-icon {
        margin-right: 0.25rem;
        font-size: 0.875rem;
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

      /* Animations */
      @keyframes float {
        0%,
        100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-10px) rotate(1deg);
        }
      }

      @keyframes pulse-glow {
        0% {
          opacity: 0.3;
          transform: scale(1);
        }
        100% {
          opacity: 0.8;
          transform: scale(1.1);
        }
      }

      @keyframes shimmer {
        0% {
          opacity: 0.5;
        }
        50% {
          opacity: 1;
        }
        100% {
          opacity: 0.5;
        }
      }

      @keyframes gradient-shift {
        0%,
        100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }

      @keyframes bounce-in {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes slide-up {
        0% {
          transform: translateY(30px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fade-in-up {
        0% {
          transform: translateY(20px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes card-enter {
        0% {
          transform: translateY(20px) scale(0.95);
          opacity: 0;
        }
        100% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      @keyframes slide-in-left {
        0% {
          transform: translateX(-30px);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Status-based styling */
      .status-active {
        border-left: 4px solid var(--success);
      }

      .status-active::after {
        content: '';
        position: absolute;
        top: 10px;
        right: 10px;
        width: 8px;
        height: 8px;
        background: var(--success);
        border-radius: 50%;
        box-shadow: 0 0 10px var(--success);
        animation: pulse 2s infinite;
      }

      .status-completed {
        border-left: 4px solid var(--info);
        opacity: 0.8;
      }

      .status-cancelled {
        border-left: 4px solid var(--danger);
        opacity: 0.7;
      }

      .status-draft {
        border-left: 4px solid var(--warning);
        background: rgba(var(--warning-rgb), 0.05);
      }

      /* Type-based icon colors */
      .type-conference .event-icon {
        background: linear-gradient(135deg, #3b82f6, #1e40af);
      }

      .type-workshop .event-icon {
        background: linear-gradient(135deg, #10b981, #047857);
      }

      .type-meeting .event-icon {
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      }

      .type-social .event-icon {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .type-presentation .event-icon {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      .type-other .event-icon {
        background: linear-gradient(135deg, #6b7280, #4b5563);
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @media (max-width: 768px) {
        .hero-section {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
        }

        .filters-grid,
        .stats-row {
          grid-template-columns: 1fr;
        }

        .filters-card,
        .events-card {
          padding: 1.5rem;
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

        .gaming-actions {
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class EventsListComponent implements OnInit, OnDestroy, FilterableService<Event> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);

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

  events = signal<Event[]>([]);
  filteredEvents = signal<Event[]>([]);

  activeEventsCount = computed(
    () => this.events().filter((e) => e.status === 'active').length,
  );

  totalAttendees = computed(() =>
    this.events().reduce((sum, e) => sum + e.attendees, 0),
  );

  nextEventDays = computed(() => {
    const now = new Date();
    const futureEvents = this.events()
      .filter(
        (event) => new Date(event.date) >= now && event.status === 'active',
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (futureEvents.length === 0) return 0;

    const nextEvent = futureEvents[0];
    const diffTime = new Date(nextEvent.date).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });

  initialEvents: Event[] = [
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

  ngOnInit() {
    this.events.set(this.initialEvents);
    this.masterFilter.registerProvider(this);
    this.route.queryParamMap.pipe(take(1)).subscribe((q) => {
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

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Event[]> {
    const term = query.toLowerCase();
    const matches = this.events().filter(e => 
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

  getEventStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'draft':
        return 'status-draft';
      default:
        return '';
    }
  }

  getEventTypeClass(type: string): string {
    return `type-${type}`;
  }
}
