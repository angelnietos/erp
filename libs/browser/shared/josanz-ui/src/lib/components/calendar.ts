import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export interface JosanzCalendarDay {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvent: boolean;
}

@Component({
  selector: 'josanz-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="w-full border border-solid p-4" [ngClass]="cornerClass()" [ngStyle]="shellStyles()" [attr.aria-label]="ariaLabel || 'Calendario'">
      <header class="mb-4 flex items-center justify-between gap-3">
        <div>
          @if (eyebrow) {
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" [style.color]="'var(--josanz-text-muted)'">{{ eyebrow }}</p>
          }
          <h2 class="m-0 mt-1 text-lg font-black capitalize" [style.color]="'var(--josanz-text)'">{{ monthLabel() }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="h-9 w-9 border border-solid font-black" [ngClass]="buttonCornerClass()" [ngStyle]="navButtonStyles()" aria-label="Mes anterior" (click)="moveMonth(-1)">‹</button>
          <button type="button" class="h-9 w-9 border border-solid font-black" [ngClass]="buttonCornerClass()" [ngStyle]="navButtonStyles()" aria-label="Mes siguiente" (click)="moveMonth(1)">›</button>
        </div>
      </header>

      <div class="grid grid-cols-7 gap-1">
        @for (day of weekdayLabels; track day) {
          <div class="py-2 text-center text-[10px] font-black uppercase tracking-wider" [style.color]="'var(--josanz-text-muted)'">{{ day }}</div>
        }
        @for (cell of calendarDays(); track cell.date) {
          <button
            type="button"
            class="relative flex aspect-square items-center justify-center border border-solid text-sm font-bold transition-[background-color,border-color,filter,transform] hover:brightness-[0.98] active:scale-[0.96]"
            [ngClass]="buttonCornerClass()"
            [ngStyle]="dayStyles(cell)"
            [attr.aria-label]="'Seleccionar ' + cell.date"
            [attr.aria-pressed]="cell.isSelected"
            (click)="selectDate(cell)"
          >
            {{ cell.day }}
            @if (cell.hasEvent) {
              <span class="absolute bottom-1 h-1.5 w-1.5 rounded-full" [style.background]="accentColor()" aria-hidden="true"></span>
            }
          </button>
        }
      </div>
    </section>
  `,
})
export class CalendarComponent {
  readonly themeService = inject(JosanzThemeService);
  readonly weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  @Input() eyebrow = '';
  @Input() month = '';
  @Input() selectedDate = '';
  @Input() eventDates: string[] = [];
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() selectedDateChange = new EventEmitter<string>();
  @Output() dateSelect = new EventEmitter<string>();
  @Output() monthChange = new EventEmitter<string>();

  private visibleMonth?: Date;

  monthLabel(): string {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(this.currentMonthDate());
  }

  calendarDays(): JosanzCalendarDay[] {
    const monthDate = this.currentMonthDate();
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);
    const today = this.toIsoDate(new Date());
    const eventSet = new Set(this.eventDates);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = this.toIsoDate(date);
      return {
        date: iso,
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === month,
        isToday: iso === today,
        isSelected: iso === this.selectedDate,
        hasEvent: eventSet.has(iso),
      };
    });
  }

  moveMonth(delta: number): void {
    const current = this.currentMonthDate();
    this.visibleMonth = new Date(current.getFullYear(), current.getMonth() + delta, 1);
    const next = this.toMonthValue(this.visibleMonth);
    this.month = next;
    this.monthChange.emit(next);
  }

  selectDate(cell: JosanzCalendarDay): void {
    this.selectedDate = cell.date;
    this.selectedDateChange.emit(cell.date);
    this.dateSelect.emit(cell.date);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[32px]';
    }
    return 'rounded-3xl';
  }

  buttonCornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-full';
    }
    return 'rounded-xl';
  }

  shellStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }

  navButtonStyles(): Record<string, string> {
    return {
      backgroundColor: 'var(--josanz-bg)',
      borderColor: 'var(--josanz-border)',
      color: 'var(--josanz-text)',
    };
  }

  dayStyles(cell: JosanzCalendarDay): Record<string, string> {
    if (cell.isSelected) {
      return {
        backgroundColor: this.accentColor(),
        borderColor: this.accentColor(),
        color: '#fff',
      };
    }
    return {
      backgroundColor: cell.isToday ? `color-mix(in srgb, ${this.accentColor()} 10%, var(--josanz-surface))` : 'transparent',
      borderColor: cell.isToday ? this.accentColor() : 'transparent',
      color: cell.inCurrentMonth ? 'var(--josanz-text)' : 'var(--josanz-text-muted)',
      opacity: cell.inCurrentMonth ? '1' : '0.45',
    };
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  private currentMonthDate(): Date {
    if (this.visibleMonth) {
      return this.visibleMonth;
    }
    const source = this.month || this.selectedDate || this.toIsoDate(new Date());
    const [year, month] = source.slice(0, 7).split('-').map(Number);
    return new Date(year, (month || 1) - 1, 1);
  }

  private toMonthValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
