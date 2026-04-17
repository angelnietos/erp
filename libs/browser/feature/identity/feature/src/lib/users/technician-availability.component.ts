import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
} from '@josanz-erp/shared-ui-kit';
import { Observable, of, firstValueFrom } from 'rxjs';


interface Technician {
  id: string;
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
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver disponibilidad del equipo."
        permissionHint="users.view"
      />
    } @else {
    <div class="availability-dashboard availability-container animate-fade-in">
      <ui-feature-header
        title="Disponibilidad técnica"
        subtitle="Cuadrante mensual del equipo: disponible, ocupado, vacaciones o incidencia por día."
        icon="calendar-days"
      />

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

           <div class="view-toggle">
              <button 
                class="toggle-btn" 
                [class.active]="viewMode() === 'personal'"
                (click)="viewMode.set('personal')"
              >
                <lucide-icon name="user" size="14"></lucide-icon>
                Individual
              </button>
              <button 
                class="toggle-btn" 
                [class.active]="viewMode() === 'team'"
                (click)="viewMode.set('team')"
              >
                <lucide-icon name="users" size="14"></lucide-icon>
                Equipo
              </button>
           </div>
           
           <div class="header-actions-extra">
              <button
                type="button"
                class="request-days-btn"
                [routerLink]="['/users/availability', 'request']"
                [queryParams]="{ techId: selectedTechId() }"
                title="Solicitar vacaciones o ausencias en bloque"
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

      <div class="dashboard-layout">
        <!-- SIDEBAR: TEAM LIST -->
        <aside class="team-sidebar animate-slide-right">
          <div class="sidebar-header">
            <h3>Operarios AV</h3>
            <ui-badge variant="info" class="count-badge">{{ technicians().length }}</ui-badge>
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
            @for (tech of technicians(); track tech.id) {
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
                      <button
                        type="button"
                        class="calendar-cell"
                        [class.other-month]="!cell.isCurrentMonth"
                        [class.today]="cell.isToday"
                        (click)="toggleAvailability(cell)"
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
                      </button>
                    }
                  </div>
                </div>
              </ui-card>
            </div>
          } @else {
            <!-- TEAM BOARD VIEW -->
            <div class="team-board-wrapper animate-slide-up">
              <ui-card shape="auto" class="team-board-card">
                <div class="board-header">
                   <div class="header-col persona-col">Equipo Josanz</div>
                   <div class="days-column-container custom-scrollbar-h">
                      @for (cell of calendarCells(); track cell.date) {
                        <div class="day-header-col" [class.is-today]="cell.isToday">
                          <span class="d-n">{{ cell.day }}</span>
                          <span class="d-l">{{ getDayOfWeekName(cell.day).substring(0,1) }}</span>
                        </div>
                      }
                   </div>
                </div>
                
                <div class="board-rows custom-scrollbar">
                   @for (tech of technicians(); track tech.id) {
                     <div class="board-row" [class.is-selected]="selectedTechId() === tech.id">
                        <div class="board-tech-info">
                           <div class="mini-avatar" [style.background]="getAvatarColor(tech.name)">{{ tech.name.substring(0,1) }}</div>
                           <div class="mini-meta">
                              <span class="n">{{ tech.name }}</span>
                              <span class="r">{{ tech.role }}</span>
                           </div>
                        </div>
                        <div class="board-cells-container">
                           @for (cell of calendarCells(); track cell.date) {
                              <div class="board-day-cell" [class.is-today]="cell.isToday">
                                 @if (getTechDayStatus(tech.id, cell.day); as status) {
                                    <div class="status-marker" [class]="status" [title]="getShortLabel(status)"></div>
                                 } @else {
                                    <div class="status-marker default"></div>
                                 }
                              </div>
                           }
                        </div>
                     </div>
                   }
                </div>
              </ui-card>
            </div>
          }
        </main>
      </div>
    </div>
    }
  `,
  styles: [`
    .availability-dashboard {
      display: flex; flex-direction: column; gap: 1.25rem;
      padding: 0 1rem 2rem;
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

    .dashboard-layout { display: grid; grid-template-columns: 340px 1fr; gap: 2rem; margin-top: 1rem; }

    /* SIDEBAR */
    .team-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
    .sidebar-header { display: flex; justify-content: space-between; align-items: center; }
    .sidebar-search { width: 100%; }
    .sidebar-search ::ng-deep .feature-filter-bar { margin-bottom: 1rem; }
    .sidebar-header h3 { font-size: 0.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); margin: 0; }
    .count-badge { font-family: var(--font-gaming); }

    .technician-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 700px; overflow-y: auto; padding-right: 0.5rem; }
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
    button.calendar-cell {
      aspect-ratio: 1 / 1.1; background: var(--bg-tertiary); border: 1px solid var(--border-soft);
      border-radius: 16px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;
      position: relative; overflow: hidden; cursor: pointer; transition: var(--transition-base);
      width: 100%; font: inherit; color: inherit; text-align: left;
      appearance: none; -webkit-appearance: none;
    }
    .calendar-cell:hover { transform: translateY(-4px) scale(1.02); border-color: var(--brand-border-soft); background: var(--brand-ambient); z-index: 5; }
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
    .team-board-card { padding: 0 !important; border-radius: 20px !important; overflow: hidden; }
    .board-header { display: flex; background: var(--bg-secondary); border-bottom: 2px solid var(--border-soft); }
    .persona-col { width: 240px; flex-shrink: 0; padding: 1.5rem; font-weight: 900; text-transform: uppercase; color: var(--brand); font-size: 0.7rem; border-right: 1px solid var(--border-soft); }
    .days-column-container { display: flex; overflow-x: auto; flex: 1; }
    .day-header-col { width: 44px; flex-shrink: 0; border-right: 1px solid var(--border-soft); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.75rem 0; gap: 2px; }
    .day-header-col.is-today { background: var(--brand-ambient); }
    .day-header-col .d-n { font-size: 0.9rem; font-weight: 900; }
    .day-header-col .d-l { font-size: 0.55rem; opacity: 0.5; font-weight: 800; }

    .board-row { display: flex; border-bottom: 1px solid var(--border-soft); height: 56px; transition: var(--transition-fast); }
    .board-row:hover { background: var(--bg-secondary); }
    .board-row.is-selected { background: var(--brand-ambient); }
    
    .board-tech-info { width: 240px; flex-shrink: 0; padding: 0 1.5rem; display: flex; align-items: center; gap: 0.75rem; border-right: 1px solid var(--border-soft); }
    .mini-avatar { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; color: #fff; }
    .mini-meta { display: flex; flex-direction: column; }
    .mini-meta .n { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); }
    .mini-meta .r { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; }

    .board-cells-container { display: flex; flex: 1; overflow-x: auto; }
    .board-day-cell { width: 44px; flex-shrink: 0; border-right: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: center; }
    .board-day-cell.is-today { background: rgba(255,255,255,0.02); }
    .status-marker { width: 24px; height: 6px; border-radius: 10px; background: rgba(255,255,255,0.05); }
    .status-marker.AVAILABLE { background: var(--success); box-shadow: 0 0 6px var(--success); }
    .status-marker.UNAVAILABLE { background: var(--danger); box-shadow: 0 0 6px var(--danger); }
    .status-marker.HOLIDAY { background: var(--info); box-shadow: 0 0 6px var(--info); }
    .status-marker.SICK_LEAVE { background: var(--warning); box-shadow: 0 0 6px var(--warning); }

    /* UTILS */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 10px; }
    .custom-scrollbar-h::-webkit-scrollbar { height: 4px; }
    .custom-scrollbar-h::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 10px; }
  `]
})
export class TechnicianAvailabilityComponent implements OnInit, OnDestroy, FilterableService<Technician> {
  private readonly api = inject(TechnicianApiService);
  private readonly toast = inject(ToastService);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'users.view', 'users.manage');

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

  currentMonth = signal<number>(new Date().getMonth());
  currentYear = signal<number>(new Date().getFullYear());

  constructor() {
    effect(() => {
      this.initCalendarCells();
      // Cuando cambia mes/año, recargamos datos del servidor
      void this.loadMonth();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.masterFilter.registerProvider(this);
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Technician[]> {
    const term = query.toLowerCase();
    const matches = this.technicians().filter((t: Technician) => 
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
    this.masterFilter.search(term);
    const match = this.technicians().find((t: Technician) => t.name.toLowerCase().includes(term.toLowerCase()));
    if (match) {
      this.selectedTechId.set(match.id);
    }
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
    try {
      // Cargar técnicos del servidor
      const techsResponse = await firstValueFrom(this.api.getTechnicians());

      // Mapear técnicos reales si existen
      const realTechs: Technician[] = (techsResponse ?? []).map((t: ApiTechnician) => ({
        id: t.id,
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
      if (!this.selectedTechId() || this.selectedTechId() === 'me') {
        this.selectedTechId.set(allTechs[0]?.id || 't1');
      }
    } catch (error) {
      console.warn('Error syncing with backend, falling back to rich mock data:', error);
      this.initTeamData();
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleAvailability(cell: CalendarCell) {
    const currentTechId = this.selectedTechId();

    const types: string[] = ['AVAILABLE', 'UNAVAILABLE', 'HOLIDAY', 'SICK_LEAVE'];
    const currentStatus = this.getTechDayStatus(currentTechId, cell.day);
    const currentIdx = types.indexOf(currentStatus);
    const nextType = types[(currentIdx + 1) % types.length];

    const applyOptimistic = () => {
      this.teamAvailability.update((prev: Record<string, Record<number, string>>) => {
        const updated = { ...prev };
        if (!updated[currentTechId]) updated[currentTechId] = {};
        updated[currentTechId][cell.day] = nextType;
        return updated;
      });
    };

    if (this.isLocalMockTechnicianId(currentTechId)) {
      applyOptimistic();
      this.toast.show(
        `${this.getShortLabel(nextType)} (solo en esta vista demo; elige un técnico real para sincronizar).`,
        'success',
        2800
      );
      return;
    }

    if (!this.isPersistableTechnicianId(currentTechId)) {
      this.toast.show(
        'No se puede guardar en el servidor: el técnico seleccionado no tiene un id válido. Recarga o elige un técnico cargado desde el ERP.',
        'error',
        4500
      );
      return;
    }

    applyOptimistic();

    this.api.setFullDayAvailability(currentTechId, cell.date, nextType).subscribe({
      next: () => {
        this.toast.show(`Disponibilidad guardada: ${this.getShortLabel(nextType)}`, 'success', 2000);
      },
      error: (err: unknown) => {
        console.error('Error guardando disponibilidad:', err);
        this.teamAvailability.update((prev: Record<string, Record<number, string>>) => {
          const reverted = { ...prev };
          if (reverted[currentTechId]) reverted[currentTechId][cell.day] = currentStatus;
          return reverted;
        });
        this.toast.show(this.availabilitySaveErrorMessage(err), 'error', 5000);
      }
    });
  }

  private availabilitySaveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const m = (body as { message: unknown }).message;
        if (typeof m === 'string' && m.trim()) {
          return m;
        }
        if (Array.isArray(m) && m.length) {
          return m.map(String).join(' ');
        }
      }
      if (err.status === 401) {
        return 'No autorizado: falta tenant o sesión. Cierra sesión y vuelve a entrar.';
      }
      if (err.status === 403) {
        return 'Acceso denegado para este tenant.';
      }
      if (err.status === 404) {
        return 'Técnico no encontrado en este tenant.';
      }
      if (err.status === 400) {
        return 'Datos no válidos para el servidor. Revisa fecha y estado.';
      }
    }
    return 'Error al guardar disponibilidad. Reinténtalo.';
  }

  /** IDs de relleno tipo `t1`… no son UUID de Postgres: no llamar al API. */
  private isLocalMockTechnicianId(id: string): boolean {
    return /^t\d+$/i.test(id.trim());
  }

  /** `me` lo resuelve el backend; resto deben ser UUID de Postgres. */
  private isPersistableTechnicianId(id: string): boolean {
    const v = id.trim();
    if (v === 'me') {
      return true;
    }
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
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

  private getRandomMockAvailability(day: number, techId: string, monthSeed = 0): { type: 'AVAILABLE' | 'UNAVAILABLE' | 'HOLIDAY' | 'SICK_LEAVE' } {
     const seed = techId === 'me' ? 7 : techId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
     const finalSeed = seed + monthSeed;
     
     if ((day + finalSeed) % 12 === 0) return { type: 'UNAVAILABLE' };
     if ((day + finalSeed) % 15 === 0) return { type: 'HOLIDAY' };
     if ((day + finalSeed) % 25 === 0) return { type: 'SICK_LEAVE' };
     return { type: 'AVAILABLE' };
  }
}
