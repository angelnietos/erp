import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import type { JosanzControlShape } from '../josanz-control-styles';
import { josanzCornerField } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';
import {
  josanzControlErrorMessage,
  josanzControlHasError,
  josanzControlIsRequired,
} from '../validators/josanz-form-validators';
import {
  josanzBuildCalendarMonth,
  josanzFormatDateLabel,
  josanzIsoDate,
  type JosanzCalendarCell,
} from './josanz-datetime-utils';

@Component({
  selector: 'josanz-form-date-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './josanz-form-date-field.html',
  styleUrl: './josanz-form-date-field.css',
})
export class JosanzFormDateFieldComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() placeholder = 'dd/mm/aaaa';
  @Input() controlName = '';
  @Input() parentForm!: FormGroup;
  @Input() shape?: JosanzControlShape;
  @Input() required = false;

  readonly panelOpen = signal(false);
  readonly visibleMonth = signal<Date>(new Date());
  readonly displayValue = signal('');

  private valueSub?: Subscription;

  ngOnInit(): void {
    const control = this.control;
    if (control) {
      this.syncDisplay(String(control.value ?? ''));
      this.valueSub = control.valueChanges.subscribe((value) => {
        this.syncDisplay(String(value ?? ''));
      });
    }
  }

  ngOnDestroy(): void {
    this.valueSub?.unsubscribe();
  }

  get control() {
    return this.parentForm?.get(this.controlName) ?? null;
  }

  get showRequiredMarker(): boolean {
    return this.required || josanzControlIsRequired(this.control);
  }

  get hasError(): boolean {
    return josanzControlHasError(this.control);
  }

  get errorText(): string {
    return josanzControlErrorMessage(this.control);
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
      this.visibleMonth(),
    );
  }

  get calendarDays(): JosanzCalendarCell[] {
    const selected = String(this.control?.value ?? '').slice(0, 10);
    return josanzBuildCalendarMonth(this.visibleMonth(), selected);
  }

  fieldCornerClass(): string {
    return josanzCornerField(this.shape ?? this.themeService.currentTheme().defaultShape);
  }

  togglePanel(event: MouseEvent): void {
    event.stopPropagation();
    if (this.control?.disabled) {
      return;
    }
    const next = !this.panelOpen();
    this.panelOpen.set(next);
    if (next) {
      const iso = String(this.control?.value ?? '').slice(0, 10);
      if (iso) {
        const [year, month] = iso.split('-').map(Number);
        this.visibleMonth.set(new Date(year, (month || 1) - 1, 1));
      } else {
        this.visibleMonth.set(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
      }
    }
  }

  moveMonth(delta: number): void {
    const current = this.visibleMonth();
    this.visibleMonth.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  selectDate(cell: JosanzCalendarCell): void {
    this.control?.setValue(cell.date);
    this.control?.markAsDirty();
    this.panelOpen.set(false);
  }

  selectToday(): void {
    const today = josanzIsoDate(new Date());
    this.control?.setValue(today);
    this.control?.markAsDirty();
    this.panelOpen.set(false);
  }

  clearDate(): void {
    this.control?.setValue('');
    this.control?.markAsDirty();
    this.panelOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.panelOpen()) {
      return;
    }
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.panelOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.panelOpen.set(false);
  }

  private syncDisplay(iso: string): void {
    this.displayValue.set(josanzFormatDateLabel(iso));
    if (iso) {
      const [year, month] = iso.slice(0, 10).split('-').map(Number);
      if (year && month) {
        this.visibleMonth.set(new Date(year, month - 1, 1));
      }
    }
  }
}
