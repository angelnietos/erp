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
              <button
                class="nav-btn ripple"
                type="button"
                (click)="viewMode() === 'personal' ? calendarNavPrev() : prevMonth()"
                [title]="viewMode() === 'personal' && personalCalendarScope() === 'week' ? 'Semana anterior (←)' : 'Mes anterior (←)'"
              >
                 <lucide-icon name="chevron-left" size="18" aria-hidden="true"></lucide-icon>
              </button>
              <div class="current-month-display">
                @if (viewMode() === 'personal' && personalCalendarScope() === 'week') {
                  <span class="m-name">Semana</span>
                  <span class="m-year">{{ weekRangeLabel() }}</span>
                } @else {
                  <span class="m-name">{{ getMonthName() }}</span>
                  <span class="m-year">{{ currentYear() }}</span>
                }
              </div>
              <button
                class="nav-btn ripple"
                type="button"
                (click)="viewMode() === 'personal' ? calendarNavNext() : nextMonth()"
                [title]="viewMode() === 'personal' && personalCalendarScope() === 'week' ? 'Semana siguiente (→)' : 'Mes siguiente (→)'"
              >
                 <lucide-icon name="chevron-right" size="18" aria-hidden="true"></lucide-icon>
              </button>
              <button
                type="button"
                class="nav-btn ripple today-jump-btn"
                (click)="goToToday()"
                title="Ir a hoy (T)"
              >
                <lucide-icon name="calendar-check" size="18" aria-hidden="true"></lucide-icon>
                <span class="today-jump-label">Hoy</span>
              </button>
           </div>

           @if (viewMode() === 'personal') {
             <div class="personal-scope-toggle" role="group" aria-label="Vista del calendario">
               <button
                 type="button"
                 class="scope-btn"
                 [class.active]="personalCalendarScope() === 'month'"
                 (click)="setPersonalCalendarScope('month')"
                 title="Vista mes (M)"
               >
                 Mes
               </button>
               <button
                 type="button"
                 class="scope-btn"
                 [class.active]="personalCalendarScope() === 'week'"
                 (click)="setPersonalCalendarScope('week')"
                 title="Vista semana (W)"
               >
                 Semana
               </button>
             </div>
           }

           @if (canManageTeam()) {
           <div class="view-toggle">
              <button 
                type="button"
                class="toggle-btn" 
                [class.active]="viewMode() === 'personal'"
                (click)="viewMode.set('personal')"
              >
                <lucide-icon name="user" size="14" aria-hidden="true"></lucide-icon>
                Individual
              </button>
              <button 
                type="button"
                class="toggle-btn" 
                [class.active]="viewMode() === 'team'"
                (click)="viewMode.set('team')"
              >
                <lucide-icon name="users" size="14" aria-hidden="true"></lucide-icon>
                Equipo
              </button>
           </div>
           }
           
           <div class="header-actions-extra">
              <button
                type="button"
                class="nav-btn ripple export-btn"
                (click)="exportAvailabilityCsv()"
                title="Exportar CSV (E)"
              >
                <lucide-icon name="download" size="18" aria-hidden="true"></lucide-icon>
                <span class="export-btn__label">CSV</span>
              </button>
              <button
                type="button"
                class="nav-btn ripple shortcuts-help-btn"
                (click)="toggleShortcutsHelp()"
                title="Atajos de teclado (?)"
              >
                <lucide-icon name="keyboard" size="18" aria-hidden="true"></lucide-icon>
              </button>
              <button
                type="button"
                class="request-days-btn"
                [routerLink]="['/users/availability', 'request']"
                [queryParams]="pedirDiasQueryParams()"
                title="Solicitar vacaciones o ausencias (flujo de aprobación)"
              >
                <lucide-icon name="calendar-plus" size="18" aria-hidden="true"></lucide-icon>
                Pedir días
              </button>
              <button 
                class="nav-btn ripple refresh-btn" 
                (click)="loadMonth()" 
                [class.animate-spin]="isLoading()" 
                title="Sincronizar datos"
              >
                <lucide-icon name="rotate-cw" size="18" aria-hidden="true"></lucide-icon>
              </button>
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

      <div class="dashboard-layout" [class.dashboard-layout--team]="viewMode() === 'team'">
        @if (viewMode() === 'personal') {
        <!-- Lista de operarios: solo vista individual (evita duplicar filas con el cuadrante de equipo) -->
        <aside class="team-sidebar animate-slide-right">
          <div class="sidebar-header">
            <h3>Operarios AV</h3>
            <ui-badge variant="info" class="count-badge">{{ personalSidebarTechnicians().length }}</ui-badge>
          </div>
          <div class="sidebar-search">
            <div class="availability-filter-slot">
              <ui-feature-filter-bar
                [framed]="true"
                [appearance]="'feature'"
                [searchVariant]="'glass'"
                [value]="availabilitySearchQuery()"
                placeholder="Nombre, rol; varios: ana, led…"
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

        <!-- MAIN CALENDAR / TEAM BOARD -->
        <main class="main-content">
          @if (viewMode() === 'personal') {
            <div class="availability-panel animate-slide-up">
              <ui-card shape="auto" class="calendar-card">
                <div class="calendar-card-header">
                  <div class="header-meta">
                    @if (getSelectedTechName(); as name) {
                      <div class="tech-selector-info">
                        <span class="label">Calendario</span>
                        <h2 class="tech-display-name">{{ name }}</h2>
                        @if (personalMonthSummary(); as pm) {
                          <ul class="personal-month-summary" aria-label="Resumen del mes visible">
                            <li><span class="dot AVAILABLE"></span> Disp. {{ pm.available }}</li>
                            <li><span class="dot UNAVAILABLE"></span> Ocup. {{ pm.unavailable }}</li>
                            <li><span class="dot HOLIDAY"></span> Vac. {{ pm.holiday }}</li>
                            <li><span class="dot SICK_LEAVE"></span> Incid. {{ pm.incident }}</li>
                          </ul>
                        }
                      </div>
                    }
                  </div>
                  <div class="calendar-legend">
                    <div class="legend-item AVAILABLE"><span class="dot"></span><span>Disp.</span></div>
                    <div class="legend-item UNAVAILABLE"><span class="dot"></span><span>Ocupado</span></div>
                    <div class="legend-item HOLIDAY"><span class="dot"></span><span>Vacac.</span></div>
                    <div class="legend-item SICK_LEAVE"><span class="dot"></span><span>Resto</span></div>
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
                      <div
                        class="calendar-cell calendar-cell--readonly"
                        [class.calendar-cell--outside-focus]="!cell.isInFocusMonth"
                        [class.today]="cell.isToday"
                        [class.is-weekend]="isWeekendYmd(cell.year, cell.month, cell.day)"
                        role="gridcell"
                        [attr.aria-label]="
                          'Día ' + cell.day + ', ' + getCellStatusAbbrev(getTechStatusByIso(selectedTechId(), cell.date))
                        "
                      >
                        <div class="calendar-cell__top">
                          <span class="day-number">{{ cell.day }}</span>
                          @if (cell.isToday) {
                            <span class="today-badge">Hoy</span>
                          }
                        </div>
                        @if (getTechStatusByIso(selectedTechId(), cell.date); as status) {
                          <div class="calendar-cell__status" [class]="status">
                            <span class="status-pill">{{ getCellStatusAbbrev(status) }}</span>
                          </div>
                        }
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
            <div class="availability-panel team-board-wrapper animate-slide-up">
              <ui-card shape="auto" class="team-board-card">
                <div class="team-board-toolbar">
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
                  <div class="calendar-legend team-board-legend">
                    <div class="legend-item AVAILABLE"><span class="dot"></span><span>Disp.</span></div>
                    <div class="legend-item UNAVAILABLE"><span class="dot"></span><span>Ocupado</span></div>
                    <div class="legend-item HOLIDAY"><span class="dot"></span><span>Vacac.</span></div>
                    <div class="legend-item SICK_LEAVE"><span class="dot"></span><span>Incid.</span></div>
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
                                @if (getTechDayStatus(tech.id, cell.day); as status) {
                                  <div
                                    class="status-chip"
                                    [class]="status"
                                    [attr.title]="getShortLabel(status) + ' · día ' + cell.day"
                                  ></div>
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
      display: flex; flex-direction: column;
      --avail-persona-width: 290px;
      --avail-day-cell-width: 54px;
      --avail-grid-line: color-mix(in srgb, var(--text-muted) 10%, var(--border-soft));
      --avail-grid-line-strong: color-mix(in srgb, var(--text-muted) 22%, var(--border-soft));
      animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-layout {
      display: grid;
      grid-template-columns: minmax(240px, 300px) 1fr;
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 1200px) {
      .dashboard-layout {
        grid-template-columns: 240px 1fr;
        gap: 1rem;
      }
    }
    @media (max-width: 1000px) {
      .dashboard-layout {
        display: flex;
        flex-direction: column;
      }
      .team-sidebar {
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
      }
    }


    .legal-hint {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem 1.25rem;
      border-radius: 16px;
      border: 1px solid color-mix(in srgb, var(--info) 20%, transparent);
      background: color-mix(in srgb, var(--info) 6%, var(--theme-surface, #fff));
      color: var(--text-primary);
      font-size: 0.88rem;
      line-height: 1.5;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(10px);
    }
    .legal-hint lucide-icon {
      flex-shrink: 0;
      color: var(--info);
    }

    .sync-degraded-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.25rem;
      border-radius: 16px;
      border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent);
      background: color-mix(in srgb, var(--warning) 10%, var(--theme-surface, #fff));
      color: var(--text-primary);
      font-size: 0.88rem;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
    }
    .sync-degraded-banner lucide-icon {
      flex-shrink: 0;
      color: var(--warning);
    }
    .sync-degraded-banner--partial {
      border-color: color-mix(in srgb, var(--warning) 25%, transparent);
      background: color-mix(in srgb, var(--warning) 8%, var(--theme-surface, #fff));
    }

    .dashboard-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      gap: 1.25rem;
      padding: 0.5rem 0 1.5rem;
      border-bottom: 2.5px solid var(--border-soft);
    }

    .header-actions {
      display: flex;
      gap: 1.25rem;
      align-items: center;
      flex-wrap: wrap;
      width: 100%;
      justify-content: space-between;
    }

    .month-navigator {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.45rem;
      border-radius: 18px;
      background: var(--bg-hover, #f1f5f9);
      border: 1px solid var(--border-soft);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
    }

    .nav-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-btn:hover:not(:disabled) {
      background: var(--theme-surface, #fff);
      color: var(--brand);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }

    .today-jump-btn {
      padding: 0 1.15rem;
      width: auto;
      gap: 0.5rem;
    }
    .today-jump-label {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .current-month-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 150px;
      padding: 0 1rem;
    }
    .m-name {
      font-size: 1.1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-primary);
    }
    .m-year {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--brand);
      opacity: 0.8;
    }

    .view-toggle {
       display: flex;
       padding: 0.45rem;
       gap: 0.45rem;
       border-radius: 18px;
       background: var(--bg-hover, #f1f5f9);
       border: 1px solid var(--border-soft);
    }
    .toggle-btn {
      padding: 0.7rem 1.4rem;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transition: all 0.2s ease;
    }
    .toggle-btn.active {
      background: var(--brand);
      color: #fff;
      box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--brand) 60%, transparent);
    }

    .request-days-btn {
      padding: 0.8rem 1.5rem;
      border-radius: 16px;
      background: var(--brand);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      box-shadow: 0 6px 20px -6px color-mix(in srgb, var(--brand) 50%, transparent);
    }
    .request-days-btn:hover {
      transform: translateY(-2px);
      filter: brightness(1.1);
      box-shadow: 0 10px 25px -8px color-mix(in srgb, var(--brand) 60%, transparent);
    }

    .dashboard-layout {
      display: grid;
      grid-template-columns: 340px minmax(0, 1fr);
      gap: 2.5rem;
      margin-top: 2rem;
      align-items: start;
    }
    .dashboard-layout--team {
       grid-template-columns: 1fr;
       gap: 0;
    }

    .main-content { min-width: 0; }

    .team-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      position: sticky;
      top: 2rem;
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 0.5rem;
    }
    .sidebar-header h3 {
      font-size: 0.85rem;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-muted);
      margin: 0;
    }

    .technician-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: 80vh;
      overflow-y: auto;
      padding-right: 0.75rem;
    }

    .availability-dashboard--team .team-board-wrapper {
      min-height: min-content;
      width: 100%;
    }

    .team-board-toolbar-search {
      padding: 0 1.25rem 0.85rem;
      border-bottom: 1px solid var(--avail-grid-line);
      background: color-mix(in srgb, var(--bg-tertiary) 40%, var(--bg-secondary));
    }
    .team-board-toolbar-search ::ng-deep .feature-filter-bar {
      margin-bottom: 0;
      max-width: none;
      flex: 1;
      min-width: 0;
    }
    .team-board-filter-hint {
      margin: 0.65rem 0 0;
      font-size: 0.65rem;
      font-weight: 600;
      line-height: 1.45;
      color: var(--text-muted);
      max-width: 52rem;
    }
    .team-board-filter-hint__ex {
      font-weight: 800;
      color: color-mix(in srgb, var(--brand) 55%, var(--text-muted));
    }

    .availability-filter-slot {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      width: 100%;
      max-width: 640px;
    }
    .availability-filter-slot ::ng-deep .feature-filter-bar {
      margin-bottom: 0;
      flex: 1;
      min-width: 0;
    }
    .availability-clear-search {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.35rem;
      padding: 0.45rem 0.65rem;
      border-radius: 12px;
      border: 1px solid var(--avail-grid-line);
      background: var(--bg-secondary);
      color: var(--text-muted);
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
    }
    .availability-clear-search:hover {
      border-color: var(--brand-border-soft);
      color: var(--brand);
      background: var(--brand-ambient);
    }
    .availability-clear-search__label {
      white-space: nowrap;
    }

    .availability-panel {
      position: relative;
      width: 100%;
      min-width: 0;
    }
    .availability-loading-overlay {
      position: absolute;
      inset: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      border-radius: 24px;
      background: color-mix(in srgb, var(--bg-secondary) 85%, transparent);
      backdrop-filter: blur(8px);
      transition: opacity 0.3s ease;
    }
    .availability-loading-overlay__icon {
      color: var(--brand);
      filter: drop-shadow(0 0 10px color-mix(in srgb, var(--brand) 40%, transparent));
    }
    .availability-loading-overlay__text {
      font-size: 0.8rem;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .availability-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 2rem;
      text-align: center;
      background: color-mix(in srgb, var(--bg-hover) 30%, transparent);
      border-radius: 20px;
      border: 1.5px dashed var(--border-soft);
    }
    .availability-empty lucide-icon { opacity: 0.5; color: var(--text-muted); }
    .availability-empty__title { margin: 0; font-size: 1rem; font-weight: 900; color: var(--text-primary); }
    .availability-empty__hint { margin: 0; font-size: 0.85rem; color: var(--text-muted); max-width: 24rem; }
    .availability-empty__btn {
      margin-top: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: 14px;
      background: var(--brand);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    button.tech-card {
      display: flex;
      align-items: center;
      gap: 1.15rem;
      padding: 1.15rem 1.4rem;
      border-radius: 20px;
      border: 1.5px solid var(--border-soft);
      background: var(--theme-surface, #fff);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      width: 100%;
      position: relative;
    }
    .tech-card:hover {
      transform: translateX(8px);
      border-color: var(--brand);
      background: color-mix(in srgb, var(--brand) 4%, var(--theme-surface, #fff));
      box-shadow: 0 12px 28px -12px rgba(0,0,0,0.12);
    }
    .tech-card.selected {
      border-color: var(--brand);
      background: color-mix(in srgb, var(--brand) 8%, var(--theme-surface, #fff));
      box-shadow: 0 15px 35px -12px color-mix(in srgb, var(--brand) 25%, transparent);
      border-width: 2px;
    }

    .tech-avatar-wrapper { position: relative; }
    .tech-avatar {
      width: 50px;
      height: 50px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 850;
      font-size: 1.1rem;
      color: #fff;
      box-shadow: 0 6px 16px rgba(0,0,0,0.12);
      transition: transform 0.3s ease;
    }
    .tech-card:hover .tech-avatar { transform: scale(1.05); }

    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2.5px solid var(--theme-surface, #fff);
    }
    .status-indicator.online { background: var(--success); box-shadow: 0 0 12px var(--success); }
    .status-indicator.away { background: var(--warning); box-shadow: 0 0 12px var(--warning); }
    .status-indicator.offline { background: var(--text-muted); }

    .tech-body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .tech-name { font-weight: 850; font-size: 1rem; color: var(--text-primary); letter-spacing: -0.01em; }
    .tech-role { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 0.15rem; }
    .tech-chevron { opacity: 0; transition: all 0.3s ease; transform: translateX(-10px); color: var(--brand); }
    .tech-card.selected .tech-chevron, .tech-c    /* CALENDAR PERSONAL */
    .calendar-card {
      border-radius: 32px !important;
      border: 1px solid var(--glass-border);
      background: var(--glass-bg);
      backdrop-filter: blur(24px);
      overflow: hidden;
      box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.1);
      animation: scaleIn 0.5s ease-out;
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .calendar-card-header {
      padding: clamp(1rem, 2vw, 2.25rem) clamp(1rem, 2.5vw, 2.75rem);
      border-bottom: 2px solid var(--border-soft);
      background: rgba(255, 255, 255, 0.15);
    }
    .tech-display-name {
      font-size: 1.8rem;
      font-weight: 950;
      letter-spacing: -0.02em;
      margin-top: 0.5rem;
      color: var(--text-primary);
    }

    .personal-month-summary {
      list-style: none;
      padding: 0;
      margin: 1.25rem 0 0;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .personal-month-summary li {
      padding: 0.5rem 1rem;
      border-radius: 14px;
      background: color-mix(in srgb, var(--brand) 6%, transparent);
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--text-primary);
      border: 1px solid color-mix(in srgb, var(--brand) 10%, transparent);
    }
    .personal-month-summary .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .personal-month-summary .dot.AVAILABLE { background: var(--success); box-shadow: 0 0 8px var(--success); }
    .personal-month-summary .dot.UNAVAILABLE { background: var(--danger); box-shadow: 0 0 8px var(--danger); }
    .personal-month-summary .dot.HOLIDAY { background: var(--info); box-shadow: 0 0 8px var(--info); }
    .personal-month-summary .dot.SICK_LEAVE { background: var(--warning); box-shadow: 0 0 8px var(--warning); }

    .calendar-legend {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      align-items: center;
      padding: 0.6rem 1rem;
      border-radius: 16px;
      background: color-mix(in srgb, var(--bg-hover) 40%, transparent);
      border: 1px solid var(--border-soft);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.65rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .legend-item .dot { width: 8px; height: 8px; border-radius: 50%; }
    .legend-item.AVAILABLE .dot { background: var(--success); }
    .legend-item.UNAVAILABLE .dot { background: var(--danger); }
    .legend-item.HOLIDAY .dot { background: var(--info); }
    .legend-item.SICK_LEAVE .dot { background: var(--warning); }

    .calendar-container {
      padding: clamp(1.25rem, 3vw, 2.5rem) clamp(0.75rem, 2.5vw, 2.75rem) 2.5rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .calendar-grid-header {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .grid-day-label {
      text-align: center;
      font-size: 0.7rem;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-muted);
      opacity: 0.7;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: clamp(0.35rem, 1vw, 1rem);
    }

    .calendar-cell {
      min-height: clamp(5.5rem, 12vh, 7.5rem);
      background: color-mix(in srgb, var(--bg-secondary) 40%, var(--theme-surface, #fff));
      border: 1.5px solid var(--border-soft);
      border-radius: clamp(12px, 2vw, 20px);
      padding: clamp(0.5rem, 1.2vw, 1rem);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    .calendar-cell:hover {
      background: var(--theme-surface, #fff);
      border-color: var(--brand);
      transform: translateY(-4px);
      box-shadow: 0 15px 35px -10px rgba(0,0,0,0.1);
      z-index: 2;
    }
    .calendar-cell.today {
      background: color-mix(in srgb, var(--brand) 8%, var(--theme-surface, #fff));
      border: 2.5px solid var(--brand);
    }
    .calendar-cell.is-weekend:not(.today) {
       background: color-mix(in srgb, var(--text-muted) 8%, var(--bg-hover));
    }

    .calendar-cell__top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .today-badge {
      flex-shrink: 0;
      font-size: clamp(0.45rem, 0.8vw, 0.55rem);
      font-weight: 950;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
      background: var(--brand);
      color: #fff;
      box-shadow: 0 4px 10px color-mix(in srgb, var(--brand) 40%, transparent);
    }

    .day-number {
      font-size: clamp(1rem, 2vw, 1.25rem);
      font-weight: 950;
      opacity: 0.5;
      color: var(--text-primary);
      line-height: 1;
    }
    .calendar-cell.today .day-number { opacity: 1; color: var(--brand); }

    .status-pill {
      display: block;
      padding: clamp(0.3rem, 0.8vw, 0.5rem);
      border-radius: clamp(8px, 1.5vw, 14px);
      font-size: clamp(0.55rem, 1vw, 0.7rem);
      font-weight: 850;
      text-transform: uppercase;
      text-align: center;
      box-shadow: 0 4px 12px -4px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .calendar-cell:hover .status-pill { transform: scale(1.02); }
    .AVAILABLE .status-pill { background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success); }
    .UNAVAILABLE .status-pill { background: color-mix(in srgb, var(--danger) 14%, transparent); color: var(--danger); }
    .HOLIDAY .status-pill { background: color-mix(in srgb, var(--info) 14%, transparent); color: var(--info); }
    .SICK_LEAVE .status-pill { background: color-mix(in srgb, var(--warning) 14%, transparent); color: var(--warning); }

    /* TEAM BOARD */
    .team-board-card {
      border-radius: 32px !important;
      border: 1px solid var(--border-soft);
      overflow: hidden;
      box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.1);
    }
    .team-board-toolbar {
      padding: 1.75rem 2.25rem;
      background: var(--bg-secondary);
      border-bottom: 2.5px solid var(--border-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .team-board-title {
      font-size: 1.5rem;
      font-weight: 950;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin: 0;
    }

    .team-board-matrix {
      width: 100%;
      min-width: calc(var(--avail-persona-width) + var(--team-day-cols, 31) * var(--avail-day-cell-width));
    }

    .board-header {
      display: grid;
      grid-template-columns: var(--avail-persona-width) 1fr;
      position: sticky;
      top: 0;
      z-index: 20;
      background: var(--theme-surface, #fff);
      border-bottom: 2px solid var(--avail-grid-line-strong);
      backdrop-filter: blur(10px);
    }
    .header-col.persona-col {
      padding: 1.25rem 2rem;
      font-size: 0.85rem;
      font-weight: 950;
      letter-spacing: 0.12em;
      color: var(--brand);
      text-transform: uppercase;
      border-right: 2px solid var(--avail-grid-line-strong);
    }

    .day-header-col {
      padding: 1rem 0.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      border-right: 1.5px solid var(--avail-grid-line);
      background: var(--theme-surface, #fff);
    }
    .day-header-col.is-today {
      background: color-mix(in srgb, var(--brand) 8%, transparent);
      box-shadow: inset 0 -3px 0 var(--brand);
    }
    .day-header-col .d-n { font-weight: 950; font-size: 1.1rem; }
    .day-header-col .d-l { font-size: 0.65rem; font-weight: 850; text-transform: uppercase; color: var(--text-muted); opacity: 0.6; }

    .board-row {
      display: grid;
      grid-template-columns: var(--avail-persona-width) 1fr;
      border-bottom: 1.5px solid var(--avail-grid-line);
      background: var(--theme-surface, #fff);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 72px;
    }
    .board-row:hover { background: color-mix(in srgb, var(--brand) 4%, transparent); }
    .board-row.is-selected { background: color-mix(in srgb, var(--brand) 8%, transparent); }

    .board-tech-info {
      padding: 0.85rem 1.75rem;
      display: flex;
      align-items: center;
      gap: 1.15rem;
      border-right: 2px solid var(--avail-grid-line-strong);
      background: inherit;
    }
    .mini-avatar { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
    .mini-meta .n { display: block; font-weight: 850; font-size: 0.95rem; color: var(--text-primary); }
    .mini-meta .r { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 750; letter-spacing: 0.04em; }

    .board-day-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1.5px solid var(--avail-grid-line);
      padding: 0.5rem;
    }
    .status-chip {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid transparent;
    }
    .status-chip:hover { transform: scale(1.6); z-index: 5; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
    .status-chip.AVAILABLE { background: var(--success); box-shadow: 0 0 10px color-mix(in srgb, var(--success) 60%, transparent); }
    .status-chip.UNAVAILABLE { background: var(--danger); box-shadow: 0 0 10px color-mix(in srgb, var(--danger) 60%, transparent); }
    .status-chip.HOLIDAY { background: var(--info); box-shadow: 0 0 10px color-mix(in srgb, var(--info) 60%, transparent); }
    .status-chip.SICK_LEAVE { background: var(--warning); box-shadow: 0 0 10px color-mix(in srgb, var(--warning) 60%, transparent); }

    .team-board-scroll-wrap {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
splay: flex;
      flex-direction: column;
      min-width: 0;
    }
    .team-board-scroll {
      overflow-x: auto;
      overflow-y: visible;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      width: 100%;
    }
    .team-board-scroll:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--brand) 55%, transparent);
      outline-offset: 2px;
    }
    .team-board-hscroll-indicator {
      height: 4px;
      margin: 0.35rem 0.35rem 0.15rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--text-muted) 14%, transparent);
      overflow: hidden;
      flex-shrink: 0;
    }
    .team-board-hscroll-indicator__thumb {
      height: 100%;
      min-width: 6%;
      border-radius: inherit;
      background: color-mix(in srgb, var(--brand) 50%, var(--text-muted));
      transition: margin-inline-start 0.14s ease, width 0.14s ease;
    }
    @media (prefers-reduced-motion: reduce) {
      .team-board-hscroll-indicator__thumb {
        transition: none;
      }
    }

    .team-board-matrix {
      --team-day-cols: 31;
      width: 100%;
      /* Fuerza scroll horizontal en lugar de aplastar columnas: columna persona + días con ancho mínimo */
      min-width: max(100%, calc(var(--avail-persona-width) + var(--team-day-cols, 31) * 44px));
    }

    .board-header {
      display: grid;
      grid-template-columns: var(--avail-persona-width) minmax(0, 1fr);
      position: sticky;
      top: 0;
      z-index: 4;
      background: linear-gradient(180deg, var(--bg-secondary) 0%, color-mix(in srgb, var(--bg-tertiary) 25%, var(--bg-secondary)) 100%);
      border-bottom: 1px solid var(--avail-grid-line-strong);
      box-shadow: 0 8px 20px -12px color-mix(in srgb, var(--text-primary) 14%, transparent);
    }

    .header-col.persona-col {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: var(--avail-persona-width);
      min-width: var(--avail-persona-width);
      max-width: var(--avail-persona-width);
      flex-shrink: 0;
      padding: 0.85rem 1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--brand);
      font-size: 0.65rem;
      border-right: 1px solid var(--avail-grid-line-strong);
    }
    .header-col.persona-col lucide-icon { opacity: 0.85; }

    .sticky-col {
      position: sticky;
      left: 0;
      background: var(--bg-secondary);
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.06);
    }
    .board-header .sticky-col {
      z-index: 5;
    }
    .board-tech-info.sticky-col {
      z-index: 2;
      background: var(--bg-tertiary);
    }
    .board-row.is-alt .board-tech-info.sticky-col {
      background: color-mix(in srgb, var(--bg-tertiary) 92%, var(--bg-secondary));
    }
    .board-row:hover .board-tech-info.sticky-col {
      background: var(--bg-secondary);
    }
    .board-row.is-selected .board-tech-info.sticky-col {
      background: var(--brand-ambient);
    }

    .days-row {
      display: grid;
      grid-template-columns: repeat(var(--team-day-cols, 31), minmax(0, 1fr));
      min-width: 0;
      width: 100%;
      align-self: stretch;
    }

    .day-header-col {
      min-width: 0;
      width: auto;
      border-right: 1px solid var(--avail-grid-line);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 0.15rem;
      gap: 3px;
      background: var(--bg-secondary);
    }
    .day-header-col:nth-child(7n) {
      border-right: 2px solid var(--avail-grid-line-strong);
    }
    .day-header-col.is-weekend {
      background: color-mix(in srgb, var(--text-muted) 8%, var(--bg-secondary));
    }
    .day-header-col.is-today {
      background: var(--brand-ambient);
      box-shadow: inset 0 -3px 0 var(--brand);
    }
    .day-header-col.is-today .d-n { color: var(--brand); }
    .day-header-col .d-n {
      font-size: clamp(0.55rem, 2.1vmin, 0.88rem);
      font-weight: 900;
      line-height: 1;
      color: var(--text-primary);
    }
    .day-header-col .d-l {
      font-size: clamp(0.45rem, 1.6vmin, 0.58rem);
      font-weight: 800;
      text-transform: capitalize;
      opacity: 0.55;
      letter-spacing: 0.02em;
    }
    .day-header-col.is-weekend .d-l { opacity: 0.75; color: var(--text-muted); }

    .board-body {
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--bg-tertiary) 92%, var(--bg-secondary)) 0%,
        var(--bg-tertiary) 100%
      );
    }

    .board-row {
      display: grid;
      grid-template-columns: var(--avail-persona-width) minmax(0, 1fr);
      align-items: stretch;
      border-bottom: 1px solid var(--avail-grid-line);
      min-height: 58px;
      transition: background 0.15s ease, box-shadow 0.15s ease;
      cursor: pointer;
      outline: none;
    }
    .board-row:last-child { border-bottom: none; }
    .board-row.is-alt { background: color-mix(in srgb, var(--bg-secondary) 35%, var(--bg-tertiary)); }
    .board-row:hover {
      background: color-mix(in srgb, var(--brand) 6%, var(--bg-secondary));
    }
    .board-row.is-selected {
      background: var(--brand-ambient);
      box-shadow: inset 3px 0 0 var(--brand);
    }
    .board-day-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: 1.5px solid var(--avail-grid-line);
      padding: 0.5rem;
    }
    .status-chip {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid transparent;
      cursor: help;
    }
    .status-chip:hover {
      transform: scale(1.6);
      z-index: 5;
    }
    .status-chip.AVAILABLE { background: var(--success); box-shadow: 0 0 12px color-mix(in srgb, var(--success) 70%, transparent); }
    .status-chip.UNAVAILABLE { background: var(--danger); box-shadow: 0 0 12px color-mix(in srgb, var(--danger) 70%, transparent); }
    .status-chip.HOLIDAY { background: var(--info); box-shadow: 0 0 12px color-mix(in srgb, var(--info) 70%, transparent); }
    .status-chip.SICK_LEAVE { background: var(--warning); box-shadow: 0 0 12px color-mix(in srgb, var(--warning) 70%, transparent); }
    .status-chip.default { opacity: 0.3; background: var(--text-muted); }

    /* RESPONSIVE & UTILS */
    @media (max-width: 899px) {
      .availability-dashboard--team .legal-hint { padding: 0.75rem 1rem; font-size: 0.8rem; }
      .availability-dashboard--team .dashboard-toolbar { justify-content: center; gap: 1rem; }
      .availability-dashboard--team .team-board-toolbar { padding: 1.25rem 1rem; }
      .availability-dashboard--team .team-board-title { font-size: 1.25rem; }
      .availability-dashboard--team .team-board-card { border-radius: 20px !important; }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--text-muted) 25%, transparent); border-radius: 10px; }
    .custom-scrollbar-h::-webkit-scrollbar { height: 6px; }
    .custom-scrollbar-h::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--text-muted) 25%, transparent); border-radius: 10px; }
    
    .sticky-col { position: sticky; left: 0; z-index: 5; background: inherit; }
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
    effect(
      () => {
        if (this.viewMode() !== 'personal') {
          return;
        }
        const list = this.personalSidebarTechnicians();
        const id = this.selectedTechId();
        if (list.length > 0 && !list.some((t) => t.id === id)) {
          this.selectedTechId.set(list[0].id);
        }
      },
      { allowSignalWrites: true },
    );
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

      const data: Record<string, Record<number, string>> = {};

      await Promise.all(
        realTechs.map(async (tech) => {
          try {
            const avail = await firstValueFrom(
              this.api.getAvailability(tech.id, startDate, endDate),
            );

            data[tech.id] = {};
            for (let d = 1; d <= daysInMonth; d++) {
              data[tech.id][d] = this.defaultDayStatus(year, month, d);
            }
            (avail ?? []).forEach((a: TechnicianAvailability) => {
              const dayNum = this.dayNumberFromAvailability(a);
              if (dayNum < 1 || dayNum > daysInMonth) {
                return;
              }
              data[tech.id][dayNum] = this.normalizeAvailabilityType(a.type);
            });
          } catch {
            partialFailures++;
            data[tech.id] = {};
            for (let d = 1; d <= daysInMonth; d++) {
              data[tech.id][d] = this.defaultDayStatus(year, month, d);
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

  getTechDayStatus(techId: string, day: number): string {
    return this.teamAvailability()[techId]?.[day] || 'AVAILABLE';
  }

  /** Estado por fecha ISO (vista calendario alineada o semanal). */
  getTechStatusByIso(techId: string, iso: string): string {
    const by = this.teamAvailabilityIso()[techId];
    if (by?.[iso]) {
      return by[iso];
    }
    const parts = iso.split('-');
    if (parts.length !== 3) {
      return 'AVAILABLE';
    }
    const y = +parts[0];
    const m0 = +parts[1] - 1;
    const d = +parts[2];
    if (y === this.currentYear() && m0 === this.currentMonth()) {
      return this.getTechDayStatus(techId, d);
    }
    return 'AVAILABLE';
  }

  isWeekendYmd(y: number, m: number, d: number): boolean {
    const wd = new Date(y, m, d).getDay();
    return wd === 0 || wd === 6;
  }

  private syncIsoMapsFromAvailabilityData(
    year: number,
    month: number,
    data: Record<string, Record<number, string>>,
  ): void {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const start = TechnicianAvailabilityComponent.mondayOfWeekContaining(new Date(year, month, 1));
    const end = TechnicianAvailabilityComponent.sundayOfWeekContaining(new Date(year, month, daysInMonth));
    const endT = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    const out: Record<string, Record<string, string>> = {};
    for (const techId of Object.keys(data)) {
      out[techId] = {};
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      while (cur.getTime() <= endT) {
        const yy = cur.getFullYear();
        const mm = cur.getMonth();
        const dd = cur.getDate();
        const iso = TechnicianAvailabilityComponent.toIso(yy, mm, dd);
        if (yy === year && mm === month) {
          out[techId][iso] = data[techId][dd] ?? 'AVAILABLE';
        } else {
          const wd = cur.getDay();
          out[techId][iso] = wd === 0 || wd === 6 ? 'UNAVAILABLE' : 'AVAILABLE';
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
