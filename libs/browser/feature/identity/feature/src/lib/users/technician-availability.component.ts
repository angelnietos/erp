import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianApiService } from '@josanz-erp/shared-data-access';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@josanz-erp/shared-ui-kit';

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
  availability?: {
    type: 'AVAILABLE' | 'UNAVAILABLE' | 'HOLIDAY' | 'SICK_LEAVE';
  };
}

@Component({
  selector: 'josanz-technician-availability',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent, UiButtonComponent, UiBadgeComponent],
  template: `
    <div class="availability-dashboard animate-fade-in">
      <!-- DASHBOARD HEADER -->
      <header class="dashboard-header">
        <div class="header-info">
          <h1 class="page-title text-uppercase glow-text">Disponibilidad Técnica</h1>
          <p class="text-friendly">Gestión integrada de horarios y ausencias del equipo.</p>
        </div>
        <div class="header-actions">
           <div class="view-toggle ui-glass">
              <button 
                class="toggle-btn" 
                [class.active]="viewMode() === 'personal'"
                (click)="viewMode.set('personal')"
              >
                Mi Calendario
              </button>
              <button 
                class="toggle-btn" 
                [class.active]="viewMode() === 'team'"
                (click)="viewMode.set('team')"
              >
                Vista de Equipo
              </button>
           </div>
           <ui-josanz-button variant="primary" icon="rotate-cw" (clicked)="loadMonth()"></ui-josanz-button>
        </div>
      </header>

      <div class="dashboard-layout">
        <!-- SIDEBAR: TEAM LIST -->
        <aside class="team-sidebar ui-glass">
          <div class="sidebar-header">
            <h3>Técnicos</h3>
            <ui-josanz-badge variant="info">{{ technicians().length }}</ui-josanz-badge>
          </div>
          <div class="technician-list">
            @for (tech of technicians(); track tech.id) {
              <div 
                class="tech-item ui-neon" 
                [class.selected]="selectedTechId() === tech.id"
                (click)="selectedTechId.set(tech.id)"
              >
                <div class="tech-avatar" [style.background]="getAvatarColor(tech.name)">
                  {{ tech.name.substring(0, 2).toUpperCase() }}
                  <span class="status-dot" [class]="tech.status"></span>
                </div>
                <div class="tech-info">
                  <span class="tech-name">{{ tech.name }}</span>
                  <span class="tech-role">{{ tech.role }}</span>
                </div>
              </div>
            }
          </div>
        </aside>

        <!-- MAIN CALENDAR / TEAM BOARD -->
        <main class="main-content">
          @if (viewMode() === 'personal') {
            <ui-josanz-card shape="auto" class="calendar-card">
              <div class="calendar-header">
                <h2>{{ currentMonthName() }} <span>{{ currentYear() }}</span></h2>
                <div class="calendar-legend">
                  <div class="legend-item"><span class="dot AVAILABLE"></span><span>Disponible</span></div>
                  <div class="legend-item"><span class="dot UNAVAILABLE"></span><span>No disp.</span></div>
                  <div class="legend-item"><span class="dot HOLIDAY"></span><span>Vacaciones</span></div>
                </div>
              </div>
              
              <div class="calendar-grid">
                @for (day of ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']; track day) {
                  <div class="day-header">{{ day }}</div>
                }
                
                @for (cell of calendarCells(); track cell.date) {
                  <div 
                    class="calendar-cell"
                    [class.other-month]="!cell.isCurrentMonth"
                    [class.today]="cell.isToday"
                  >
                    <div class="cell-head">
                      <span class="cell-day">{{ cell.day }}</span>
                    </div>
                    
                    <div class="cell-body">
                      @if (cell.availability) {
                         <div class="status-indicator" [class]="cell.availability.type" (click)="toggleAvailability(cell)">
                            <div class="indicator-glow"></div>
                            <span class="indicator-label">{{ getShortLabel(cell.availability.type) }}</span>
                         </div>
                      }
                    </div>
                    <div class="cell-hover-glow"></div>
                  </div>
                }
              </div>
            </ui-josanz-card>
          } @else {
            <div class="team-view-placeholder ui-glass">
              <lucide-icon name="users" size="48" class="placeholder-icon"></lucide-icon>
              <h3>Vista de Equipo en Desarrollo</h3>
              <p>Aquí se mostrará un cuadrante de disponibilidad comparada para todo el equipo.</p>
              <ui-josanz-button variant="app" (clicked)="viewMode.set('personal')">Volver a Mi Vista</ui-josanz-button>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .availability-dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .view-toggle {
      display: flex;
      padding: 4px;
      gap: 4px;
      border-radius: 50px !important;
      background: rgba(0,0,0,0.2) !important;
    }

    .toggle-btn {
      padding: 0.5rem 1.25rem;
      border-radius: 50px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.3s var(--ease-out-expo);
    }

    .toggle-btn.active {
      background: var(--brand);
      color: #fff;
      box-shadow: 0 4px 15px var(--brand-glow);
    }

    .dashboard-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      align-items: flex-start;
    }

    .team-sidebar {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-height: 500px;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sidebar-header h3 {
      font-size: 0.85rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0;
    }

    .technician-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tech-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      background: rgba(255,255,255,0.02);
      border: 1px solid transparent;
      transition: all 0.3s var(--ease-out-expo);
    }

    .tech-item:hover {
      background: rgba(255,255,255,0.05);
    }

    .tech-item.selected {
      background: var(--brand-ambient);
      border-color: var(--brand-border-soft);
      transform: translateX(5px);
    }

    .tech-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 0.8rem;
      position: relative;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--bg-primary);
    }

    .status-dot.online { background: var(--success); }
    .status-dot.away { background: var(--warning); }
    .status-dot.offline { background: var(--text-muted); }

    .tech-info {
      display: flex;
      flex-direction: column;
    }

    .tech-name { font-weight: 700; font-size: 0.85rem; color: var(--text-primary); }
    .tech-role { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; }

    .main-content {
      flex: 1;
    }

    .calendar-card {
      padding: 2rem !important;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .calendar-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-family: var(--font-display);
      text-transform: uppercase;
    }

    .calendar-header h2 span {
      color: var(--brand);
      opacity: 0.8;
    }

    .calendar-legend {
      display: flex;
      gap: 1.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.AVAILABLE { background: var(--success); box-shadow: 0 0 8px var(--success); }
    .dot.UNAVAILABLE { background: var(--danger); box-shadow: 0 0 8px var(--danger); }
    .dot.HOLIDAY { background: var(--info); box-shadow: 0 0 8px var(--info); }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1rem;
    }

    .day-header {
      text-align: center;
      font-size: 0.65rem;
      font-weight: 900;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid rgba(255,255,255,0.05);
    }

    .calendar-cell {
      min-height: 110px;
      background: rgba(255,255,255,0.015);
      border: 1px solid rgba(255,255,255,0.04);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.4s var(--ease-out-expo);
    }

    .calendar-cell:hover {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.1);
      transform: translateY(-4px);
    }

    .calendar-cell.other-month { opacity: 0.2; }
    .calendar-cell.today {
      background: var(--brand-ambient-strong);
      border-color: var(--brand);
    }

    .cell-day {
      font-size: 0.9rem;
      font-weight: 900;
      font-family: var(--font-display);
      color: var(--text-muted);
    }

    .today .cell-day { color: var(--text-primary); }

    .cell-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-indicator {
      position: relative;
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .status-indicator:hover { transform: scale(1.05); }

    .indicator-label {
      font-size: 0.55rem;
      font-weight: 900;
      text-transform: uppercase;
      z-index: 2;
    }

    .AVAILABLE { color: var(--success); }
    .UNAVAILABLE { color: var(--danger); }
    .HOLIDAY { color: var(--info); }
    .SICK_LEAVE { color: var(--warning); }

    .indicator-glow {
      position: absolute;
      inset: 0;
      border-radius: 4px;
      background: currentColor;
      opacity: 0.12;
    }

    .status-indicator:hover .indicator-glow { opacity: 0.25; }

    .team-view-placeholder {
      height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      text-align: center;
    }

    .placeholder-icon { color: var(--brand); opacity: 0.4; }
  `]
})
export class TechnicianAvailabilityComponent implements OnInit {
  private readonly api = inject(TechnicianApiService);
  
  calendarCells = signal<CalendarCell[]>([]);
  viewMode = signal<'personal' | 'team'>('personal');
  selectedTechId = signal<string>('me');
  
  technicians = signal<Technician[]>([
    { id: 'me', name: 'Antonio Munias', role: 'Administrador', status: 'online' },
    { id: 't2', name: 'Carlos Ruíz', role: 'Técnico Senior', status: 'away' },
    { id: 't3', name: 'Elena García', role: 'Técnica Junior', status: 'online' },
    { id: 't4', name: 'David López', role: 'Técnico Senior', status: 'offline' },
    { id: 't5', name: 'Ana Martínez', role: 'Especialista Audiovisual', status: 'online' },
  ]);

  currentMonthName = signal<string>('Abril');
  currentYear = signal<number>(2026);

  ngOnInit() {
    this.loadMonth();
  }

  loadMonth() {
    const now = new Date();
    const cells: CalendarCell[] = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push({
            day: i,
            isCurrentMonth: true,
            isToday: i === now.getDate(),
            date: `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${i.toString().padStart(2,'0')}`,
            availability: this.getRandomMockAvailability(i)
        });
    }
    this.calendarCells.set(cells);
  }

  toggleAvailability(cell: CalendarCell) {
    if (this.selectedTechId() !== 'me') return;

    const types: ('AVAILABLE' | 'UNAVAILABLE' | 'HOLIDAY' | 'SICK_LEAVE')[] = ['AVAILABLE', 'UNAVAILABLE', 'HOLIDAY', 'SICK_LEAVE'];
    const currentIdx = types.indexOf(cell.availability?.type || 'AVAILABLE');
    const nextType = types[(currentIdx + 1) % types.length];
    
    cell.availability = { type: nextType };
    this.api.setFullDayAvailability('me', cell.date, nextType).subscribe();
  }

  getShortLabel(type: string): string {
    const labels: Record<string, string> = {
      AVAILABLE: 'DISPONIBLE',
      UNAVAILABLE: 'NO DISP.',
      HOLIDAY: 'VACACIONES',
      SICK_LEAVE: 'BAJA/INCID.'
    };
    return labels[type] || type;
  }

  getAvatarColor(name: string): string {
    const colors = ['#4338ca', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  private getRandomMockAvailability(day: number): { type: 'AVAILABLE' | 'UNAVAILABLE' | 'HOLIDAY' | 'SICK_LEAVE' } {
     if (day % 12 === 0) return { type: 'UNAVAILABLE' };
     if (day % 15 === 0) return { type: 'HOLIDAY' };
     if (day % 25 === 0) return { type: 'SICK_LEAVE' };
     return { type: 'AVAILABLE' };
  }
}
