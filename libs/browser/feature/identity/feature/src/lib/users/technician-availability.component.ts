import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  effect,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  TechnicianApiService,
  ToastService,
  MasterFilterService,
  FilterableService,
  GlobalAuthStore,
  rbacAllows,
  type Technician as ApiTechnician,
  type TechnicianAvailability,
} from '@josanz-erp/shared-data-access';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiBadgeComponent,
  UiFeatureFilterBarComponent,
  UiFeatureAccessDeniedComponent,
  UiFeatureHeaderComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { Observable, of, firstValueFrom } from 'rxjs';


interface Technician {
  id: string;
  userId?: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

/** Días del mes cargado (cuadrante equipo + datos por día de mes). */
interface MonthDayCell {
  day: number;
  isToday: boolean;
  date: string;
}

/** Celda del calendario individual (mes alineado a lunes o vista semanal). */
interface PersonalGridCell {
  kind: 'day';
  day: number;
  year: number;
  month: number;
  /** Coincide con el mes/año seleccionado en el navegador (el resto son días colindantes). */
  isInFocusMonth: boolean;
  isToday: boolean;
  date: string;
}

@Component({
  selector: 'lib-technician-availability',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    UiCardComponent,
    UiBadgeComponent,
    UiFeatureFilterBarComponent,
    UiFeatureAccessDeniedComponent,
    UiFeatureHeaderComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver disponibilidad del equipo."
        permissionHint="users.view"
      />
    } @else {
    <ui-feature-page-shell
      [variant]="'compact'"
      [fadeIn]="true"
      [extraClass]="'availability-dashboard availability-container' + (viewMode() === 'team' ? ' availability-dashboard--team' : '')"
    >
      <ui-feature-header
        title="Disponibilidad técnica"
        breadcrumbLead="PLANIFICACIÓN"
        breadcrumbTail="CUADRANTE TÉCNICO"
        subtitle="Consulta el cuadrante. Los cambios de estado se gestionan solo mediante «Pedir días» y aprobación de RRHH (no edites celdas manualmente)."
        icon="calendar-days"
      />

      <div class="legal-hint" role="note">
        <lucide-icon name="shield-check" size="18" aria-hidden="true"></lucide-icon>
        <span
          >El calendario es de <strong>solo lectura</strong>. Vacaciones y ausencias deben solicitarse con el botón
          «Pedir días».</span
        >
      </div>

      @if (availabilityLoadIssue() !== 'none') {
        <div
          class="sync-degraded-banner"
          [class.sync-degraded-banner--partial]="availabilityLoadIssue() === 'partial'"
          role="status"
        >
          @if (availabilityLoadIssue() === 'full') {
            <lucide-icon name="cloud-off" size="18" aria-hidden="true"></lucide-icon>
            <span
              ><strong>Sin datos del servidor.</strong> No se pudo cargar el listado de operarios. Comprueba la
              conexión y pulsa <strong>Sincronizar datos</strong> (icono de refresco arriba).</span
            >
          } @else {
            <lucide-icon name="alert-triangle" size="18" aria-hidden="true"></lucide-icon>
            <span
              ><strong>Carga incompleta.</strong> Falta disponibilidad de algún operario: mientras tanto, los
              días sin registro muestran laborables como disponibles y fines de semana como no disponibles.
              Pulsa <strong>Sincronizar datos</strong> para reintentar.</span
            >
          }
        </div>
      }

      <header class="dashboard-toolbar" [attr.aria-busy]="isLoading()">
        <div class="header-actions">
           <div class="month-navigator">
              <button class="nav-btn ripple" type="button" (click)="viewMode() === 'personal' ? calendarNavPrev() : prevMonth()" title="Anterior">
                 <lucide-icon name="chevron-left" size="18"></lucide-icon>
              </button>
              <div class="current-month-display">
                <span class="m-name">{{ viewMode() === 'personal' && personalCalendarScope() === 'week' ? 'Semana' : getMonthName() }}</span>
                <span class="m-year">{{ viewMode() === 'personal' && personalCalendarScope() === 'week' ? weekRangeLabel() : currentYear() }}</span>
              </div>
              <button class="nav-btn ripple" type="button" (click)="viewMode() === 'personal' ? calendarNavNext() : nextMonth()" title="Siguiente">
                 <lucide-icon name="chevron-right" size="18"></lucide-icon>
              </button>
              <button type="button" class="nav-btn ripple today-jump-btn" (click)="goToToday()">
                <lucide-icon name="calendar-check" size="16"></lucide-icon>
                <span>Hoy</span>
              </button>
            </div>

            <div class="header-center-toggles" style="display: flex; gap: 0.75rem;">
              @if (viewMode() === 'personal') {
                <div class="personal-scope-toggle">
                  <button type="button" class="scope-btn" [class.active]="personalCalendarScope() === 'month'" (click)="setPersonalCalendarScope('month')">Mes</button>
                  <button type="button" class="scope-btn" [class.active]="personalCalendarScope() === 'week'" (click)="setPersonalCalendarScope('week')">Semana</button>
                </div>
              }

              @if (canManageTeam()) {
                <div class="view-toggle">
                  <button type="button" class="toggle-btn" [class.active]="viewMode() === 'personal'" (click)="viewMode.set('personal')">
                    <lucide-icon name="user" size="14" aria-hidden="true"></lucide-icon>
                    Individual
                  </button>
                  <button type="button" class="toggle-btn" [class.active]="viewMode() === 'team'" (click)="viewMode.set('team')">
                    <lucide-icon name="users" size="14" aria-hidden="true"></lucide-icon>
                    Equipo
                  </button>
                </div>
              }
            </div>
            
            <div class="header-actions-extra">
               <div
                 class="calendar-legend"
                 role="group"
                 aria-label="Leyenda de colores: disponible, ocupado, vacaciones y otras incidencias"
               >
                 <div class="legend-item AVAILABLE">
                   <span class="dot AVAILABLE" aria-hidden="true"></span><span>Disp.</span>
                 </div>
                 <div class="legend-item UNAVAILABLE">
                   <span class="dot UNAVAILABLE" aria-hidden="true"></span><span>Ocupado</span>
                 </div>
                 <div class="legend-item HOLIDAY">
                   <span class="dot HOLIDAY" aria-hidden="true"></span><span>Vacac.</span>
                 </div>
                 <div class="legend-item SICK_LEAVE">
                   <span class="dot SICK_LEAVE" aria-hidden="true"></span><span>Resto</span>
                 </div>
               </div>
               <div class="header-toolbar-actions">
                 <button type="button" class="nav-btn ripple toolbar-icon-btn" (click)="exportAvailabilityCsv()" title="Exportar CSV">
                   <lucide-icon name="download" size="20" aria-hidden="true"></lucide-icon>
                 </button>
                 <button
                   type="button"
                   class="nav-btn ripple toolbar-icon-btn"
                   (click)="loadMonth()"
                   [class.animate-spin]="isLoading()"
                   title="Sincronizar"
                 >
                   <lucide-icon name="rotate-cw" size="20" aria-hidden="true"></lucide-icon>
                 </button>
                 <button type="button" class="nav-btn ripple toolbar-icon-btn" (click)="shortcutsHelpOpen.set(true)" title="Atajos de teclado">
                   <lucide-icon name="help-circle" size="20" aria-hidden="true"></lucide-icon>
                 </button>
                 <a
                   class="request-days-btn"
                   [routerLink]="['/users/availability', 'request']"
                   [queryParams]="pedirDiasQueryParams()"
                 >
                   <lucide-icon name="calendar-plus" size="18" aria-hidden="true"></lucide-icon>
                   Pedir días
                 </a>
               </div>
            </div>
         </div>
      </header>

      @if (shortcutsHelpOpen()) {
        <div class="shortcuts-popover" role="dialog" aria-modal="true" aria-labelledby="avail-shortcuts-title">
          <div class="shortcuts-popover__card">
            <div class="shortcuts-popover__head">
              <h2 id="avail-shortcuts-title" class="shortcuts-popover__title">Atajos</h2>
              <button type="button" class="shortcuts-popover__close" (click)="shortcutsHelpOpen.set(false)" aria-label="Cerrar">
                <lucide-icon name="x" size="18" aria-hidden="true"></lucide-icon>
              </button>
            </div>
            <ul class="shortcuts-popover__list">
              <li><kbd>T</kbd> Ir a hoy</li>
              <li><kbd>M</kbd> Vista mes · <kbd>W</kbd> Vista semana (vista individual)</li>
              <li><kbd>←</kbd> / <kbd>→</kbd> Mes o semana anterior/siguiente (vista individual)</li>
              <li><kbd>E</kbd> Exportar CSV</li>
              <li><kbd>?</kbd> Esta ayuda · <kbd>Esc</kbd> Cerrar o limpiar búsqueda</li>
              @if (canManageTeam()) {
                <li><kbd>1</kbd> Vista individual · <kbd>2</kbd> Vista equipo</li>
              }
            </ul>
          </div>
        </div>
      }

       <div class="dashboard-layout" [class.dashboard-layout--team]="viewMode() === 'team'" [class.sidebar-collapsed]="sidebarCollapsed()">
         @if (viewMode() === 'personal') {
         <!-- Lista de operarios: solo vista individual (evita duplicar filas con el cuadrante de equipo) -->
         <aside class="team-sidebar animate-slide-right" [class.collapsed]="sidebarCollapsed()">
           <div class="sidebar-header">
             @if (!sidebarCollapsed()) {
               <h3>Operarios AV</h3>
               <ui-badge variant="info" class="count-badge">{{ personalSidebarTechnicians().length }}</ui-badge>
             }
             <button 
               type="button" 
               class="sidebar-toggle-btn" 
               (click)="sidebarCollapsed.update(v => !v)"
               [attr.aria-label]="sidebarCollapsed() ? 'Expandir panel' : 'Colapsar panel'"
               [title]="sidebarCollapsed() ? 'Expandir panel' : 'Colapsar panel'"
             >
               <lucide-icon [name]="sidebarCollapsed() ? 'chevron-right' : 'chevron-left'" size="16" aria-hidden="true"></lucide-icon>
             </button>
           </div>
          <div class="sidebar-search">
            <ui-feature-filter-bar
              [framed]="true"
              [appearance]="'feature'"
              [searchVariant]="'glass'"
              [value]="availabilitySearchQuery()"
              placeholder="Buscar técnico..."
              (searchChange)="onSearch($event)"
            />
          </div>
          <div class="technician-list custom-scrollbar" role="list">
            @for (tech of personalSidebarTechnicians(); track tech.id) {
              <button
                type="button"
                class="tech-card"
                [class.selected]="selectedTechId() === tech.id"
                (click)="selectedTechId.set(tech.id)"
              >
                <div class="tech-avatar-wrapper">
                  <div class="tech-avatar" [style.background]="getAvatarColor(tech.name)">
                    {{ tech.name.substring(0, 2).toUpperCase() }}
                  </div>
                  <span class="status-indicator" [class]="tech.status"></span>
                </div>
                <div class="tech-body">
                  <span class="tech-name">{{ tech.name }}</span>
                  <span class="tech-role">{{ tech.role }}</span>
                </div>
                <lucide-icon name="chevron-right" size="14" class="tech-chevron" aria-hidden="true"></lucide-icon>
              </button>
            } @empty {
              <div class="availability-empty availability-empty--sidebar" role="status">
                <lucide-icon name="search-x" size="22" aria-hidden="true"></lucide-icon>
                <p class="availability-empty__title">Ningún operario coincide</p>
                <p class="availability-empty__hint">Prueba otros términos o limpia el filtro.</p>
                <button type="button" class="availability-empty__btn" (click)="clearAvailabilitySearch()">
                  Limpiar búsqueda
                </button>
              </div>
            }
          </div>
         </aside>
         }

         @if (sidebarCollapsed()) {
           <button 
             type="button" 
             class="sidebar-expand-btn" 
             (click)="sidebarCollapsed.update(v => !v)"
             title="Expandir panel"
             aria-label="Expandir panel de operarios"
           >
              <lucide-icon name="chevron-right" size="18" aria-hidden="true"></lucide-icon>
             <span>Operarios</span>
           </button>
         }

         <!-- MAIN CALENDAR / TEAM BOARD -->
        <main class="main-content">
          @if (viewMode() === 'personal') {
            <div class="availability-panel animate-slide-up">
              <ui-card shape="auto" class="calendar-card">
                <div class="calendar-card-header">
                  <div class="header-meta">
                    @if (getSelectedTechName(); as name) {
                      <div class="tech-selector-info">
                        <span class="label selected-tech-label">Operario seleccionado</span>
                        <h2 class="tech-display-name">{{ name }}</h2>
                        @if (personalMonthSummary(); as pm) {
                          <div class="personal-month-summary-grid">
                            <div class="summary-card status-avail">
                              <div class="summary-dot AVAILABLE"></div>
                              <div class="summary-data">
                                <span class="summary-val">{{ pm.available }}</span>
                                <span class="summary-lbl">Disp.</span>
                              </div>
                            </div>
                            <div class="summary-card status-unavail">
                              <div class="summary-dot UNAVAILABLE"></div>
                              <div class="summary-data">
                                <span class="summary-val">{{ pm.unavailable }}</span>
                                <span class="summary-lbl">Ocup.</span>
                              </div>
                            </div>
                            <div class="summary-card status-holiday">
                              <div class="summary-dot HOLIDAY"></div>
                              <div class="summary-data">
                                <span class="summary-val">{{ pm.holiday }}</span>
                                <span class="summary-lbl">Vacac.</span>
                              </div>
                            </div>
                            <div class="summary-card status-other">
                              <div class="summary-dot SICK_LEAVE"></div>
                              <div class="summary-data">
                                <span class="summary-val">{{ pm.incident }}</span>
                                <span class="summary-lbl">Otros</span>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
                
                <div class="calendar-container">
                  <div class="calendar-grid-header">
                    @for (day of ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']; track day; let idx = $index) {
                      <div class="grid-day-label" [class.is-weekend]="idx >= 5">{{ day }}</div>
                    }
                  </div>
                  
                  <div
                    class="calendar-grid"
                    [class.calendar-grid--week]="personalCalendarScope() === 'week'"
                    role="grid"
                  >
                    @for (cell of personalCalendarCells(); track cell.date) {
                      @let statusObj = getTechStatusByIso(selectedTechId(), cell.date);
                      <div
                        class="calendar-cell calendar-cell--readonly"
                        [class.calendar-cell--outside-focus]="!cell.isInFocusMonth"
                        [class.today]="cell.isToday"
                        [class.is-weekend]="isWeekendYmd(cell.year, cell.month, cell.day)"
                        role="gridcell"
                        [attr.aria-label]="
                          'Día ' + cell.day + ', ' + getCellStatusAbbrev(statusObj.type)
                        "
                      >
                        <div class="calendar-cell__top">
                          <span class="day-number">{{ cell.day }}</span>
                          @if (cell.isToday) {
                            <span class="today-tag">HOY</span>
                          }
                        </div>
                        
                        <div class="calendar-cell__content">
                          <div class="status-badge" [class]="statusObj.type">
                            <div class="status-badge-dot"></div>
                            <span class="status-label">{{ getCellStatusAbbrev(statusObj.type) }}</span>
                            @if (statusObj.startTime && statusObj.endTime) {
                              <span class="time-range">{{ statusObj.startTime }}-{{ statusObj.endTime }}</span>
                            }
                          </div>
                          
                          @if (statusObj.notes) {
                            <div class="cell-notes" [title]="statusObj.notes">
                              {{ statusObj.notes }}
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </ui-card>
              @if (isLoading()) {
                <div class="availability-loading-overlay" aria-live="polite" aria-busy="true">
                  <lucide-icon name="rotate-cw" size="28" class="animate-spin availability-loading-overlay__icon" aria-hidden="true"></lucide-icon>
                  <span class="availability-loading-overlay__text">Cargando disponibilidad…</span>
                </div>
              }
            </div>
           } @else {
             <!-- TEAM BOARD VIEW -->
             <div class="availability-panel team-board-wrapper animate-slide-up" [class.board-tech-collapsed]="sidebarCollapsed()">
               <ui-card shape="auto" class="team-board-card">
                 <div class="team-board-toolbar">
                   <button 
                     type="button" 
                     class="sidebar-toggle-btn team-toggle" 
                     (click)="sidebarCollapsed.update(v => !v)"
                     [attr.aria-label]="sidebarCollapsed() ? 'Expandir panel' : 'Colapsar panel'"
                     [title]="sidebarCollapsed() ? 'Expandir panel' : 'Colapsar panel'"
                   >
                     <lucide-icon [name]="sidebarCollapsed() ? 'chevron-right' : 'chevron-left'" size="18" aria-hidden="true"></lucide-icon>
                     @if (sidebarCollapsed()) {
                       <span>Mostrar operarios</span>
                     }
                   </button>

                  <div class="team-board-toolbar__meta">
                    <span class="label">Vista equipo</span>
                    <h2 class="team-board-title">
                      Cuadrante
                      <span class="team-board-month">{{ getMonthName() }} {{ currentYear() }}</span>
                    </h2>
                     <p class="team-board-hint">
                       <lucide-icon name="users" size="14" aria-hidden="true"></lucide-icon>
                       {{ teamBoardHintCounts() }} · vista mensual completa del equipo
                     </p>
                     @if (!isCompactTeamNav()) {
                       <p class="team-board-scroll-hint-desktop" aria-live="polite">
                         <lucide-icon name="calendar-days" size="14" aria-hidden="true"></lucide-icon>
                         Día {{ teamScrollLabel().center }} de {{ teamScrollLabel().total }}
                         @if (teamScrollLabel().from !== teamScrollLabel().to) {
                           <span class="team-board-scroll-hint-desktop__range">
                             · visible {{ teamScrollLabel().from }}–{{ teamScrollLabel().to }}
                           </span>
                         }
                       </p>
                     }
                     </div>
                  <div
                    class="calendar-legend team-board-legend"
                    role="group"
                    aria-label="Leyenda de colores del cuadrante"
                  >
                    <div class="legend-item AVAILABLE">
                      <span class="dot AVAILABLE" aria-hidden="true"></span><span>Disp.</span>
                    </div>
                    <div class="legend-item UNAVAILABLE">
                      <span class="dot UNAVAILABLE" aria-hidden="true"></span><span>Ocupado</span>
                    </div>
                    <div class="legend-item HOLIDAY">
                      <span class="dot HOLIDAY" aria-hidden="true"></span><span>Vacac.</span>
                    </div>
                    <div class="legend-item SICK_LEAVE">
                      <span class="dot SICK_LEAVE" aria-hidden="true"></span><span>Incid.</span>
                    </div>
                   </div>
                 </div>

                 <div class="team-board-toolbar-search">
                  <div class="availability-filter-slot">
                    <ui-feature-filter-bar
                      [framed]="true"
                      [appearance]="'feature'"
                      [searchVariant]="'glass'"
                      [value]="availabilitySearchQuery()"
                      placeholder="Nombre o rol; varios operarios: ana, carlos o rigging; av…"
                      (searchChange)="onSearch($event)"
                    />
                    @if (availabilitySearchQuery().trim()) {
                      <button
                        type="button"
                        class="availability-clear-search"
                        (click)="clearAvailabilitySearch()"
                        title="Quitar filtro de búsqueda"
                      >
                        <lucide-icon name="x" size="16" aria-hidden="true"></lucide-icon>
                        <span class="availability-clear-search__label">Limpiar</span>
                      </button>
                    }
                  </div>
                  <p class="team-board-filter-hint">
                    Separa con comas para ver solo esas personas (p. ej. <span class="team-board-filter-hint__ex">Ana, rigging</span>).
                  </p>
                </div>

                @if (isCompactTeamNav()) {
                  <div class="team-mobile-day-bar" aria-live="polite">
                    <div class="team-mobile-day-bar__inner">
                      <button
                        type="button"
                        class="team-mobile-day-bar__btn"
                        (click)="scrollTeamHorizontalByDays(-7)"
                        title="Ver días anteriores"
                      >
                        <lucide-icon name="chevron-left" size="18" aria-hidden="true"></lucide-icon>
                      </button>
                      <div class="team-mobile-day-bar__text">
                        <span class="team-mobile-day-bar__label">Día {{ teamScrollLabel().center }} de {{ teamScrollLabel().total }}</span>
                        @if (teamScrollLabel().from !== teamScrollLabel().to) {
                          <span class="team-mobile-day-bar__sub">
                            Visible: {{ teamScrollLabel().from }}–{{ teamScrollLabel().to }}
                          </span>
                        }
                      </div>
                      <button
                        type="button"
                        class="team-mobile-day-bar__btn team-mobile-day-bar__btn--accent"
                        (click)="scrollTeamHorizontalToToday()"
                        title="Ir a hoy"
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        class="team-mobile-day-bar__btn"
                        (click)="scrollTeamHorizontalByDays(7)"
                        title="Ver días siguientes"
                      >
                        <lucide-icon name="chevron-right" size="18" aria-hidden="true"></lucide-icon>
                      </button>
                    </div>
                   </div>
                 }

                 @let hScroll = teamHScrollUi();
                <div class="team-board-scroll-wrap">
                  <div
                    class="team-board-scroll custom-scrollbar-h"
                    tabindex="-1"
                    (scroll)="onTeamHorizontalScroll($event)"
                  >
                  <div class="team-board-matrix" [style.--team-day-cols]="monthDays().length">
                    <div class="board-header">
                      <div class="header-col persona-col sticky-col">
                        <lucide-icon name="circle-user" size="18" aria-hidden="true"></lucide-icon>
                        <span>Persona</span>
                      </div>
                      <div class="days-row">
                        @for (cell of monthDays(); track cell.date) {
                          <div
                            class="day-header-col"
                            [attr.data-team-day]="cell.day"
                            [class.is-today]="cell.isToday"
                            [class.is-weekend]="isWeekend(cell.day)"
                          >
                            <span class="d-n">{{ cell.day }}</span>
                            <span class="d-l">{{ getDayOfWeekShort(cell.day) }}</span>
                          </div>
                        }
                      </div>
                    </div>

                    <div class="board-body">
                      @for (tech of teamBoardRows(); track tech.id; let idx = $index) {
                        <div
                          class="board-row"
                          [class.is-selected]="selectedTechId() === tech.id"
                          [class.is-alt]="idx % 2 === 1"
                          role="button"
                          tabindex="0"
                          (click)="selectedTechId.set(tech.id)"
                          (keydown.enter)="selectedTechId.set(tech.id)"
                          (keydown.space)="$event.preventDefault(); selectedTechId.set(tech.id)"
                        >
                          <div class="board-tech-info sticky-col">
                            <div class="mini-avatar" [style.background]="getAvatarColor(tech.name)">
                              {{ tech.name.substring(0, 1) }}
                            </div>
                            <div class="mini-meta">
                              <span class="n">{{ tech.name }}</span>
                              <span class="r">{{ tech.role }}</span>
                            </div>
                          </div>
                          <div class="days-row board-cells-row">
                            @for (cell of monthDays(); track cell.date) {
                              <div
                                class="board-day-cell"
                                [class.is-today]="cell.isToday"
                                [class.is-weekend]="isWeekend(cell.day)"
                              >
                                @if (getTechDayStatus(tech.id, cell.day); as statusObj) {
                                  <div
                                    class="status-chip"
                                    [class]="statusObj.type"
                                    [attr.title]="getShortLabel(statusObj.type) + ' · día ' + cell.day + (statusObj.notes ? ' · ' + statusObj.notes : '')"
                                  >
                                    @if (statusObj.type === 'HOLIDAY' || statusObj.type === 'SICK_LEAVE') {
                                      <div class="status-dot-vibrant"></div>
                                    }
                                  </div>
                                } @else {
                                  <div class="status-chip default" title="Sin dato"></div>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      } @empty {
                        <div class="availability-empty availability-empty--team" role="status">
                          @if (displayedTechnicians().length === 0) {
                            <lucide-icon name="users" size="26" aria-hidden="true"></lucide-icon>
                            <p class="availability-empty__title">No hay operarios en el cuadrante</p>
                            <p class="availability-empty__hint">Cuando existan técnicos asignados, aparecerán aquí.</p>
                          } @else if (availabilitySearchQuery().trim()) {
                            <lucide-icon name="search-x" size="26" aria-hidden="true"></lucide-icon>
                            <p class="availability-empty__title">Nadie coincide con el filtro</p>
                            <p class="availability-empty__hint">Revisa la búsqueda o limpia para ver a todo el equipo.</p>
                            <button type="button" class="availability-empty__btn" (click)="clearAvailabilitySearch()">
                              Limpiar filtro
                            </button>
                          } @else {
                            <lucide-icon name="calendar-days" size="26" aria-hidden="true"></lucide-icon>
                            <p class="availability-empty__title">Sin filas que mostrar</p>
                          }
                        </div>
                      }
                    </div>
                  </div>
                  </div>
                  @if (hScroll.overflow) {
                    <div class="team-board-hscroll-indicator" role="presentation" aria-hidden="true">
                      <div
                        class="team-board-hscroll-indicator__thumb"
                        [style.width.%]="hScroll.thumbW"
                        [style.margin-inline-start.%]="hScroll.thumbLeft"
                      ></div>
                    </div>
                  }
                </div>
              </ui-card>
              @if (isLoading()) {
                <div class="availability-loading-overlay" aria-live="polite" aria-busy="true">
                  <lucide-icon name="rotate-cw" size="28" class="animate-spin availability-loading-overlay__icon" aria-hidden="true"></lucide-icon>
                  <span class="availability-loading-overlay__text">Cargando cuadrante…</span>
                </div>
              }
            </div>
          }
        </main>
      </div>
    </ui-feature-page-shell>
    }
  `,
  styles: [`
    .availability-dashboard {
      --avail-accent: var(--brand);
      --color-avail: #10b981;
      --color-unavail: #ef4444;
      --color-holiday: #3b82f6;
      --color-incident: #f59e0b;
      --avail-panel-radius: 14px;
      --avail-soft-border: color-mix(in srgb, var(--border-soft) 80%, transparent);

      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      animation: availFadeIn 0.45s var(--ease-out-expo) forwards;
    }

    .legal-hint {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--info, #3b82f6) 22%, var(--border-soft));
      background: color-mix(in srgb, var(--info, #3b82f6) 7%, var(--surface));
      color: var(--text-secondary);
      font-size: 0.8125rem;
      line-height: 1.5;
    }

    .legal-hint lucide-icon {
      flex-shrink: 0;
      margin-top: 0.1rem;
      color: color-mix(in srgb, var(--info, #3b82f6) 75%, var(--text-primary));
    }

    .sync-degraded-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--danger) 28%, var(--border-soft));
      background: color-mix(in srgb, var(--danger) 8%, var(--surface));
      color: var(--text-secondary);
      font-size: 0.8125rem;
      line-height: 1.45;
    }

    .sync-degraded-banner--partial {
      border-color: color-mix(in srgb, var(--warning) 30%, var(--border-soft));
      background: color-mix(in srgb, var(--warning) 9%, var(--surface));
    }

    .availability-panel {
      position: relative;
      min-width: 0;
    }

    .main-content {
      min-width: 0;
    }

    .sidebar-search {
      margin-bottom: 0.35rem;
    }

    .sidebar-search ui-feature-filter-bar {
      margin-bottom: 0 !important;
    }

    .calendar-card-header {
      padding: 1.15rem 1.25rem 0.85rem;
      border-bottom: 1px solid var(--avail-soft-border);
    }

    .selected-tech-label {
      display: block;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.2rem;
    }

    .tech-display-name {
      margin: 0;
      font-size: clamp(1.15rem, 1vw + 0.9rem, 1.45rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .availability-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.35rem;
      padding: 1.5rem 1rem;
      border-radius: 12px;
      border: 1px dashed var(--avail-soft-border);
      background: color-mix(in srgb, var(--surface) 92%, var(--bg-secondary));
      color: var(--text-muted);
    }

    .availability-empty__title {
      margin: 0.35rem 0 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .availability-empty__hint {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.45;
      max-width: 16rem;
    }

    .availability-empty__btn {
      margin-top: 0.5rem;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--avail-soft-border);
      background: var(--surface);
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .availability-empty__btn:hover {
      border-color: color-mix(in srgb, var(--brand) 30%, var(--border-soft));
      color: var(--text-primary);
      background: color-mix(in srgb, var(--brand) 6%, var(--surface));
    }

    .tech-chevron {
      flex-shrink: 0;
      opacity: 0.35;
      color: var(--text-muted);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .tech-card:hover .tech-chevron,
    .tech-card.selected .tech-chevron {
      opacity: 0.85;
      color: var(--brand);
      transform: translateX(2px);
    }

    @keyframes availFadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* TOOLBAR & ACTIONS */
    .dashboard-toolbar {
      background: var(--surface);
      border: 1px solid var(--avail-soft-border);
      border-radius: var(--avail-panel-radius);
      padding: 0.85rem 1.15rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 14px -6px rgba(15, 23, 42, 0.06);
      position: relative;
    }

    .dashboard-toolbar::before {
      display: none;
    }

    .header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem 1.25rem;
      position: relative;
      z-index: 1;
    }

    .month-navigator {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--bg-secondary);
      padding: 0.25rem;
      border-radius: 10px;
      border: 1px solid var(--avail-soft-border);
    }

    .current-month-display {
      min-width: 120px;
      text-align: center;
      display: flex;
      flex-direction: column;
      line-height: 1.15;
      padding: 0 0.25rem;
    }
    .m-name { font-weight: 700; font-size: 0.875rem; color: var(--text-primary); text-transform: capitalize; }
    .m-year { font-size: 0.6875rem; font-weight: 600; color: var(--text-muted); }

    .nav-btn {
      width: 34px; height: 34px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: var(--surface); border: 1px solid var(--avail-soft-border);
      color: var(--text-secondary); transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }
    .nav-btn:hover { background: color-mix(in srgb, var(--brand) 7%, var(--surface)); color: var(--brand); border-color: color-mix(in srgb, var(--brand) 22%, var(--border-soft)); transform: none; }
    
    .today-jump-btn { 
      width: auto !important; padding: 0 0.75rem; gap: 0.4rem; font-size: 0.75rem; font-weight: 600; 
      background: color-mix(in srgb, var(--brand) 8%, var(--surface)); color: color-mix(in srgb, var(--brand) 80%, var(--text-primary)); border-color: color-mix(in srgb, var(--brand) 18%, var(--border-soft));
    }

    .personal-scope-toggle, .view-toggle {
      display: flex;
      background: var(--bg-secondary);
      padding: 3px;
      border-radius: 10px;
      border: 1px solid var(--avail-soft-border);
      gap: 2px;
    }

    .scope-btn, .toggle-btn {
      padding: 0.45rem 0.85rem; border-radius: 8px; border: none;
      background: transparent; color: var(--text-muted);
      font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
      display: flex; align-items: center; gap: 0.4rem; text-transform: none; letter-spacing: 0.01em;
    }
    .scope-btn.active, .toggle-btn.active {
      background: var(--surface); color: var(--text-primary);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06); transform: none;
      border: 1px solid color-mix(in srgb, var(--border-soft) 70%, transparent);
    }
    .scope-btn:hover:not(.active), .toggle-btn:hover:not(.active) { background: color-mix(in srgb, var(--text-primary) 4%, transparent); color: var(--text-primary); }

    a.request-days-btn,
    .request-days-btn {
      background: linear-gradient(
        160deg,
        color-mix(in srgb, var(--brand) 92%, #fff) 0%,
        color-mix(in srgb, var(--brand) 78%, #0f172a) 100%
      );
      color: #fff !important;
      border: 1px solid color-mix(in srgb, var(--brand) 50%, rgba(255, 255, 255, 0.1));
      padding: 0.55rem 1.1rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0.01em;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 16px -4px color-mix(in srgb, var(--brand) 35%, transparent);
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
    }

    a.request-days-btn:hover,
    .request-days-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08), 0 10px 22px -6px color-mix(in srgb, var(--brand) 40%, transparent);
      filter: none;
    }

    /* VIBRANT STATUSES - SOLID COLORS WITH GLOW */
    .status-marker.AVAILABLE { background: rgba(16, 185, 129, 0.08); border-left: 6px solid #10b981; }
    .status-marker.UNAVAILABLE { background: rgba(239, 68, 68, 0.08); border-left: 6px solid #ef4444; }
    .status-marker.HOLIDAY { background: rgba(59, 130, 246, 0.08); border-left: 6px solid #3b82f6; }
    .status-marker.SICK_LEAVE { background: rgba(245, 158, 11, 0.08); border-left: 6px solid #f59e0b; }

    .dot { 
      width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; 
      border: 1.5px solid color-mix(in srgb, var(--surface) 80%, transparent);
      box-shadow: none;
    }
    .dot.AVAILABLE { background: #10b981 !important; }
    .dot.UNAVAILABLE { background: #ef4444 !important; }
    .dot.HOLIDAY { background: #3b82f6 !important; }
    .dot.SICK_LEAVE { background: #f59e0b !important; }

    .header-actions-extra {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem 1.1rem;
      min-width: 0;
    }

    .header-toolbar-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .header-toolbar-actions .toolbar-icon-btn {
      width: 40px;
      min-width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 10px;
    }

    .calendar-legend {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: stretch;
      flex: 0 1 auto;
      min-width: 0;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      gap: 0;
      padding: 0;
      background: var(--bg-secondary);
      border: 1px solid var(--avail-soft-border);
      border-radius: 10px;
    }

    .calendar-legend::-webkit-scrollbar {
      display: none;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin: 0;
      padding: 0.42rem 0.65rem;
      background: transparent;
      border: none;
      border-radius: 0;
      border-right: 1px solid var(--avail-soft-border);
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: none;
      letter-spacing: 0.01em;
      white-space: nowrap;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .legend-item:last-child {
      border-right: none;
    }

    .legend-item:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: none;
    }

    .legend-item .dot {
      width: 9px;
      height: 9px;
      border-width: 1px;
      flex-shrink: 0;
    }

    .team-board-toolbar .calendar-legend {
      max-width: min(420px, 100%);
    }

    .team-board-legend {
      flex-shrink: 1;
    }

     .dashboard-layout {
       display: grid;
       grid-template-columns: 280px minmax(0, 1fr);
       gap: 1.25rem;
       align-items: start;
       position: relative;
       transition: grid-template-columns 0.35s ease;
     }
     .dashboard-layout.sidebar-collapsed,
     .dashboard-layout--team {
        grid-template-columns: 1fr;
        gap: 0;
      }

      @keyframes expandBtnEnter {
        0% { opacity: 0; transform: translateX(-100%) translateY(-50%); }
        100% { opacity: 1; transform: translateX(0) translateY(-50%); }
      }

      .sidebar-expand-btn {
        position: absolute;
        top: 50%;
        left: 0;
        width: 32px;
        height: 120px;
        border-radius: 0 16px 16px 0;
        background: rgba(var(--brand-rgb), 0.15);
        backdrop-filter: blur(12px);
        color: var(--brand);
        border: 1px solid rgba(var(--brand-rgb), 0.3);
        border-left: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        cursor: pointer;
        z-index: 2000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        animation: expandBtnEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
      }
      .sidebar-expand-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(var(--brand-rgb), 0.1), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .sidebar-expand-btn:hover {
        width: 42px;
        background: rgba(var(--brand-rgb), 0.25);
        box-shadow: 10px 0 40px rgba(var(--brand-rgb), 0.15);
      }
      .sidebar-expand-btn:hover::before {
        opacity: 1;
      }
      .sidebar-expand-btn lucide-icon {
        transition: transform 0.4s var(--transition-spring);
      }
      .sidebar-expand-btn:hover lucide-icon {
        transform: translateX(4px) scale(1.2);
      }
      .sidebar-expand-btn span {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-size: 0.7rem;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        opacity: 0.9;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

     .team-sidebar {
       display: flex;
       flex-direction: column;
       gap: 1.5rem;
       position: sticky;
       top: 1.5rem;
       transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
       width: 300px;
       min-width: 300px;
     }
     .team-sidebar.collapsed {
       width: 0;
       min-width: 0;
       padding: 0;
       margin: 0;
       overflow: hidden;
       opacity: 0;
       pointer-events: none;
     }
     .team-sidebar.collapsed .sidebar-header,
     .team-sidebar.collapsed .sidebar-search,
     .team-sidebar.collapsed .technician-list {
       display: none;
     }
     .dashboard-layout--team .team-sidebar.collapsed {
       display: none;
     }

     .sidebar-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       position: relative;
       padding-right: 2.25rem;
     }
     .sidebar-header h3 { 
       font-size: 0.75rem; 
       font-weight: 700; 
       text-transform: uppercase; 
       letter-spacing: 0.06em; 
       color: var(--text-muted); 
       margin: 0;
     }
     
     .sidebar-toggle-btn {
        position: absolute;
        top: 50%;
        right: -14px;
        transform: translateY(-50%);
        width: 28px;
        height: 28px;
        border-radius: 10px;
        background: rgba(var(--brand-rgb), 0.9);
        color: #fff;
        border: 2px solid var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 100;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .sidebar-toggle-btn:hover {
        background: var(--brand);
        transform: translateY(-50%) scale(1.15) rotate(-90deg);
        box-shadow: 0 0 20px rgba(var(--brand-rgb), 0.4);
      }
      .sidebar-toggle-btn:active {
        transform: translateY(-50%) scale(0.9);
      }
      
      .sidebar-toggle-btn lucide-icon {
        transition: transform 0.3s ease;
      }
      .sidebar-toggle-btn:hover lucide-icon {
        transform: scale(1.1);
      }

     .sidebar-toggle-btn.team-toggle {
       position: static;
       transform: none;
       margin-left: 0.5rem;
       width: auto;
       height: 28px;
       padding: 0 0.75rem;
       border-radius: 8px;
       font-size: 0.7rem;
       font-weight: 800;
       display: inline-flex;
       align-items: center;
       gap: 0.4rem;
       background: rgba(255,255,255,0.1);
       border: 1px solid rgba(255,255,255,0.2);
     }
     .sidebar-toggle-btn.team-toggle:hover {
       background: rgba(255,255,255,0.2);
       transform: none;
     }

    .technician-list {
      display: flex; flex-direction: column; gap: 0.5rem;
      max-height: calc(100vh - 380px); 
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.15rem;
    }

    .tech-card {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.75rem 0.9rem; background: var(--surface);
      border: 1px solid var(--avail-soft-border); border-radius: 12px;
      cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
      text-align: left; position: relative;
    }
    .tech-card::before { display: none; }
    .tech-card:hover { border-color: color-mix(in srgb, var(--brand) 28%, var(--border-soft)); background: color-mix(in srgb, var(--brand) 4%, var(--surface)); box-shadow: 0 2px 8px -4px rgba(15, 23, 42, 0.08); transform: none; }
    .tech-card.selected { background: color-mix(in srgb, var(--brand) 6%, var(--surface)); border-color: color-mix(in srgb, var(--brand) 45%, var(--border-soft)); box-shadow: inset 3px 0 0 var(--brand), 0 2px 8px -4px rgba(15, 23, 42, 0.06); }
    .tech-card.selected .tech-name { color: var(--text-primary); font-weight: 700; }
    .tech-card.selected .tech-avatar { box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.12); }

    .tech-avatar-wrapper { position: relative; }
    .tech-avatar {
      width: 42px; height: 42px; border-radius: 10px;
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #fff; font-size: 0.95rem;
      box-shadow: 0 2px 6px -2px rgba(15, 23, 42, 0.15);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .status-indicator { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid var(--surface); }
    .status-indicator.online { background: #10b981; }
    .status-indicator.offline { background: #64748b; }
    .status-indicator.away { background: #f59e0b; }

    .tech-body { flex: 1; min-width: 0; position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; }
    .tech-name { display: block; font-weight: 600; font-size: 0.9rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
    .tech-role { display: block; font-size: 0.6875rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 0.1rem; letter-spacing: 0.04em; }

    /* CALENDAR CARD & SUMMARY */
    .calendar-card {
      background: var(--surface) !important;
      border: 1px solid var(--avail-soft-border) !important;
      border-radius: var(--avail-panel-radius) !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 20px -8px rgba(15, 23, 42, 0.08);
      position: relative; 
      overflow: hidden;
    }

    .personal-month-summary-grid {
      display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;
    }
    
    .summary-card {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.5rem 0.75rem; border-radius: 10px;
      background: var(--bg-secondary); 
      border: 1px solid var(--avail-soft-border);
      transition: border-color 0.2s ease;
    }
    .summary-card:hover { transform: none; background: var(--bg-secondary); border-color: color-mix(in srgb, var(--border-soft) 90%, transparent); }
    
    .status-avail { border-bottom: 2px solid #10b981; }
    .status-unavail { border-bottom: 2px solid #ef4444; }
    .status-holiday { border-bottom: 2px solid #3b82f6; }
    .status-other { border-bottom: 2px solid #f59e0b; }

    .summary-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .summary-dot.AVAILABLE { background: #10b981; }
    .summary-dot.UNAVAILABLE { background: #ef4444; }
    .summary-dot.HOLIDAY { background: #3b82f6; }
    .summary-dot.SICK_LEAVE { background: #f59e0b; }

    .summary-data { display: flex; flex-direction: column; line-height: 1.1; }
    .summary-val { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .summary-lbl { font-size: 0.625rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.03em; }

    .calendar-grid-header { 
      display: grid; 
      grid-template-columns: repeat(7, 1fr); 
      margin-bottom: 0.65rem; 
      gap: 0.5rem; 
    }
    .grid-day-label { 
      text-align: center; 
      font-size: 0.6875rem; 
      font-weight: 600; 
      color: var(--text-muted); 
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding-bottom: 0.35rem;
      border-bottom: 1px solid var(--avail-soft-border);
    }

    .calendar-grid { 
      display: grid; 
      grid-template-columns: repeat(7, minmax(0, 1fr)); 
      gap: 0.5rem; 
    }

    .calendar-grid--week {
      gap: 0.45rem;
    }

    .calendar-cell {
      min-height: 6.5rem; 
      background: var(--bg-secondary); 
      border: 1px solid var(--avail-soft-border); 
      border-radius: 10px;
      padding: 0.65rem 0.75rem; 
      display: flex; 
      flex-direction: column; 
      gap: 0.45rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease; 
      position: relative; 
    }
    .calendar-cell::before { display: none; }
    .calendar-cell:hover { 
      border-color: color-mix(in srgb, var(--brand) 25%, var(--border-soft)); 
      transform: none; 
      box-shadow: 0 2px 8px -4px rgba(15, 23, 42, 0.08); 
      z-index: 1; 
    }
    .calendar-cell.today { 
      border-color: color-mix(in srgb, var(--brand) 45%, var(--border-soft)); 
      background: color-mix(in srgb, var(--brand) 5%, var(--surface));
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand) 20%, transparent);
    }

    .calendar-grid--week .calendar-cell {
      min-height: 5.25rem;
      padding: 0.55rem 0.65rem;
    }

    .day-number { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
    .today-tag { font-size: 0.5625rem; font-weight: 700; background: var(--brand); color: #fff; padding: 2px 6px; border-radius: 6px; margin-left: 0.4rem; letter-spacing: 0.04em; display: inline-flex; align-items: center; align-self: flex-start; }
    
    .calendar-cell__top { display: flex; align-items: center; }

    .status-badge {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.28rem 0.5rem; border-radius: 6px;
      background: var(--surface); border: 1px solid var(--avail-soft-border);
      margin-top: auto; align-self: flex-start; width: fit-content;
    }
    .status-badge.AVAILABLE { background: color-mix(in srgb, #10b981 10%, var(--surface)); border-color: color-mix(in srgb, #10b981 22%, transparent); }
    .status-badge.UNAVAILABLE { background: color-mix(in srgb, #ef4444 10%, var(--surface)); border-color: color-mix(in srgb, #ef4444 22%, transparent); }
    .status-badge.HOLIDAY { background: color-mix(in srgb, #3b82f6 10%, var(--surface)); border-color: color-mix(in srgb, #3b82f6 22%, transparent); }
    .status-badge.SICK_LEAVE { background: color-mix(in srgb, #f59e0b 10%, var(--surface)); border-color: color-mix(in srgb, #f59e0b 22%, transparent); }

    .status-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
    .AVAILABLE .status-badge-dot { background: #10b981; }
    .UNAVAILABLE .status-badge-dot { background: #ef4444; }
    .HOLIDAY .status-badge-dot { background: #3b82f6; }
    .SICK_LEAVE .status-badge-dot { background: #f59e0b; }

    .status-label { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.03em; }
    .cell-notes { font-size: 0.625rem; color: var(--text-muted); font-weight: 500; line-height: 1.35; margin-top: 0.35rem; }

    .calendar-container {
      padding: 0.85rem 1rem 1.1rem;
    }

    /* TEAM BOARD MATRIX - PANORAMIC VIEW */
    .team-board-toolbar {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--avail-soft-border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.85rem 1rem;
      background: var(--bg-secondary);
    }

    .team-board-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
    .team-board-month { color: var(--brand); margin-left: 0.5rem; font-weight: 600; }
    .team-board-hint { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; font-weight: 500; margin-top: 0.35rem; }
    
    .team-board-matrix { 
      width: max-content; 
      min-width: 100%; 
      display: flex; 
      flex-direction: column; 
      background: rgba(255,255,255,0.05); 
      gap: 1px; 
    }
    
    .board-header { 
      display: flex;
      position: sticky; 
      top: 0; 
      z-index: 100; 
      background: color-mix(in srgb, var(--surface) 95%, white 5%) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .persona-col { 
      width: 280px; min-width: 280px; max-width: 280px; flex-shrink: 0; padding: 1.25rem 2rem; 
      font-weight: 950; color: var(--brand); text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.15em; 
      display: flex; align-items: center; gap: 0.85rem; border-right: 2px solid rgba(255,255,255,0.08); 
      background: inherit;
    }
    
    .days-row { display: flex; flex-direction: row; flex: 1; }
    
    .day-header-col { 
      width: 52px; min-width: 52px; flex-shrink: 0; padding: 0.85rem 0.25rem; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: inherit; border-right: 1px solid rgba(255,255,255,0.06); 
      transition: all 0.2s ease;
    }
    .day-header-col.is-today { background: color-mix(in srgb, var(--brand) 15%, transparent); color: #fff; }
    .day-header-col.is-weekend { background: rgba(0,0,0,0.2); opacity: 0.7; }
    .day-header-col .d-n { font-weight: 950; font-size: 1.1rem; line-height: 1; }
    .day-header-col .d-l { font-size: 0.55rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); margin-top: 0.25rem; opacity: 0.5; }

    .board-body { display: flex; flex-direction: column; gap: 1px; background: var(--border-soft); }
    .board-row { display: flex; flex-direction: row; background: var(--surface); transition: all 0.2s ease; cursor: pointer; min-width: max-content; }
    .board-row:hover { background: var(--bg-hover) !important; }
    .board-row.is-selected { background: var(--brand-ambient) !important; z-index: 5; }

    .board-tech-info { 
      width: 280px; min-width: 280px; max-width: 280px; flex-shrink: 0; padding: 1rem 2rem; display: flex; align-items: center; gap: 1rem; 
      border-right: 2px solid rgba(255,255,255,0.08); background: inherit; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;
    }
    
/* When board-tech is collapsed in team view */
    .board-tech-collapsed .board-tech-info,
    .board-tech-collapsed .sticky-col {
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      border-right: none !important;
      opacity: 0;
      pointer-events: none;
    }

    .mini-avatar {
      width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 900; font-size: 0.75rem; flex-shrink: 0;
    }
    .mini-meta { display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
    .mini-meta .n { font-weight: 850; font-size: 0.8rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mini-meta .r { font-size: 0.6rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .board-day-cell { 
      width: 52px; min-width: 52px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      border-right: 1px solid rgba(255,255,255,0.05); background: inherit;
    }
    .board-day-cell.is-today { background: rgba(var(--brand-rgb, 239, 68, 68), 0.04); }
    
    .status-chip { width: 24px; height: 16px; border-radius: 3px; border: 1.5px solid rgba(255,255,255,0.4); }
    .status-chip.AVAILABLE { background: #10b981 !important; }
    .status-chip.UNAVAILABLE { background: #ef4444 !important; }
    .status-chip.HOLIDAY { background: #3b82f6 !important; }
    .status-chip.SICK_LEAVE { background: #f59e0b !important; }

    .sticky-col { position: sticky; left: 0; z-index: 20; background: inherit; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
    
    .team-board-scroll-wrap { 
      position: relative; width: 100%; border-radius: var(--avail-panel-radius); 
      overflow: hidden; border: 1px solid var(--avail-soft-border); 
      background: var(--surface);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 18px -8px rgba(15, 23, 42, 0.08);
    }
    .team-board-scroll { overflow-x: auto; width: 100%; display: block; scroll-behavior: smooth; }

    .team-board-toolbar__meta {
      flex: 1 1 220px;
      min-width: 0;
    }

    /* BABOONI — refinado alineado con el resto del ERP */
    :host-context(html[data-erp-tenant='babooni']) {
      --avail-card-bg: var(--surface);
      --avail-border: color-mix(in srgb, var(--border-soft) 75%, transparent);
      --avail-panel-radius: 12px;
    }

    :host-context(html[data-erp-tenant='babooni']) .dashboard-toolbar {
      background: var(--surface);
      border-color: var(--avail-border);
      border-radius: var(--avail-panel-radius);
      padding: 0.75rem 1rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 14px -6px rgba(15, 23, 42, 0.06);
      backdrop-filter: none;
    }

    :host-context(html[data-erp-tenant='babooni']) .legal-hint {
      background: color-mix(in srgb, var(--info, #3b82f6) 6%, var(--surface));
      border-color: color-mix(in srgb, var(--info, #3b82f6) 18%, var(--border-soft));
    }

    :host-context(html[data-erp-tenant='babooni']) .nav-btn,
    :host-context(html[data-erp-tenant='babooni']) .month-navigator,
    :host-context(html[data-erp-tenant='babooni']) .personal-scope-toggle,
    :host-context(html[data-erp-tenant='babooni']) .view-toggle {
      border-radius: 10px;
      border-color: var(--avail-border);
      background: var(--bg-secondary);
    }

    :host-context(html[data-erp-tenant='babooni']) a.request-days-btn,
    :host-context(html[data-erp-tenant='babooni']) .request-days-btn {
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 16px -4px color-mix(in srgb, var(--brand) 32%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .calendar-legend {
      background: var(--bg-secondary);
      border-color: var(--avail-border);
    }

    :host-context(html[data-erp-tenant='babooni']) .legend-item {
      border-right-color: var(--avail-border);
      color: var(--text-secondary);
    }

    :host-context(html[data-erp-tenant='babooni']) .legend-item:hover {
      background: color-mix(in srgb, var(--brand) 5%, var(--surface));
    }

    :host-context(html[data-erp-tenant='babooni']) .tech-card {
      background: var(--surface);
      backdrop-filter: none;
      border: 1px solid var(--avail-border);
      border-radius: 12px;
      box-shadow: none;
      padding: 0.7rem 0.85rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .tech-card.selected {
      background: color-mix(in srgb, var(--brand) 5%, var(--surface));
      border-color: color-mix(in srgb, var(--brand) 40%, var(--border-soft));
      box-shadow: inset 3px 0 0 var(--brand);
      transform: none;
    }

    :host-context(html[data-erp-tenant='babooni']) .calendar-card,
    :host-context(html[data-erp-tenant='babooni']) .team-board-card {
      background: var(--surface) !important;
      backdrop-filter: none;
      border: 1px solid var(--avail-border) !important;
      border-radius: var(--avail-panel-radius) !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 20px -8px rgba(15, 23, 42, 0.08) !important;
    }

    :host-context(html[data-erp-tenant='babooni']) .sidebar-header {
      padding: 0.55rem 0.85rem;
      padding-right: 2.5rem;
      background: var(--bg-secondary);
      backdrop-filter: none;
      border-radius: 10px;
      border: 1px solid var(--avail-border);
      margin-bottom: 0.5rem;
      box-shadow: none;
    }

    :host-context(html[data-erp-tenant='babooni']) .team-board-scroll-wrap {
      border-color: var(--avail-border);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 18px -8px rgba(15, 23, 42, 0.08);
      border-radius: var(--avail-panel-radius);
    }

    :host-context(html[data-erp-tenant='babooni']) .sidebar-toggle-btn {
      background: var(--surface);
      color: var(--text-secondary);
      border: 1px solid var(--avail-border);
      box-shadow: none;
    }

    :host-context(html[data-erp-tenant='babooni']) .sidebar-toggle-btn:hover {
      color: var(--brand);
      border-color: color-mix(in srgb, var(--brand) 30%, var(--border-soft));
      transform: translateY(-50%);
      box-shadow: none;
    }

    :host-context(html[data-erp-tenant='babooni']) .calendar-cell {
      background: var(--bg-secondary);
      border-color: var(--avail-border);
    }

    :host-context(html[data-erp-tenant='babooni']) .calendar-cell.today {
      background: color-mix(in srgb, var(--brand) 5%, var(--surface));
    }
  `]

})
export class TechnicianAvailabilityComponent implements OnInit, OnDestroy, FilterableService<Technician> {
  /** Alineado con CSS `--avail-persona-width` / `--avail-day-cell-width`. */
  private static readonly TEAM_PERSONA_PX = 280;
  private static readonly TEAM_DAY_PX = 52;

  /**
   * Trocea el filtro del cuadrante: `,` `;` `|` o saltos de línea = varios operarios o criterios (**OR**).
   * Dentro de cada trozo, varias palabras deben cumplirse todas (**AND**) sobre nombre + rol.
   */
  private static teamBoardFilterSegments(raw: string): string[] {
    return raw
      .split(/[,;\n|]+/u)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
  }

  private static teamBoardFilterSegmentCount(raw: string): number {
    return TechnicianAvailabilityComponent.teamBoardFilterSegments(raw).length;
  }

  /** Incluye al técnico si coincide **algún** trozo con nombre o rol (visión panorámica multi-persona). */
  private static matchesTeamBoardFilter(t: Technician, raw: string): boolean {
    const q = raw.trim();
    if (!q) {
      return true;
    }
    const segments = TechnicianAvailabilityComponent.teamBoardFilterSegments(q);
    if (segments.length === 0) {
      return true;
    }
    const hay = `${t.name} ${t.role}`.toLowerCase();
    return segments.some((segment) => {
      const words = segment.split(/\s+/u).filter(Boolean);
      if (words.length === 0) {
        return false;
      }
      return words.every((w) => hay.includes(w));
    });
  }

  private static pad2(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private static toIso(y: number, month0: number, d: number): string {
    return `${y}-${TechnicianAvailabilityComponent.pad2(month0 + 1)}-${TechnicianAvailabilityComponent.pad2(d)}`;
  }

  /** Lunes de la semana local que contiene `ref` (solo fecha). */
  private static mondayOfWeekContaining(ref: Date): Date {
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
    const sinceMon = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - sinceMon);
    return d;
  }

  /** Domingo de la semana que contiene `ref`. */
  private static sundayOfWeekContaining(ref: Date): Date {
    const m = TechnicianAvailabilityComponent.mondayOfWeekContaining(ref);
    const s = new Date(m.getFullYear(), m.getMonth(), m.getDate());
    s.setDate(s.getDate() + 6);
    return s;
  }

  private static buildMonthAlignedPersonalCells(
    focusY: number,
    focusM: number,
    now: Date,
  ): PersonalGridCell[] {
    const dim = new Date(focusY, focusM + 1, 0).getDate();
    const start = TechnicianAvailabilityComponent.mondayOfWeekContaining(new Date(focusY, focusM, 1));
    const end = TechnicianAvailabilityComponent.sundayOfWeekContaining(new Date(focusY, focusM, dim));
    const out: PersonalGridCell[] = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endT = end.getTime();
    while (cur.getTime() <= endT) {
      const yy = cur.getFullYear();
      const mm = cur.getMonth();
      const dd = cur.getDate();
      const iso = TechnicianAvailabilityComponent.toIso(yy, mm, dd);
      const isTo = now.getFullYear() === yy && now.getMonth() === mm && now.getDate() === dd;
      out.push({
        kind: 'day',
        day: dd,
        year: yy,
        month: mm,
        isInFocusMonth: yy === focusY && mm === focusM,
        isToday: isTo,
        date: iso,
      });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  private static buildWeekPersonalCells(monday: Date, focusY: number, focusM: number, now: Date): PersonalGridCell[] {
    const out: PersonalGridCell[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
      d.setDate(d.getDate() + i);
      const yy = d.getFullYear();
      const mm = d.getMonth();
      const dd = d.getDate();
      const iso = TechnicianAvailabilityComponent.toIso(yy, mm, dd);
      const isTo = now.getFullYear() === yy && now.getMonth() === mm && now.getDate() === dd;
      out.push({
        kind: 'day',
        day: dd,
        year: yy,
        month: mm,
        isInFocusMonth: yy === focusY && mm === focusM,
        isToday: isTo,
        date: iso,
      });
    }
    return out;
  }

  /** Tras «Ir a hoy», centrar el día actual en el cuadrante de equipo cuando termine la carga. */
  private scrollTeamToTodayAfterLoad = false;

  private readonly api = inject(TechnicianApiService);
  private readonly toast = inject(ToastService);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly authStore = inject(GlobalAuthStore);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private compactTeamMql?: MediaQueryList;
  private readonly onCompactTeamMqlChange = (): void => {
    this.isCompactTeamNav.set(!!this.compactTeamMql?.matches);
  };

  private readonly onWindowResize = (): void => {
    this.refreshTeamHorizontalMetrics();
  };
  readonly canAccess = rbacAllows(this.authStore, 'users.view', 'users.manage');
  /** RRHH / admin: ve equipo completo y puede aprobar solicitudes. */
  readonly canManageTeam = rbacAllows(this.authStore, 'users.manage');

  /** Técnico vinculado al usuario logueado (mismo `userId`). */
  myTechnicianId = signal<string | null>(null);

  readonly displayedTechnicians = computed(() => {
    const all = this.technicians();
    if (this.canManageTeam()) {
      return all;
    }
    const mid = this.myTechnicianId();
    if (!mid) {
      return all;
    }
    const row = all.filter((t) => t.id === mid);
    return row.length ? row : all;
  });

  /**
   * Búsqueda unificada (sidebar vista individual + cuadrante equipo): mismas reglas multi-término.
   */
  availabilitySearchQuery = signal('');

  /** Lista lateral en vista individual (filtrada por `availabilitySearchQuery`). */
  readonly personalSidebarTechnicians = computed(() => {
    const list = this.displayedTechnicians();
    const raw = this.availabilitySearchQuery();
    return list.filter((t) =>
      TechnicianAvailabilityComponent.matchesTeamBoardFilter(t, raw),
    );
  });

  /** Filas del cuadrante de equipo (misma lista que Operarios, sin duplicar barra lateral). */
  readonly teamBoardRows = computed(() => {
    const list = this.displayedTechnicians();
    const raw = this.availabilitySearchQuery();
    return list.filter((t) =>
      TechnicianAvailabilityComponent.matchesTeamBoardFilter(t, raw),
    );
  });

  readonly teamBoardHintCounts = computed(() => {
    const total = this.displayedTechnicians().length;
    const shown = this.teamBoardRows().length;
    const q = this.availabilitySearchQuery().trim();
    if (q && shown !== total) {
      const nSeg =
        TechnicianAvailabilityComponent.teamBoardFilterSegmentCount(q);
      const segHint = nSeg > 1 ? ` · ${nSeg} criterios (OR)` : '';
      return `${shown} de ${total} operarios visibles${segHint}`;
    }
    if (q && shown === total) {
      return `${total} operarios (todos coinciden con el filtro)`;
    }
    return `${total} operarios`;
  });

  /** Solo gestores pueden preseleccionar técnico en «Pedir días». */
  readonly pedirDiasQueryParams = computed(() => {
    if (this.canManageTeam()) {
      return { techId: this.selectedTechId() };
    }
    return {} as Record<string, string>;
  });

  /** Conteos por estado para el técnico seleccionado (mes completo o semana visible según alcance). */
  readonly personalMonthSummary = computed(() => {
    const id = this.selectedTechId();
    let available = 0;
    let unavailable = 0;
    let holiday = 0;
    let incident = 0;
    if (this.personalCalendarScope() === 'week') {
      for (const c of this.personalCalendarCells()) {
        const st = this.getTechStatusByIso(id, c.date);
        switch (st) {
          case 'UNAVAILABLE':
            unavailable++;
            break;
          case 'HOLIDAY':
            holiday++;
            break;
          case 'SICK_LEAVE':
            incident++;
            break;
          default:
            available++;
            break;
        }
      }
      return {
        available,
        unavailable,
        holiday,
        incident,
        days: this.personalCalendarCells().length,
      };
    }
    const map = this.teamAvailability()[id] ?? {};
    for (const c of this.monthDays()) {
      const st = map[c.day] ?? 'AVAILABLE';
      switch (st) {
        case 'UNAVAILABLE':
          unavailable++;
          break;
        case 'HOLIDAY':
          holiday++;
          break;
        case 'SICK_LEAVE':
          incident++;
          break;
        default:
          available++;
          break;
      }
    }
    return {
      available,
      unavailable,
      holiday,
      incident,
      days: this.monthDays().length,
    };
  });

  monthDays = signal<MonthDayCell[]>([]);
  /** Mes completo alineado a semanas ISO (lunes) o 7 días en vista semanal. */
  personalCalendarScope = signal<'month' | 'week'>('month');
  /** Lunes de la semana en vista semanal (null → semana actual al entrar). */
  weekViewMonday = signal<{ y: number; m: number; d: number } | null>(null);
  shortcutsHelpOpen = signal(false);

  viewMode = signal<'personal' | 'team'>('personal');
  selectedTechId = signal<string>('me');
  sidebarCollapsed = signal<boolean>(false);

  teamAvailability = signal<Record<string, Record<number, string>>>({});
  /** Cobertura por fecha ISO (YYYY-MM-DD) para celdas fuera del mes o vista semanal. */
  teamAvailabilityIso = signal<Record<string, Record<string, string>>>({});

  readonly personalCalendarCells = computed(() => {
    const focusY = this.currentYear();
    const focusM = this.currentMonth();
    const now = new Date();
    if (this.personalCalendarScope() === 'week') {
      const wa = this.weekViewMonday();
      const mon = wa
        ? new Date(wa.y, wa.m, wa.d)
        : TechnicianAvailabilityComponent.mondayOfWeekContaining(now);
      return TechnicianAvailabilityComponent.buildWeekPersonalCells(mon, focusY, focusM, now);
    }
    return TechnicianAvailabilityComponent.buildMonthAlignedPersonalCells(focusY, focusM, now);
  });

  readonly weekRangeLabel = computed(() => {
    if (this.personalCalendarScope() !== 'week') {
      return '';
    }
    const cells = this.personalCalendarCells();
    if (cells.length < 1) {
      return '';
    }
    const a = cells[0];
    const b = cells[cells.length - 1];
    const sm = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
    return `${a.day} ${sm[a.month]} – ${b.day} ${sm[b.month]} ${b.year}`;
  });
  
  technicians = signal<Technician[]>([]);

  readonly isLoading = signal<boolean>(false);
  /**
   * `none`: datos coherentes con el API.
   * `partial`: algún técnico o rango falló; se rellenó con valores por defecto deterministas.
   * `full`: falló la lista de técnicos u otra condición crítica; lista vacía hasta reintentar.
   */
  readonly availabilityLoadIssue = signal<'none' | 'partial' | 'full'>('none');

  /** Barra «día X de Y» y saltos ±7: solo vista compacta (móvil / tablet estrecha). */
  readonly isCompactTeamNav = signal(false);

  /** Estado del scroll horizontal del cuadrante (indicador de días). */
  private readonly teamHScrollState = signal({ scrollLeft: 0, clientWidth: 720, scrollWidth: 720 });

  readonly teamScrollLabel = computed(() => {
    const total = this.monthDays().length;
    const { scrollLeft, clientWidth, scrollWidth } = this.teamHScrollState();
    const pw = TechnicianAvailabilityComponent.TEAM_PERSONA_PX;
    if (total < 1) {
      return { from: 1, to: 1, center: 1, total: 0 };
    }
    /** Mes completo visible (columnas fluidas): sin scroll horizontal útil. */
    if (scrollWidth <= clientWidth + 2 || clientWidth < 24) {
      const today =
        this.monthDays().find((c) => c.isToday)?.day ??
        Math.min(total, Math.max(1, Math.ceil(total / 2)));
      return { from: 1, to: total, center: today, total };
    }
    const dayW = Math.max(1, (scrollWidth - pw) / total);
    const inner = scrollLeft + clientWidth;
    let from = 1;
    if (scrollLeft > pw - 1) {
      from = Math.max(1, Math.floor((scrollLeft - pw + 1e-6) / dayW) + 1);
    }
    const rawTo = Math.ceil((Math.max(inner, pw) - pw) / dayW);
    const to = Math.min(total, Math.max(from, rawTo));
    const cx = scrollLeft + clientWidth / 2;
    let center = Math.floor((cx - pw) / dayW) + 1;
    if (cx <= pw) {
      center = 1;
    }
    center = Math.max(1, Math.min(total, center));
    return { from: Math.min(from, to), to, center, total };
  });

  /** Mini barra proporcional bajo el scroll horizontal cuando hay overflow (viewport vs contenido). */
  readonly teamHScrollUi = computed(() => {
    const { scrollLeft, clientWidth, scrollWidth } = this.teamHScrollState();
    if (scrollWidth <= clientWidth + 2 || scrollWidth < 24) {
      return { overflow: false as const, thumbW: 0, thumbLeft: 0 };
    }
    const max = scrollWidth - clientWidth;
    const thumbW = (clientWidth / scrollWidth) * 100;
    const thumbLeft = max > 1e-6 ? (scrollLeft / max) * (100 - thumbW) : 0;
    return { overflow: true as const, thumbW, thumbLeft };
  });

  currentMonth = signal<number>(new Date().getMonth());
  currentYear = signal<number>(new Date().getFullYear());

  constructor() {
    effect(() => {
      this.initCalendarCells();
      // Cuando cambia mes/año, recargamos datos del servidor
      void this.loadMonth();
    }, { allowSignalWrites: true });
    effect(
      () => {
        if (!this.canManageTeam()) {
          this.viewMode.set('personal');
        }
      },
      { allowSignalWrites: true },
    );
     effect(() => {
      if (this.viewMode() === 'team') {
        queueMicrotask(() => {
          requestAnimationFrame(() =>
            requestAnimationFrame(() => this.refreshTeamHorizontalMetrics()),
          );
        });
      }
    });
    // Auto-collapse en pantallas pequeñas
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(max-width: 1200px)');
      this.sidebarCollapsed.set(mql.matches);
      mql.addEventListener('change', (e) => {
        this.sidebarCollapsed.set(e.matches);
      });
    }
  }

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.compactTeamMql = window.matchMedia('(max-width: 900px)');
      this.compactTeamMql.addEventListener('change', this.onCompactTeamMqlChange);
      this.isCompactTeamNav.set(this.compactTeamMql.matches);
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
    this.compactTeamMql?.removeEventListener('change', this.onCompactTeamMqlChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onWindowResize);
    }
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Technician[]> {
    const pool = this.displayedTechnicians();
    const matches = pool.filter((t: Technician) =>
      TechnicianAvailabilityComponent.matchesTeamBoardFilter(t, query),
    );
    return of(matches);
  }

  onSearch(term: string) {
    this.availabilitySearchQuery.set(term);
    this.masterFilter.search(term);
    if (this.viewMode() !== 'personal') {
      return;
    }
    const q = term.trim();
    if (!q) {
      return;
    }
    const pool = this.personalSidebarTechnicians();
    const match = pool.find((t: Technician) =>
      TechnicianAvailabilityComponent.matchesTeamBoardFilter(t, q),
    );
    if (match) {
      this.selectedTechId.set(match.id);
    }
  }

  /** Reinicia la búsqueda en sidebar y cuadrante (misma señal). */
  clearAvailabilitySearch(): void {
    this.onSearch('');
  }

  onTeamHorizontalScroll(ev: Event): void {
    const el = ev.currentTarget as HTMLElement;
    this.teamHScrollState.set({
      scrollLeft: el.scrollLeft,
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    });
  }

  scrollTeamHorizontalByDays(deltaDays: number): void {
    const el = this.hostEl.nativeElement.querySelector('.team-board-scroll') as HTMLElement | null;
    if (!el) {
      return;
    }
    const total = this.monthDays().length;
    const pw = TechnicianAvailabilityComponent.TEAM_PERSONA_PX;
    const dayW = total > 0 ? Math.max(1, (el.scrollWidth - pw) / total) : TechnicianAvailabilityComponent.TEAM_DAY_PX;
    el.scrollBy({ left: deltaDays * dayW, behavior: 'smooth' });
    queueMicrotask(() => this.refreshTeamHorizontalMetrics());
  }

  scrollTeamHorizontalToToday(): void {
    const cells = this.monthDays();
    const todayCell = cells.find((c) => c.isToday);
    const day = todayCell?.day ?? cells[0]?.day ?? 1;
    this.scrollTeamHorizontalToDay(day);
  }

  scrollTeamHorizontalToDay(day: number): void {
    const total = this.monthDays().length;
    const d = Math.max(1, Math.min(total, day));
    const header = this.hostEl.nativeElement.querySelector(
      `.board-header .day-header-col[data-team-day="${d}"]`,
    ) as HTMLElement | null;
    const container = this.hostEl.nativeElement.querySelector('.team-board-scroll') as HTMLElement | null;
    if (!header || !container) {
      return;
    }
    if (container.scrollWidth <= container.clientWidth + 2) {
      header.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      const pw = TechnicianAvailabilityComponent.TEAM_PERSONA_PX;
      const dayW = total > 0 ? Math.max(1, (container.scrollWidth - pw) / total) : TechnicianAvailabilityComponent.TEAM_DAY_PX;
      const ideal = pw + (d - 0.5) * dayW - container.clientWidth / 2;
      const max = Math.max(0, container.scrollWidth - container.clientWidth);
      container.scrollTo({ left: Math.max(0, Math.min(max, ideal)), behavior: 'smooth' });
    }
    queueMicrotask(() => this.refreshTeamHorizontalMetrics());
  }

  private refreshTeamHorizontalMetrics(): void {
    const el = this.hostEl.nativeElement.querySelector('.team-board-scroll') as HTMLElement | null;
    if (!el) {
      return;
    }
    this.teamHScrollState.set({
      scrollLeft: el.scrollLeft,
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    });
  }

  getMonthName(): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[this.currentMonth()];
  }

  nextMonth() {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y: number) => y + 1);
    } else {
      this.currentMonth.update((m: number) => m + 1);
    }
  }

  prevMonth() {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y: number) => y - 1);
    } else {
      this.currentMonth.update((m: number) => m - 1);
    }
  }

  /** Salta al mes y año actuales; en vista equipo desplaza el scroll al día de hoy tras cargar. */
  goToToday(): void {
    const n = new Date();
    if (this.viewMode() === 'personal' && this.personalCalendarScope() === 'week') {
      const mon = TechnicianAvailabilityComponent.mondayOfWeekContaining(n);
      this.weekViewMonday.set({ y: mon.getFullYear(), m: mon.getMonth(), d: mon.getDate() });
      this.currentYear.set(mon.getFullYear());
      this.currentMonth.set(mon.getMonth());
      return;
    }
    const alreadyThisMonth =
      this.currentMonth() === n.getMonth() && this.currentYear() === n.getFullYear();
    this.currentMonth.set(n.getMonth());
    this.currentYear.set(n.getFullYear());
    if (this.viewMode() !== 'team') {
      return;
    }
    if (alreadyThisMonth) {
      queueMicrotask(() =>
        requestAnimationFrame(() => this.scrollTeamHorizontalToToday()),
      );
    } else {
      this.scrollTeamToTodayAfterLoad = true;
    }
  }

  calendarNavPrev(): void {
    if (this.viewMode() === 'personal' && this.personalCalendarScope() === 'week') {
      this.shiftWeek(-1);
      return;
    }
    this.prevMonth();
  }

  calendarNavNext(): void {
    if (this.viewMode() === 'personal' && this.personalCalendarScope() === 'week') {
      this.shiftWeek(1);
      return;
    }
    this.nextMonth();
  }

  private shiftWeek(deltaWeeks: number): void {
    const wa = this.weekViewMonday();
    const mon = wa
      ? new Date(wa.y, wa.m, wa.d)
      : TechnicianAvailabilityComponent.mondayOfWeekContaining(new Date());
    mon.setDate(mon.getDate() + deltaWeeks * 7);
    this.weekViewMonday.set({ y: mon.getFullYear(), m: mon.getMonth(), d: mon.getDate() });
    this.currentYear.set(mon.getFullYear());
    this.currentMonth.set(mon.getMonth());
  }

  setPersonalCalendarScope(scope: 'month' | 'week'): void {
    this.personalCalendarScope.set(scope);
    if (scope === 'week' && !this.weekViewMonday()) {
      const n = new Date();
      const mon = TechnicianAvailabilityComponent.mondayOfWeekContaining(n);
      this.weekViewMonday.set({ y: mon.getFullYear(), m: mon.getMonth(), d: mon.getDate() });
      this.currentYear.set(mon.getFullYear());
      this.currentMonth.set(mon.getMonth());
    }
  }

  exportAvailabilityCsv(): void {
    const sep = ';';
    const nl = '\r\n';
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows: string[][] = [];
    const monthLabel = `${this.getMonthName()} ${this.currentYear()}`;
    let fileSuffix = '';
    if (this.viewMode() === 'team') {
      rows.push(['Cuadrante equipo', monthLabel, '', ...this.monthDays().map((c) => String(c.day))]);
      for (const tech of this.teamBoardRows()) {
        rows.push([
          tech.name,
          tech.role,
          '',
          ...this.monthDays().map((d) => this.getShortLabel(this.getTechDayStatus(tech.id, d.day))),
        ]);
      }
    } else {
      const tech = this.technicians().find((t) => t.id === this.selectedTechId());
      const name = tech?.name ?? 'Técnico';
      const cells = this.personalCalendarCells();
      const scopeLine =
        this.personalCalendarScope() === 'week'
          ? `Semana (${this.weekRangeLabel()})`
          : `Mes (${monthLabel})`;
      rows.push([`Disponibilidad`, name, scopeLine]);
      rows.push(['Día', 'Fecha', 'Estado']);
      const sid = this.selectedTechId();
      for (const c of cells) {
        rows.push([
          String(c.day),
          c.date,
          this.getShortLabel(this.getTechStatusByIso(sid, c.date)),
        ]);
      }
      if (this.personalCalendarScope() === 'week' && cells.length > 0) {
        fileSuffix = `-sem-${cells[0].date}`;
      }
    }
    const body = rows.map((r) => r.map(escape).join(sep)).join(nl);
    const bom = '\ufeff';
    const blob = new Blob([bom + body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disponibilidad-${this.currentYear()}-${TechnicianAvailabilityComponent.pad2(this.currentMonth() + 1)}${fileSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show('CSV descargado', 'success');
  }

  toggleShortcutsHelp(): void {
    this.shortcutsHelpOpen.update((v) => !v);
  }

  initCalendarCells() {
    const cells: MonthDayCell[] = [];
    const y = this.currentYear();
    const m0 = this.currentMonth();
    const daysInMonth = new Date(y, m0 + 1, 0).getDate();
    const now = new Date();
    const isCurMonth = now.getMonth() === m0 && now.getFullYear() === y;

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isToday: isCurMonth && i === now.getDate(),
        date: TechnicianAvailabilityComponent.toIso(y, m0, i),
      });
    }
    this.monthDays.set(cells);
  }

  async loadMonth() {
    this.isLoading.set(true);
    this.availabilityLoadIssue.set('none');
    let partialFailures = 0;
    try {
      const techsResponse = await firstValueFrom(this.api.getTechnicians());

      const realTechs: Technician[] = (techsResponse ?? []).map((t: ApiTechnician) => ({
        id: t.id,
        userId: t.user?.id,
        name: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() || t.user?.email || 'Técnico',
        role: t.skills?.[0] || 'Personal Técnico',
        status: 'online' as const,
      }));

      this.technicians.set(realTechs);

      const uid = this.authStore.user()?.id;
      let mineTechId: string | null = null;
      if (uid) {
        const mine = realTechs.find((x) => x.userId === uid);
        if (mine) {
          mineTechId = mine.id;
        }
      }
      this.myTechnicianId.set(mineTechId);

      const year = this.currentYear();
      const month = this.currentMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const rangeStart = TechnicianAvailabilityComponent.mondayOfWeekContaining(new Date(year, month, 1));
      const rangeEnd = TechnicianAvailabilityComponent.sundayOfWeekContaining(new Date(year, month, daysInMonth));
      const startDate = TechnicianAvailabilityComponent.toIso(
        rangeStart.getFullYear(),
        rangeStart.getMonth(),
        rangeStart.getDate(),
      );
      const endDate = TechnicianAvailabilityComponent.toIso(
        rangeEnd.getFullYear(),
        rangeEnd.getMonth(),
        rangeEnd.getDate(),
      );

      const data: Record<string, Record<number, any>> = {};

      await Promise.all(
        realTechs.map(async (tech) => {
          try {
            const avail = await firstValueFrom(
              this.api.getAvailability(tech.id, startDate, endDate),
            );

            data[tech.id] = {};
            for (let d = 1; d <= daysInMonth; d++) {
              data[tech.id][d] = { type: this.defaultDayStatus(year, month, d) };
            }
            (avail ?? []).forEach((a: TechnicianAvailability) => {
              const dayNum = this.dayNumberFromAvailability(a);
              if (dayNum < 1 || dayNum > daysInMonth) {
                return;
              }
              data[tech.id][dayNum] = {
                ...a,
                type: this.normalizeAvailabilityType(a.type)
              };
            });
          } catch {
            partialFailures++;
            data[tech.id] = {};
            for (let d = 1; d <= daysInMonth; d++) {
              data[tech.id][d] = { type: this.defaultDayStatus(year, month, d) };
            }
          }
        }),
      );

      this.teamAvailability.set(data);
      this.syncIsoMapsFromAvailabilityData(year, month, data);

      if (partialFailures > 0) {
        this.availabilityLoadIssue.set('partial');
      }

      if (!this.canManageTeam() && mineTechId) {
        this.selectedTechId.set(mineTechId);
      } else if (!this.selectedTechId() || this.selectedTechId() === 'me') {
        this.selectedTechId.set(realTechs[0]?.id ?? 'me');
      }
    } catch (error) {
      console.warn('Error syncing technicians / availability:', error);
      this.availabilityLoadIssue.set('full');
      this.technicians.set([]);
      this.teamAvailability.set({});
      this.teamAvailabilityIso.set({});
      this.selectedTechId.set('me');
    } finally {
      this.isLoading.set(false);
      queueMicrotask(() => this.refreshTeamHorizontalMetrics());
      if (this.scrollTeamToTodayAfterLoad) {
        this.scrollTeamToTodayAfterLoad = false;
        queueMicrotask(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => this.scrollTeamHorizontalToToday()),
          ),
        );
      }
    }
  }

  /** Laborable disponible, fin de semana no disponible (sin aleatoriedad). */
  private defaultDayStatus(year: number, month0: number, day: number): string {
    const wd = new Date(year, month0, day).getDay();
    return wd === 0 || wd === 6 ? 'UNAVAILABLE' : 'AVAILABLE';
  }

  /** Alinea tipos del API con chips del calendario. */
  private normalizeAvailabilityType(type: string): string {
    if (type === 'PARTIAL') {
      return 'UNAVAILABLE';
    }
    return type;
  }

  /** Día del mes (1–31) a partir del registro de disponibilidad del API. */
  private dayNumberFromAvailability(a: TechnicianAvailability): number {
    const withPrisma = a as TechnicianAvailability & { startDate?: string };
    const iso = withPrisma.date ?? withPrisma.startDate;
    return iso ? new Date(iso).getDate() : 0;
  }

  /** Estado por fecha ISO (vista calendario alineada o semanal). */
  getTechStatusByIso(techId: string, iso: string): any {
    const by = this.teamAvailabilityIso()[techId];
    if (by?.[iso]) {
      return by[iso];
    }
    const parts = iso.split('-');
    if (parts.length !== 3) {
      return { type: 'AVAILABLE' };
    }
    const y = +parts[0];
    const m0 = +parts[1] - 1;
    const d = +parts[2];
    if (y === this.currentYear() && m0 === this.currentMonth()) {
      return this.getTechDayStatus(techId, d);
    }
    return { type: 'AVAILABLE' };
  }

  getTechDayStatus(techId: string, day: number): any {
    return this.teamAvailability()[techId]?.[day] || { type: 'AVAILABLE' };
  }

  isWeekendYmd(y: number, m: number, d: number): boolean {
    const wd = new Date(y, m, d).getDay();
    return wd === 0 || wd === 6;
  }

  private syncIsoMapsFromAvailabilityData(
    year: number,
    month: number,
    data: Record<string, Record<number, any>>,
  ): void {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const start = TechnicianAvailabilityComponent.mondayOfWeekContaining(new Date(year, month, 1));
    const end = TechnicianAvailabilityComponent.sundayOfWeekContaining(new Date(year, month, daysInMonth));
    const endT = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    const out: Record<string, Record<string, any>> = {};
    for (const techId of Object.keys(data)) {
      out[techId] = {};
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      while (cur.getTime() <= endT) {
        const yy = cur.getFullYear();
        const mm = cur.getMonth();
        const dd = cur.getDate();
        const iso = TechnicianAvailabilityComponent.toIso(yy, mm, dd);
        if (yy === year && mm === month) {
          out[techId][iso] = data[techId][dd] ?? { type: 'AVAILABLE' };
        } else {
          const wd = cur.getDay();
          out[techId][iso] = { type: wd === 0 || wd === 6 ? 'UNAVAILABLE' : 'AVAILABLE' };
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    this.teamAvailabilityIso.set(out);
  }

  getSelectedTechName(): string {
    return this.technicians().find((t: Technician) => t.id === this.selectedTechId())?.name || '';
  }

  getShortLabel(type: string): string {
    const labels: Record<string, string> = {
      AVAILABLE: 'DISPONIBLE',
      UNAVAILABLE: 'NO DISP.',
      HOLIDAY: 'VACACIONES',
      SICK_LEAVE: 'INCIDENCIA'
    };
    return labels[type] || type;
  }

  /** Etiqueta corta para celdas del calendario mensual (caben en columnas estrechas). */
  getCellStatusAbbrev(type: string): string {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disp.',
      UNAVAILABLE: 'Ocup.',
      HOLIDAY: 'Vac.',
      SICK_LEAVE: 'Inc.',
    };
    return labels[type] || type;
  }

  getAvatarColor(name: string): string {
    const colors = ['#4338ca', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getDayOfWeekName(day: number): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const date = new Date(this.currentYear(), this.currentMonth(), day); 
    return days[date.getDay()];
  }

  /** Abreviatura de tres letras (Lun, Mar…) para cabecera del cuadrante de equipo. */
  getDayOfWeekShort(day: number): string {
    return this.getDayOfWeekName(day).substring(0, 3);
  }

  /** Sábado / domingo para resaltar columnas en vista equipo. */
  isWeekend(day: number): boolean {
    const d = new Date(this.currentYear(), this.currentMonth(), day);
    const wd = d.getDay();
    return wd === 0 || wd === 6;
  }

  @HostListener('document:keydown', ['$event'])
  handleAvailabilityHotkeys(ev: KeyboardEvent): void {
    if (!this.canAccess()) {
      return;
    }
    if (ev.defaultPrevented) {
      return;
    }
    const el = ev.target as HTMLElement | null;
    if (TechnicianAvailabilityComponent.shouldIgnoreAvailabilityHotkeys(el)) {
      return;
    }
    if (ev.ctrlKey || ev.metaKey || ev.altKey) {
      return;
    }
    switch (ev.key) {
      case 't':
      case 'T':
        ev.preventDefault();
        this.goToToday();
        break;
      case 'e':
      case 'E':
        ev.preventDefault();
        this.exportAvailabilityCsv();
        break;
      case '?':
        ev.preventDefault();
        this.toggleShortcutsHelp();
        break;
      case 'Escape':
        if (this.shortcutsHelpOpen()) {
          ev.preventDefault();
          this.shortcutsHelpOpen.set(false);
        } else if (this.availabilitySearchQuery().trim()) {
          ev.preventDefault();
          this.clearAvailabilitySearch();
        }
        break;
      case 'ArrowLeft':
        if (this.viewMode() === 'personal') {
          ev.preventDefault();
          this.calendarNavPrev();
        }
        break;
      case 'ArrowRight':
        if (this.viewMode() === 'personal') {
          ev.preventDefault();
          this.calendarNavNext();
        }
        break;
      case '1':
        if (this.canManageTeam()) {
          ev.preventDefault();
          this.viewMode.set('personal');
        }
        break;
      case '2':
        if (this.canManageTeam()) {
          ev.preventDefault();
          this.viewMode.set('team');
        }
        break;
      case 'm':
      case 'M':
        if (this.viewMode() === 'personal') {
          ev.preventDefault();
          this.setPersonalCalendarScope('month');
        }
        break;
      case 'w':
      case 'W':
        if (this.viewMode() === 'personal') {
          ev.preventDefault();
          this.setPersonalCalendarScope('week');
        }
        break;
      default:
        break;
    }
  }

  /**
   * No capturar atajos cuando el foco está en campos de texto, overlays (CDK/Material) o
   * diálogos ajenos a esta pantalla — evita cerrar menús / modales o interferir con Escape.
   * El popover de atajos (`.shortcuts-popover`) sí se gestiona aquí.
   */
  private static shouldIgnoreAvailabilityHotkeys(el: HTMLElement | null): boolean {
    if (!el) {
      return true;
    }
    if (
      el.closest(
        'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="searchbox"], [role="menu"], [role="menubar"], [role="listbox"], [role="option"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]',
      )
    ) {
      return true;
    }
    if (el.closest('.cdk-overlay-container, .cdk-overlay-pane, .cdk-global-overlay-wrapper')) {
      return true;
    }
    const dlg = el.closest('[role="dialog"], [role="alertdialog"]');
    if (dlg instanceof HTMLElement && !dlg.classList.contains('shortcuts-popover')) {
      return true;
    }
    return false;
  }

}
