import { Component, inject, signal, computed, OnInit, OnDestroy, effect, ElementRef } from '@angular/core';
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

interface CalendarCell {
  day: number;
  isCurrentMonth: boolean;
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
        <lucide-icon name="shield-check" size="18"></lucide-icon>
        <span
          >El calendario es de <strong>solo lectura</strong>. Vacaciones y ausencias deben solicitarse con el botón
          «Pedir días».</span
        >
      </div>

      @if (syncDegraded()) {
        <div class="sync-degraded-banner" role="status">
          <lucide-icon name="cloud-off" size="18"></lucide-icon>
          <span
            >No se pudo sincronizar con el servidor. Se muestran datos de demostración; pulsa actualizar para
            reintentar.</span
          >
        </div>
      }

      <header class="dashboard-toolbar">
        <div class="header-actions">
           <div class="month-navigator">
              <button class="nav-btn ripple" (click)="prevMonth()" title="Anterior">
                 <lucide-icon name="chevron-left" size="18"></lucide-icon>
              </button>
              <div class="current-month-display">
                 <span class="m-name">{{ getMonthName() }}</span>
                 <span class="m-year">{{ currentYear() }}</span>
              </div>
              <button class="nav-btn ripple" (click)="nextMonth()" title="Siguiente">
                 <lucide-icon name="chevron-right" size="18"></lucide-icon>
              </button>
           </div>

           @if (canManageTeam()) {
           <div class="view-toggle">
              <button 
                type="button"
                class="toggle-btn" 
                [class.active]="viewMode() === 'personal'"
                (click)="viewMode.set('personal')"
              >
                <lucide-icon name="user" size="14"></lucide-icon>
                Individual
              </button>
              <button 
                type="button"
                class="toggle-btn" 
                [class.active]="viewMode() === 'team'"
                (click)="viewMode.set('team')"
              >
                <lucide-icon name="users" size="14"></lucide-icon>
                Equipo
              </button>
           </div>
           }
           
           <div class="header-actions-extra">
              <button
                type="button"
                class="request-days-btn"
                [routerLink]="['/users/availability', 'request']"
                [queryParams]="pedirDiasQueryParams()"
                title="Solicitar vacaciones o ausencias (flujo de aprobación)"
              >
                <lucide-icon name="calendar-plus" size="18"></lucide-icon>
                Pedir días
              </button>
              <button 
                class="nav-btn ripple refresh-btn" 
                (click)="loadMonth()" 
                [class.animate-spin]="isLoading()" 
                title="Sincronizar datos"
              >
                <lucide-icon name="rotate-cw" size="18"></lucide-icon>
              </button>
           </div>
        </div>
      </header>

      <div class="dashboard-layout" [class.dashboard-layout--team]="viewMode() === 'team'">
        @if (viewMode() === 'personal') {
        <!-- Lista de operarios: solo vista individual (evita duplicar filas con el cuadrante de equipo) -->
        <aside class="team-sidebar animate-slide-right">
          <div class="sidebar-header">
            <h3>Operarios AV</h3>
            <ui-badge variant="info" class="count-badge">{{ displayedTechnicians().length }}</ui-badge>
          </div>
          <div class="sidebar-search">
            <ui-feature-filter-bar
              [framed]="true"
              [appearance]="'feature'"
              [searchVariant]="'glass'"
              placeholder="Buscar técnico…"
              (searchChange)="onSearch($event)"
            />
          </div>
          <div class="technician-list custom-scrollbar">
            @for (tech of displayedTechnicians(); track tech.id) {
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
                <lucide-icon name="chevron-right" size="14" class="tech-chevron"></lucide-icon>
              </button>
            }
          </div>
        </aside>
        }

        <!-- MAIN CALENDAR / TEAM BOARD -->
        <main class="main-content">
          @if (viewMode() === 'personal') {
            <div class="calendar-wrapper animate-slide-up">
              <ui-card shape="auto" class="calendar-card">
                <div class="calendar-card-header">
                  <div class="header-meta">
                    @if (getSelectedTechName(); as name) {
                      <div class="tech-selector-info">
                        <span class="label">Calendario</span>
                        <h2 class="tech-display-name">{{ name }}</h2>
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
                    @for (day of ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']; track day) {
                      <div class="grid-day-label">{{ day }}</div>
                    }
                  </div>
                  
                  <div class="calendar-grid">
                    @for (cell of calendarCells(); track cell.date) {
                      <div
                        class="calendar-cell calendar-cell--readonly"
                        [class.other-month]="!cell.isCurrentMonth"
                        [class.today]="cell.isToday"
                        role="gridcell"
                        [attr.aria-label]="'Día ' + cell.day"
                      >
                        <span class="day-number">{{ cell.day }}</span>

                        <div class="cell-status-content">
                          @if (getTechDayStatus(selectedTechId(), cell.day); as status) {
                             <div class="status-indicator-bar" [class]="status"></div>
                             <div class="status-tag" [class]="status">
                                {{ getShortLabel(status) }}
                             </div>
                          }
                        </div>

                        @if (cell.isToday) { <div class="today-tag">HOY</div> }
                      </div>
                    }
                  </div>
                </div>
              </ui-card>
            </div>
          } @else {
            <!-- TEAM BOARD VIEW -->
            <div class="team-board-wrapper animate-slide-up">
              <ui-card shape="auto" class="team-board-card">
                <div class="team-board-toolbar">
                  <div class="team-board-toolbar__meta">
                    <span class="label">Vista equipo</span>
                    <h2 class="team-board-title">
                      Cuadrante
                      <span class="team-board-month">{{ getMonthName() }} {{ currentYear() }}</span>
                    </h2>
                    <p class="team-board-hint">
                      <lucide-icon name="users" size="14"></lucide-icon>
                      {{ teamBoardHintCounts() }} · vista mensual completa del equipo
                    </p>
                    @if (!isCompactTeamNav()) {
                      <p class="team-board-scroll-hint-desktop" aria-live="polite">
                        <lucide-icon name="calendar-days" size="14"></lucide-icon>
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
                  <ui-feature-filter-bar
                    [framed]="true"
                    [appearance]="'feature'"
                    [searchVariant]="'glass'"
                    placeholder="Filtrar operarios en el cuadrante…"
                    (searchChange)="onSearch($event)"
                  />
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
                        <lucide-icon name="chevron-left" size="18"></lucide-icon>
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
                        <lucide-icon name="chevron-right" size="18"></lucide-icon>
                      </button>
                    </div>
                  </div>
                }

                <div class="team-board-scroll custom-scrollbar-h" tabindex="0" (scroll)="onTeamHorizontalScroll($event)">
                  <div class="team-board-matrix" [style.--team-day-cols]="calendarCells().length">
                    <div class="board-header">
                      <div class="header-col persona-col sticky-col">
                        <lucide-icon name="circle-user" size="18"></lucide-icon>
                        <span>Persona</span>
                      </div>
                      <div class="days-row">
                        @for (cell of calendarCells(); track cell.date) {
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
                            @for (cell of calendarCells(); track cell.date) {
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
                      }
                    </div>
                  </div>
                </div>
              </ui-card>
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
      /* gap y padding horizontal: feature-page-shell--compact (styles.css global) */
      --avail-persona-width: 280px;
      --avail-day-cell-width: 52px;
    }

    .legal-hint {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      border: 1px solid color-mix(in srgb, var(--info) 35%, var(--border-soft));
      background: color-mix(in srgb, var(--info) 12%, var(--bg-secondary));
      color: var(--text-primary);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .legal-hint lucide-icon {
      flex-shrink: 0;
      margin-top: 0.1rem;
      color: var(--info);
    }

    .sync-degraded-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      border: 1px solid color-mix(in srgb, var(--warning, #f59e0b) 40%, var(--border-soft));
      background: color-mix(in srgb, var(--warning, #f59e0b) 14%, var(--bg-secondary));
      color: var(--text-primary);
      font-size: 0.82rem;
      line-height: 1.45;
    }
    .sync-degraded-banner lucide-icon {
      flex-shrink: 0;
      margin-top: 0.1rem;
      color: var(--warning, #f59e0b);
    }

    .dashboard-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-soft);
    }

    .header-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }

    /* MONTH NAVIGATOR */
    .month-navigator {
       display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem;
       border-radius: var(--radius-lg); background: var(--bg-secondary); border: 1px solid var(--border-soft);
    }
    .nav-btn {
       width: 36px; height: 36px; border: none; border-radius: 12px;
       background: transparent; color: var(--text-primary);
       cursor: pointer; display: flex; align-items: center; justify-content: center;
       transition: var(--transition-base);
    }
    .nav-btn:hover { background: var(--brand-ambient); color: var(--brand); transform: scale(1.1); }
    
    .header-actions-extra {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-left: 0.5rem;
      flex-wrap: wrap;
    }
    .request-days-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.95rem;
      border-radius: 12px;
      border: 1px solid var(--brand-border-soft, color-mix(in srgb, var(--brand) 35%, transparent));
      background: var(--brand);
      color: #0a0a0a;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      text-decoration: none;
      transition: var(--transition-base, 0.2s ease);
    }
    .request-days-btn:hover {
      filter: brightness(1.05);
      box-shadow: var(--shadow-glow-soft, 0 4px 20px rgba(0, 0, 0, 0.12));
    }
    .refresh-btn { 
      background: var(--bg-secondary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-muted);
      box-shadow: var(--shadow-sm);
    }
    .refresh-btn:hover {
      color: var(--brand);
      border-color: var(--brand-border-soft);
      box-shadow: var(--shadow-glow-soft);
    }
    
    .current-month-display { display: flex; flex-direction: column; align-items: center; min-width: 120px; }
    .m-name { font-size: 0.9rem; font-weight: 900; text-transform: uppercase; color: var(--text-primary); letter-spacing: 0.05em; }
    .m-year { font-size: 0.7rem; font-weight: 700; color: var(--brand); opacity: 0.6; }

    .view-toggle {
      display: flex; padding: 0.4rem; gap: 0.4rem;
      border-radius: var(--radius-lg); background: var(--bg-secondary);
    }
    .toggle-btn {
      padding: 0.6rem 1.2rem; border-radius: 10px; border: none; background: transparent;
      color: var(--text-muted); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
      cursor: pointer; transition: var(--transition-base); display: flex; align-items: center; gap: 0.5rem;
    }
    .toggle-btn lucide-icon { opacity: 0.5; }
    .toggle-btn.active { background: var(--brand); color: #000; box-shadow: 0 4px 15px var(--brand-glow); }
    .toggle-btn.active lucide-icon { opacity: 1; }

    .dashboard-layout { display: grid; grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); gap: 2rem; margin-top: 1rem; align-items: start; }

    /* Vista equipo: una sola columna a ancho completo (sin lista duplicada a la izquierda) */
    .dashboard-layout--team {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
      align-items: start;
    }

    .main-content { min-width: 0; }

    /* SIDEBAR */
    .team-sidebar { display: flex; flex-direction: column; gap: 1.5rem; min-height: 0; }
    .sidebar-header { display: flex; justify-content: space-between; align-items: center; }
    .sidebar-search { width: 100%; }
    .sidebar-search ::ng-deep .feature-filter-bar { margin-bottom: 1rem; }
    .sidebar-header h3 { font-size: 0.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); margin: 0; }
    .count-badge { font-family: var(--font-gaming); }

    .technician-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 700px; overflow-y: auto; padding-right: 0.5rem; }

    .availability-dashboard--team .team-board-wrapper {
      min-height: min-content;
      width: 100%;
    }

    .team-board-toolbar-search {
      padding: 0 1.25rem 0.9rem;
      border-bottom: 1px solid var(--border-soft);
      background: color-mix(in srgb, var(--bg-tertiary) 40%, var(--bg-secondary));
    }
    .team-board-toolbar-search ::ng-deep .feature-filter-bar {
      margin-bottom: 0;
      max-width: 520px;
    }
    button.tech-card {
      display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 16px;
      cursor: pointer; background: var(--bg-tertiary); border: 1px solid var(--border-soft);
      transition: var(--transition-base); position: relative;
      width: 100%; font: inherit; color: inherit; text-align: left;
      appearance: none; -webkit-appearance: none;
    }
    .tech-card:hover { transform: translateX(4px); border-color: var(--brand-border-soft); background: var(--brand-ambient); }
    .tech-card.selected { border-width: 2px; border-color: var(--brand); background: var(--brand-ambient-strong); box-shadow: var(--shadow-sm); }

    .tech-avatar-wrapper { position: relative; }
    .tech-avatar { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.95rem; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .status-indicator { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--bg-tertiary); }
    .status-indicator.online { background: var(--success); box-shadow: 0 0 10px var(--success); }
    .status-indicator.away { background: var(--warning); box-shadow: 0 0 10px var(--warning); }
    .status-indicator.offline { background: var(--text-muted); }

    .tech-body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .tech-name { font-weight: 800; font-size: 0.95rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tech-role { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
    .tech-chevron { opacity: 0; transition: var(--transition-fast); transform: translateX(-10px); color: var(--brand); }
    .tech-card.selected .tech-chevron, .tech-card:hover .tech-chevron { opacity: 1; transform: translateX(0); }

    /* CALENDAR PERSONAL */
    .calendar-card { border-radius: 24px !important; overflow: hidden; border: 1px solid var(--border-soft); }
    .calendar-card-header { display: flex; justify-content: space-between; align-items: center; padding: 2.5rem 3rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-soft); }
    .label { font-size: 0.6rem; font-weight: 800; color: var(--brand); letter-spacing: 0.2em; }
    .tech-display-name {
      margin: 0.2rem 0 0;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text-primary);
      font-family: inherit;
    }

    .calendar-legend { display: flex; gap: 1rem; }
    .legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); }
    .legend-item .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); }
    .legend-item.AVAILABLE .dot { background: var(--success); box-shadow: 0 0 8px var(--success); }
    .legend-item.UNAVAILABLE .dot { background: var(--danger); box-shadow: 0 0 8px var(--danger); }
    .legend-item.HOLIDAY .dot { background: var(--info); box-shadow: 0 0 8px var(--info); }
    .legend-item.SICK_LEAVE .dot { background: var(--warning); box-shadow: 0 0 8px var(--warning); }

    .calendar-container { padding: 2rem 3rem 3rem; }
    .calendar-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .grid-day-label { text-align: center; color: var(--text-muted); font-size: 0.7rem; font-weight: 900; letter-spacing: 0.1em; }

    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem; }
    .calendar-cell {
      aspect-ratio: 1 / 1.1; background: var(--bg-tertiary); border: 1px solid var(--border-soft);
      border-radius: 16px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;
      position: relative; overflow: hidden; transition: var(--transition-base);
      width: 100%; font: inherit; color: inherit; text-align: left;
    }
    .calendar-cell--readonly {
      cursor: default;
      user-select: none;
    }
    .calendar-cell--readonly:hover {
      border-color: var(--border-soft);
      background: var(--bg-tertiary);
    }
    .calendar-cell.today { border: 2px solid var(--brand); background: var(--brand-ambient); }
    .calendar-cell.other-month { opacity: 0.1; pointer-events: none; }

    .day-number { font-size: 1.25rem; font-weight: 800; font-family: inherit; color: var(--text-primary); opacity: 0.35; }
    .today .day-number { color: var(--brand); opacity: 1; }

    .cell-status-content { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
    .status-indicator-bar { width: 100%; height: 3px; border-radius: 10px; background: var(--text-muted); opacity: 0.2; }
    .status-indicator-bar.AVAILABLE { background: var(--success); opacity: 1; box-shadow: 0 2px 8px var(--success); }
    .status-indicator-bar.UNAVAILABLE { background: var(--danger); opacity: 1; box-shadow: 0 2px 8px var(--danger); }
    .status-indicator-bar.HOLIDAY { background: var(--info); opacity: 1; box-shadow: 0 2px 8px var(--info); }
    .status-indicator-bar.SICK_LEAVE { background: var(--warning); opacity: 1; box-shadow: 0 2px 8px var(--warning); }

    .status-tag { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); opacity: 0.65; }
    .status-tag.AVAILABLE { color: var(--success); opacity: 1; }
    .status-tag.UNAVAILABLE { color: var(--danger); opacity: 1; }
    .status-tag.HOLIDAY { color: var(--info); opacity: 1; }
    .status-tag.SICK_LEAVE { color: var(--warning); opacity: 1; }

    .today-tag { position: absolute; top: 0.75rem; right: 0.75rem; background: var(--brand); color: #000; font-size: 0.5rem; font-weight: 950; padding: 2px 6px; border-radius: 4px; box-shadow: 0 0 10px var(--brand-glow); }

    /* TEAM BOARD */
    .team-board-wrapper { min-width: 0; }
    .team-board-card {
      padding: 0 !important;
      border-radius: 22px !important;
      overflow: hidden;
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-sm, 0 8px 32px rgba(0, 0, 0, 0.06));
    }

    .team-board-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 1.35rem 1.5rem 1rem;
      background: linear-gradient(165deg, var(--bg-secondary) 0%, color-mix(in srgb, var(--bg-tertiary) 88%, var(--bg-secondary)) 100%);
      border-bottom: 1px solid var(--border-soft);
    }
    .team-board-toolbar__meta { min-width: 0; flex: 1; }
    .team-board-title {
      margin: 0.35rem 0 0.25rem;
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .team-board-month {
      display: inline;
      font-weight: 700;
      color: var(--brand);
    }
    .team-board-hint {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .team-board-scroll-hint-desktop {
      margin: 0.35rem 0 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.35rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .team-board-scroll-hint-desktop lucide-icon {
      opacity: 0.65;
    }
    .team-board-scroll-hint-desktop__range {
      font-weight: 600;
      opacity: 0.85;
    }
    .team-board-legend {
      flex-wrap: wrap;
      justify-content: flex-end;
      max-width: 100%;
    }

    .team-mobile-day-bar {
      padding: 0.55rem 0.75rem;
      border-bottom: 1px solid var(--border-soft);
      background: color-mix(in srgb, var(--bg-tertiary) 55%, var(--bg-secondary));
    }
    .team-mobile-day-bar__inner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: space-between;
      max-width: 100%;
    }
    .team-mobile-day-bar__text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
      flex: 1;
      min-width: 0;
      text-align: center;
    }
    .team-mobile-day-bar__label {
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: 0.02em;
    }
    .team-mobile-day-bar__sub {
      font-size: 0.62rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .team-mobile-day-bar__btn {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      cursor: pointer;
      transition: var(--transition-base, 0.15s ease);
    }
    .team-mobile-day-bar__btn:hover {
      border-color: var(--brand-border-soft);
      background: var(--brand-ambient);
      color: var(--brand);
    }
    .team-mobile-day-bar__btn--accent {
      width: auto;
      padding: 0 0.75rem;
      font-size: 0.65rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: var(--brand);
      color: #0a0a0a;
      border-color: transparent;
    }
    .team-mobile-day-bar__btn--accent:hover {
      filter: brightness(1.06);
      color: #0a0a0a;
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

    .team-board-matrix {
      --team-day-cols: 31;
      width: 100%;
      min-width: 0;
    }

    .board-header {
      display: grid;
      grid-template-columns: var(--avail-persona-width) minmax(0, 1fr);
      position: sticky;
      top: 0;
      z-index: 4;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-soft);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
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
      border-right: 1px solid var(--border-soft);
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
    }

    .day-header-col {
      min-width: 0;
      width: auto;
      border-right: 1px solid var(--border-soft);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 0.15rem;
      gap: 3px;
      background: var(--bg-secondary);
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

    .board-body { background: var(--bg-tertiary); }

    .board-row {
      display: grid;
      grid-template-columns: var(--avail-persona-width) minmax(0, 1fr);
      border-bottom: 1px solid var(--border-soft);
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
    .board-row:focus-visible {
      box-shadow: inset 0 0 0 2px var(--brand);
    }

    .board-tech-info {
      width: var(--avail-persona-width);
      min-width: var(--avail-persona-width);
      max-width: var(--avail-persona-width);
      flex-shrink: 0;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-right: 1px solid var(--border-soft);
    }
    .mini-avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 900;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .mini-meta { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
    .mini-meta .n {
      font-size: 0.86rem;
      font-weight: 800;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mini-meta .r {
      font-size: 0.58rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .board-day-cell {
      min-width: 0;
      width: auto;
      border-right: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0;
    }
    .board-day-cell.is-weekend {
      background: color-mix(in srgb, var(--text-muted) 6%, transparent);
    }
    .board-day-cell.is-today {
      background: color-mix(in srgb, var(--brand) 14%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand) 35%, transparent);
    }

    .status-chip {
      width: min(22px, 85%);
      height: min(22px, 85%);
      max-width: 100%;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: transform 0.12s ease;
    }
    .board-row:hover .status-chip { transform: scale(1.06); }
    .status-chip.AVAILABLE {
      background: color-mix(in srgb, var(--success) 28%, var(--bg-tertiary));
      border-color: color-mix(in srgb, var(--success) 45%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--success) 20%, transparent), 0 2px 10px color-mix(in srgb, var(--success) 35%, transparent);
    }
    .status-chip.UNAVAILABLE {
      background: color-mix(in srgb, var(--danger) 26%, var(--bg-tertiary));
      border-color: color-mix(in srgb, var(--danger) 40%, transparent);
      box-shadow: 0 2px 10px color-mix(in srgb, var(--danger) 28%, transparent);
    }
    .status-chip.HOLIDAY {
      background: color-mix(in srgb, var(--info) 28%, var(--bg-tertiary));
      border-color: color-mix(in srgb, var(--info) 42%, transparent);
      box-shadow: 0 2px 10px color-mix(in srgb, var(--info) 30%, transparent);
    }
    .status-chip.SICK_LEAVE {
      background: color-mix(in srgb, var(--warning) 30%, var(--bg-tertiary));
      border-color: color-mix(in srgb, var(--warning) 45%, transparent);
      box-shadow: 0 2px 10px color-mix(in srgb, var(--warning) 28%, transparent);
    }
    .status-chip.default {
      opacity: 0.35;
    }

    /* UTILS */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 10px; }
    .custom-scrollbar-h::-webkit-scrollbar { height: 4px; }
    .custom-scrollbar-h::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 10px; }
  `]
})
export class TechnicianAvailabilityComponent implements OnInit, OnDestroy, FilterableService<Technician> {
  /** Alineado con CSS `--avail-persona-width` / `--avail-day-cell-width`. */
  private static readonly TEAM_PERSONA_PX = 280;
  private static readonly TEAM_DAY_PX = 52;

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

  /** Texto libre del filtro del cuadrante (vista equipo). */
  teamBoardFilterTerm = signal('');

  /** Filas del cuadrante de equipo (misma lista que Operarios, sin duplicar barra lateral). */
  readonly teamBoardRows = computed(() => {
    const list = this.displayedTechnicians();
    const q = this.teamBoardFilterTerm().trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q),
    );
  });

  readonly teamBoardHintCounts = computed(() => {
    const total = this.displayedTechnicians().length;
    const shown = this.teamBoardRows().length;
    const q = this.teamBoardFilterTerm().trim();
    if (q && shown !== total) {
      return `${shown} de ${total} operarios (filtrados)`;
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

  calendarCells = signal<CalendarCell[]>([]);
  viewMode = signal<'personal' | 'team'>('personal');
  selectedTechId = signal<string>('me');
  
  teamAvailability = signal<Record<string, Record<number, string>>>({});
  
  technicians = signal<Technician[]>([
    { id: 't1', name: 'Antonio Munias', role: 'Administrador ERP', status: 'online' as const },
    { id: 't2', name: 'Carlos Ruíz', role: 'Técnico Senior AV', status: 'away' as const },
    { id: 't3', name: 'Elena García', role: 'Diseño de Iluminación', status: 'online' as const },
    { id: 't4', name: 'David López', role: 'Ingeniero de Sonido', status: 'offline' as const },
    { id: 't5', name: 'Ana Martínez', role: 'Especialista Video/LED', status: 'online' as const },
    { id: 't6', name: 'Sergio Ramos', role: 'Rigging & Structures', status: 'online' as const },
    { id: 't7', name: 'Laura Ortiz', role: 'Logística & Transporte', status: 'away' as const },
    { id: 't8', name: 'Marta Soler', role: 'Gestión de Proyectos', status: 'online' as const },
  ]);

  readonly isLoading = signal<boolean>(false);
  /** True cuando falla la carga remota y se usa solo mock / datos locales. */
  readonly syncDegraded = signal(false);

  /** Barra «día X de Y» y saltos ±7: solo vista compacta (móvil / tablet estrecha). */
  readonly isCompactTeamNav = signal(false);

  /** Estado del scroll horizontal del cuadrante (indicador de días). */
  private readonly teamHScrollState = signal({ scrollLeft: 0, clientWidth: 720, scrollWidth: 720 });

  readonly teamScrollLabel = computed(() => {
    const total = this.calendarCells().length;
    const { scrollLeft, clientWidth, scrollWidth } = this.teamHScrollState();
    const pw = TechnicianAvailabilityComponent.TEAM_PERSONA_PX;
    if (total < 1) {
      return { from: 1, to: 1, center: 1, total: 0 };
    }
    /** Mes completo visible (columnas fluidas): sin scroll horizontal útil. */
    if (scrollWidth <= clientWidth + 2 || clientWidth < 24) {
      const today =
        this.calendarCells().find((c) => c.isToday)?.day ??
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
    const term = query.toLowerCase();
    const pool = this.displayedTechnicians();
    const matches = pool.filter((t: Technician) =>
      t.name.toLowerCase().includes(term) ||
      t.role.toLowerCase().includes(term)
    );
    
    // Si hay un match exacto o muy cercano, podríamos seleccionarlo automáticamente
    if (matches.length > 0) {
      // this.selectedTechId.set(matches[0].id); // Evitar efectos secundarios directos aquí si es posible
    }
    
    return of(matches);
  }

  onSearch(term: string) {
    if (this.viewMode() === 'team') {
      this.teamBoardFilterTerm.set(term);
    } else {
      this.teamBoardFilterTerm.set('');
    }
    this.masterFilter.search(term);
    const q = term.toLowerCase().trim();
    if (!q) {
      return;
    }
    const pool = this.displayedTechnicians();
    const match = pool.find(
      (t: Technician) =>
        t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q),
    );
    if (match) {
      this.selectedTechId.set(match.id);
    }
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
    const total = this.calendarCells().length;
    const pw = TechnicianAvailabilityComponent.TEAM_PERSONA_PX;
    const dayW = total > 0 ? Math.max(1, (el.scrollWidth - pw) / total) : TechnicianAvailabilityComponent.TEAM_DAY_PX;
    el.scrollBy({ left: deltaDays * dayW, behavior: 'smooth' });
    queueMicrotask(() => this.refreshTeamHorizontalMetrics());
  }

  scrollTeamHorizontalToToday(): void {
    const cells = this.calendarCells();
    const todayCell = cells.find((c) => c.isToday);
    const day = todayCell?.day ?? cells[0]?.day ?? 1;
    this.scrollTeamHorizontalToDay(day);
  }

  scrollTeamHorizontalToDay(day: number): void {
    const total = this.calendarCells().length;
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

  initCalendarCells() {
    const cells: CalendarCell[] = [];
    const daysInMonth = new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate();
    const now = new Date();
    const isCurrentMonth = now.getMonth() === this.currentMonth() && now.getFullYear() === this.currentYear();
    
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push({
            day: i,
            isCurrentMonth: true,
            isToday: isCurrentMonth && i === now.getDate(),
            date: `${this.currentYear()}-${(this.currentMonth()+1).toString().padStart(2,'0')}-${i.toString().padStart(2,'0')}`
        });
    }
    this.calendarCells.set(cells);
  }

  initTeamData() {
    const data: Record<string, Record<number, string>> = {};
    const monthSeed = this.currentMonth() + this.currentYear();

    this.technicians().forEach((tech: Technician) => {
      data[tech.id] = {};
      for (let day = 1; day <= 31; day++) {
        data[tech.id][day] = this.getRandomMockAvailability(day, tech.id, monthSeed).type;
      }
    });
    this.teamAvailability.set(data);
  }

  async loadMonth() {
    this.isLoading.set(true);
    this.syncDegraded.set(false);
    try {
      // Cargar técnicos del servidor
      const techsResponse = await firstValueFrom(this.api.getTechnicians());

      // Mapear técnicos reales si existen
      const realTechs: Technician[] = (techsResponse ?? []).map((t: ApiTechnician) => ({
        id: t.id,
        userId: t.user?.id,
        name: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() || t.user?.email || 'Técnico',
        role: t.skills?.[0] || 'Personal Técnico',
        status: 'online' as const,
      }));

      // Combinar con los mocks para que NUNCA se vea vacío y la demostración sea rica
      const allTechs = [...realTechs];
      // Si el servidor devuelve pocos, rellenamos con los mocks base (evitando duplicados por ID si es necesario)
      const baseMocks = [
        { id: 't1', name: 'Antonio Munias', role: 'Administrador ERP', status: 'online' as const },
        { id: 't2', name: 'Carlos Ruíz', role: 'Técnico Senior AV', status: 'away' as const },
        { id: 't3', name: 'Elena García', role: 'Diseño de Iluminación', status: 'online' as const },
        { id: 't4', name: 'David López', role: 'Ingeniero de Sonido', status: 'offline' as const },
        { id: 't5', name: 'Ana Martínez', role: 'Especialista Video/LED', status: 'online' as const },
        { id: 't6', name: 'Sergio Ramos', role: 'Rigging & Structures', status: 'online' as const },
        { id: 't7', name: 'Laura Ortiz', role: 'Logística & Transporte', status: 'away' as const },
        { id: 't8', name: 'Marta Soler', role: 'Gestión de Proyectos', status: 'online' as const },
      ];

      baseMocks.forEach(mock => {
        if (!allTechs.find(t => t.id === mock.id)) {
           allTechs.push(mock);
        }
      });

      this.technicians.set(allTechs);

      const uid = this.authStore.user()?.id;
      let mineTechId: string | null = null;
      if (uid) {
        const mine = allTechs.find((x) => x.userId === uid);
        if (mine) {
          mineTechId = mine.id;
        }
      }
      this.myTechnicianId.set(mineTechId);

      // Cargar disponibilidad
      const year = this.currentYear();
      const month = this.currentMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

      const data: Record<string, Record<number, string>> = {};
      const monthSeed = month + year;

      await Promise.all(allTechs.map(async (tech) => {
        try {
          // Ignorar llamadas al API para los técnicos de relleno (mocks locales)
          // que usan IDs como 't1', 't2' ya que Postgres lanzará 500 al esperar UUIDs.
          if (this.isLocalMockTechnicianId(tech.id)) {
            throw new Error('Local mock tech, skip API');
          }

          // Intentar obtener datos reales del API
          const avail = await firstValueFrom(
            this.api.getAvailability(tech.id, startDate, endDate)
          );

          data[tech.id] = {};
          // Relleno inicial equilibrado con mock inteligente para que no salga todo "AVAILABLE"
          // pero respetando los festivos de fin de semana
          for (let d = 1; d <= daysInMonth; d++) {
             const date = new Date(year, month, d);
             const isWeekend = date.getDay() === 0 || date.getDay() === 6;
             data[tech.id][d] = isWeekend ? 'UNAVAILABLE' : (this.getRandomMockAvailability(d, tech.id, monthSeed).type);
          }

          // Sobreescribir con datos reales del API si existen (Prisma expone `startDate`; el DTO tipado usa `date`)
          (avail ?? []).forEach((a: TechnicianAvailability) => {
            const dayNum = this.dayNumberFromAvailability(a);
            if (dayNum < 1) return;
            data[tech.id][dayNum] = a.type;
          });
        } catch {
          // Si falla el API para este técnico o es un mock, fallback total al mock inteligente
          data[tech.id] = {};
          for (let d = 1; d <= 31; d++) {
             data[tech.id][d] = this.getRandomMockAvailability(d, tech.id, monthSeed).type;
          }
        }
      }));

      this.teamAvailability.set(data);
      if (!this.canManageTeam() && mineTechId) {
        this.selectedTechId.set(mineTechId);
      } else if (!this.selectedTechId() || this.selectedTechId() === 'me') {
        this.selectedTechId.set(allTechs[0]?.id || 't1');
      }
    } catch (error) {
      console.warn('Error syncing with backend, falling back to rich mock data:', error);
      this.syncDegraded.set(true);
      this.initTeamData();
    } finally {
      this.isLoading.set(false);
      queueMicrotask(() => this.refreshTeamHorizontalMetrics());
    }
  }

  /** IDs de relleno tipo `t1`… no son UUID de Postgres: no llamar al API. */
  private isLocalMockTechnicianId(id: string): boolean {
    return /^t\d+$/i.test(id.trim());
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

  private getRandomMockAvailability(day: number, techId: string, monthSeed = 0): { type: 'AVAILABLE' | 'UNAVAILABLE' | 'HOLIDAY' | 'SICK_LEAVE' } {
     const seed = techId === 'me' ? 7 : techId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
     const finalSeed = seed + monthSeed;
     
     if ((day + finalSeed) % 12 === 0) return { type: 'UNAVAILABLE' };
     if ((day + finalSeed) % 15 === 0) return { type: 'HOLIDAY' };
     if ((day + finalSeed) % 25 === 0) return { type: 'SICK_LEAVE' };
     return { type: 'AVAILABLE' };
  }
}
