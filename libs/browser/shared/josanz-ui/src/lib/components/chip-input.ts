import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-chip-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <span
        class="flex min-h-11 w-full flex-wrap items-center gap-2 border border-solid px-3 py-2"
        [ngClass]="cornerClass()"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="'var(--josanz-stroke-field)'"
      >
        @for (chip of values; track chip) {
          <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" [style.backgroundColor]="chipBackground()" [style.color]="accentColor()">
            {{ chip }}
            <button type="button" class="border-0 bg-transparent p-0 text-current opacity-70" aria-label="Quitar" [disabled]="disabled" (click)="remove(chip)">×</button>
          </span>
        }
        <input
          class="min-w-[120px] flex-1 border-0 bg-transparent text-sm font-bold outline-none"
          [style.color]="'var(--josanz-text)'"
          [placeholder]="placeholder"
          [value]="draft"
          [disabled]="disabled"
          (keydown.enter)="addFromDraft()"
          (input)="draft = $any($event.target).value"
          (blur)="markTouched()"
        />
      </span>
    </label>
  `,
})
export class ChipInputComponent extends JosanzValueAccessorBase<string[]> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Etiquetas';
  @Input() placeholder = 'Añadir etiqueta...';
  @Input() values: string[] = [];
  @Input() override disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  @Output() valuesChange = new EventEmitter<string[]>();

  draft = '';

  override writeValue(value: string[] | null): void {
    this.values = Array.isArray(value) ? value : [];
  }

  remove(chip: string): void {
    this.values = this.values.filter((value) => value !== chip);
    this.emitChange(this.values);
    this.valuesChange.emit(this.values);
  }

  addFromDraft(): void {
    const next = this.draft.trim();
    if (!next || this.values.includes(next)) {
      return;
    }
    this.values = [...this.values, next];
    this.draft = '';
    this.emitChange(this.values);
    this.valuesChange.emit(this.values);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : shape === 'pill' ? 'rounded-full' : 'rounded-[var(--josanz-radius-control)]';
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  chipBackground(): string {
    return `color-mix(in srgb, ${this.accentColor()} 14%, var(--josanz-surface))`;
  }
}
