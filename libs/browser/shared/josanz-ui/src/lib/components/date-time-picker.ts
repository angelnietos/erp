import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-date-time-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="block w-full">
      @if (label) {
        <span class="mb-2 block text-xs font-black uppercase tracking-[0.16em]" [style.color]="'var(--josanz-text-muted)'">{{ label }}</span>
      }
      <input
        type="datetime-local"
        class="h-11 w-full border border-solid bg-transparent px-4 text-sm font-semibold outline-none transition-[border-color,box-shadow,background-color]"
        [ngClass]="cornerClass()"
        [value]="value"
        [min]="min"
        [max]="max"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || label || 'Seleccionar fecha y hora'"
        [ngStyle]="inputStyles()"
        (input)="onInput($event)"
      />
      @if (hint) {
        <span class="mt-2 block text-xs" [style.color]="'var(--josanz-text-muted)'">{{ hint }}</span>
      }
    </label>
  `,
})
export class DateTimePickerComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Fecha y hora';
  @Input() value = '';
  @Input() min = '';
  @Input() max = '';
  @Input() hint = '';
  @Input() disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-full';
    }
    return 'rounded-xl';
  }

  inputStyles(): Record<string, string> {
    return {
      backgroundColor: 'var(--josanz-surface)',
      borderColor: 'var(--josanz-border)',
      color: 'var(--josanz-text)',
    };
  }

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value = next;
    this.valueChange.emit(next);
  }
}
