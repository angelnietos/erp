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
  JOSANZ_TIME_HOURS,
  JOSANZ_TIME_MINUTES,
  josanzFormatTimeLabel,
} from './josanz-datetime-utils';

@Component({
  selector: 'josanz-form-time-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './josanz-form-time-field.html',
  styleUrl: './josanz-form-time-field.css',
})
export class JosanzFormTimeFieldComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() placeholder = '00:00';
  @Input() controlName = '';
  @Input() parentForm!: FormGroup;
  @Input() shape?: JosanzControlShape;
  @Input() required = false;

  readonly panelOpen = signal(false);
  readonly displayValue = signal('');
  readonly hours = JOSANZ_TIME_HOURS;
  readonly minutes = JOSANZ_TIME_MINUTES;

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

  get selectedHour(): string {
    const [hour] = String(this.control?.value ?? '00:00').split(':');
    return (hour ?? '00').padStart(2, '0');
  }

  get selectedMinute(): string {
    const [, minute] = String(this.control?.value ?? '00:00').split(':');
    const normalized = (minute ?? '00').padStart(2, '0');
    return this.minutes.includes(normalized) ? normalized : '00';
  }

  fieldCornerClass(): string {
    return josanzCornerField(this.shape ?? this.themeService.currentTheme().defaultShape);
  }

  togglePanel(event: MouseEvent): void {
    event.stopPropagation();
    if (this.control?.disabled) {
      return;
    }
    this.panelOpen.update((open) => !open);
  }

  selectHour(hour: string): void {
    this.patchTime(hour, this.selectedMinute);
  }

  selectMinute(minute: string): void {
    this.patchTime(this.selectedHour, minute);
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

  private patchTime(hour: string, minute: string): void {
    const next = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    this.control?.setValue(next);
    this.control?.markAsDirty();
  }

  private syncDisplay(value: string): void {
    this.displayValue.set(josanzFormatTimeLabel(value));
  }
}
