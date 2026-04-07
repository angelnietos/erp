import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianApiService, TechnicianAvailability } from '@josanz-erp/shared-data-access';
import { LucideAngularModule, RotateCw } from 'lucide-angular';

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
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="availability-container animate-fade-in">
      <div class="header">
        <div>
          <h2 class="title">Calendario de Disponibilidad</h2>
          <p class="subtitle">Gestiona tus horarios y ausencias</p>
        </div>
        <div class="actions">
           <button class="btn-refresh" (click)="loadMonth()" title="Refrescar">
             <lucide-icon name="rotate-cw" size="18"></lucide-icon>
           </button>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="day-header" *ngFor="let day of ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']">
          {{ day }}
        </div>
        
        <div 
          *ngFor="let cell of calendarCells()" 
          class="calendar-cell"
          [class.other-month]="!cell.isCurrentMonth"
          [class.today]="cell.isToday"
        >
          <div class="cell-head">
            <span class="cell-day">{{ cell.day }}</span>
          </div>
          
          <div class="cell-body">
            <div 
              *ngIf="cell.availability" 
              class="status-badge"
              [class]="'status-' + (cell.availability.type || 'AVAILABLE')"
            >
              {{ getLabel(cell.availability.type || 'AVAILABLE') }}
            </div>
            
            <button 
              *ngIf="cell.isCurrentMonth"
              class="btn-toggle" 
              (click)="toggleAvailability(cell)"
            >
              Cambiar
            </button>
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item"><span class="dot status-AVAILABLE"></span> Disponible</div>
        <div class="legend-item"><span class="dot status-UNAVAILABLE"></span> No Disponible</div>
        <div class="legend-item"><span class="dot status-HOLIDAY"></span> Vacaciones</div>
        <div class="legend-item"><span class="dot status-SICK_LEAVE"></span> Bajas / Incidencias</div>
      </div>
    </div>
  `,
  styles: [`
    .availability-container {
      background: var(--surface);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      backdrop-filter: blur(28px);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: var(--border-soft);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .day-header {
      background: var(--bg-tertiary);
      padding: 0.75rem;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .calendar-cell {
      background: var(--bg-secondary);
      min-height: 100px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .calendar-cell:hover {
      background: var(--surface-hover);
    }
    .calendar-cell.other-month {
      background: var(--bg-primary);
      opacity: 0.4;
    }
    .calendar-cell.today {
      border: 1px solid var(--brand);
      box-shadow: inset 0 0 10px var(--brand-glow);
    }
    .cell-day {
      font-weight: 700;
      font-size: 0.875rem;
    }
    .cell-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
    .status-badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 800;
      text-transform: uppercase;
      width: 100%;
      text-align: center;
    }
    .status-AVAILABLE { background: rgba(0, 242, 173, 0.15); color: #00f2ad; }
    .status-UNAVAILABLE { background: rgba(255, 94, 108, 0.15); color: #ff5e6c; }
    .status-HOLIDAY { background: rgba(63, 193, 255, 0.15); color: #3fc1ff; }
    .status-SICK_LEAVE { background: rgba(255, 202, 58, 0.15); color: #ffca3a; }
    
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
    }
    
    .btn-toggle {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-soft);
      color: var(--text-muted);
      font-size: 0.65rem;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .calendar-cell:hover .btn-toggle {
      opacity: 1;
    }
    .btn-toggle:hover {
      background: var(--brand);
      color: white;
      border-color: var(--brand);
    }
    
    .legend {
      display: flex;
      gap: 1.5rem;
      margin-top: 2rem;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .legend-item { display: flex; align-items: center; }
  `]
})
export class TechnicianAvailabilityComponent implements OnInit {
  private readonly api = inject(TechnicianApiService);
  
  calendarCells = signal<CalendarCell[]>([]);

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
    const types: ('AVAILABLE' | 'UNAVAILABLE' | 'HOLIDAY' | 'SICK_LEAVE')[] = ['AVAILABLE', 'UNAVAILABLE', 'HOLIDAY', 'SICK_LEAVE'];
    const currentIdx = types.indexOf(cell.availability?.type || 'AVAILABLE');
    const nextType = types[(currentIdx + 1) % types.length];
    
    cell.availability = { type: nextType };
    
    this.api.setFullDayAvailability('me', cell.date, nextType).subscribe();
  }

  getLabel(type: string) {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disponible',
      UNAVAILABLE: 'No disp.',
      HOLIDAY: 'Vacaciones',
      SICK_LEAVE: 'Incidencia'
    };
    return labels[type] || type;
  }

  private getRandomMockAvailability(day: number): { type: 'AVAILABLE' | 'UNAVAILABLE' | 'HOLIDAY' | 'SICK_LEAVE' } {
     if (day % 10 === 0) return { type: 'UNAVAILABLE' };
     if (day % 15 === 0) return { type: 'HOLIDAY' };
     return { type: 'AVAILABLE' };
  }
}
